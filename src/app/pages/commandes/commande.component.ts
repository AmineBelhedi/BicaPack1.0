import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';

/** Vue UI = DTO + champs non-API qu'on garde seulement côté front */
type RowView = CommandeDTO & {
  imageUrl?: string;
};

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
  providers: [MessageService]
})
export class CommandeComponent implements OnInit {
  rows: RowView[] = [];
  selected: RowView[] = [];
  rowsPerPageOptions = [10, 20, 30];

  // Dialogs
  dialogVisible = false;
  deleteDialog = false;
  deleteManyDialog = false;

  // Form (UI) — sans date ni statut
  form: RowView = {
    numeroCommande: '',
    quantite: 0,
    largeur: 0,
    longueur: 0,
    poidsPoigner : 0 , 
    soufflet : 0 , 
    grammage: 0,
    description: '',
    pli : 2 ,
    imageUrl: ''
  };

  // Pour confirmation Delete 1
  current!: RowView;

  // Upload image (nom du fichier sélectionné)
  selectedFileName: string | null = null;

  constructor(
    private svc: CommandeService,
    private toast: MessageService
  ) {}

  /* ===================== Mapping API ⇄ Vue ===================== */

  /** API -> UI : nomCommande = modeleName (pour l'affichage) */
  private dtoToView(dto: CommandeDTO): RowView {
    return {
      ...dto,
      description: (dto as any).nomCommande ?? dto.description ?? '',
      imageUrl: (dto as any).imageUrl ?? ''
    };
  }

  /** UI -> payload strict API (sans date/statut/image/nomCommande) */
  private viewToApiPayload(view: RowView): CommandeDTO {
    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      quantite: this.toNum(view.quantite, 0),
      largeur: this.toNum(view.largeur, 0),
      longueur: this.toNum(view.longueur, 0),
      grammage: this.toNum(view.grammage, 0),
      soufflet: this.toNum(view.soufflet, 0),
      pli: this.toNum(view.pli, 2),
      poidsPoigner: this.toNum(view.poidsPoigner, 0),
      description: (view.description ?? '').trim(),
      // Si ton backend expose ces champs, ils restent transmis tels quels :
      poidsNecessaire: view.poidsNecessaire,
      poidsReserve: view.poidsReserve,
      poidsConsomme: view.poidsConsomme
    };
  }

  private toNum(v: any, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  /* ============================ INIT ============================ */

  ngOnInit(): void {
    this.getAll();
  }

    uploading = false;
  cacheBust: number | null = null;

  getAll() {
    this.svc.getAll().subscribe({
      next: data => (this.rows = (data || []).map(d => this.dtoToView(d))),
      error: err => console.error('Erreur chargement commandes:', err)
    });
  }

  /* ============================ Toolbar ============================ */

  openNew() {
    this.form = {
      numeroCommande: '',
      quantite: 0,
      largeur: 0,
      longueur: 0,
      grammage: 0,
      description: '',
      soufflet : 0 , 
      pli : 2 ,
      poidsPoigner : 0 , 
      imageUrl: ''
    };
    this.selectedFileName = null;
    this.dialogVisible = true;
  }

  deleteSelected() {
    if (!this.selected?.length) return;
    this.deleteManyDialog = true;
  }

  confirmDeleteSelected() {
    const ids = this.selected.map(x => x.id!).filter(Boolean);
    this.svc.deleteMany(ids).subscribe({
      next: () => {
        const set = new Set(ids);
        this.rows = this.rows.filter(r => !set.has(r.id!));
        this.selected = [];
        this.toast.add({ severity: 'success', summary: 'Supprimées', detail: 'Commandes supprimées', life: 3000 });
        this.deleteManyDialog = false;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression multiple échouée', life: 3000 })
    });
  }

  /* ============================ Table ============================ */

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  edit(item: RowView) {
    this.form = { ...item };
    this.selectedFileName = null;
    this.dialogVisible = true;
  }

  askDelete(_: Event, item: RowView) {
    this.current = { ...item };
    this.deleteDialog = true;
  }

  confirmDelete() {
    if (!this.current?.id) return;
    this.svc.delete(this.current.id).subscribe({
      next: () => {
        this.rows = this.rows.filter(r => r.id !== this.current.id);
        this.toast.add({ severity: 'success', summary: 'Supprimée', detail: 'Commande supprimée', life: 3000 });
        this.deleteDialog = false;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }

  /* ============================= CRUD ============================ */

  save() {
    if (!this.form.numeroCommande?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande obligatoire', life: 2500 });
      return;
    }
    if ((this.form.quantite ?? 0) <= 0 ||
        (this.form.largeur ?? 0)  <= 0 ||
        (this.form.longueur ?? 0) <= 0 ||
        (this.form.grammage ?? 0) <  0) {
      this.toast.add({ severity: 'warn', summary: 'Vérifier les valeurs', detail: 'Quantité et dimensions', life: 2500 });
      return;
    }

    const payload = this.viewToApiPayload(this.form);

    if (this.form.id) {
      this.svc.update(payload).subscribe({
        next: updated => {
          const v = this.dtoToView(updated);
          const idx = this.rows.findIndex(r => r.id === v.id);
          if (idx >= 0) this.rows[idx] = v;
          this.rows = [...this.rows];
          this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée', life: 2500 });
          this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 })
      });
    } else {
      this.svc.create(payload).subscribe({
        next: created => {
          this.rows = [this.dtoToView(created), ...this.rows];
          this.toast.add({ severity: 'success', summary: 'Créée', detail: 'Nouvelle commande ajoutée', life: 2500 });
          this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Création échouée', life: 3000 })
      });
    }
  }

  /* ============================ Image upload (UI only) ============================ */

  onImageSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => (this.form.imageUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  /* ============================ Helpers ============================ */

  formatDimension(c: RowView): string {
    const L = c.longueur ?? '–';
    const l = c.largeur  ?? '–';
    const p = c.grammage ?? '–';
    return `${L}×${l}×${p}`;
  }
}
