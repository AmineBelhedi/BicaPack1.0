import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';

/** Vue UI = DTO + champs non-API qu'on garde seulement côté front */
type RowView = CommandeDTO & {
  imageUrl?: string;   // aperçu local éventuel
  // Aliases UI pour confort de saisie
  pliL?: number;       // alias UI de plilongueur
  pliW?: number;       // alias UI de plilargeur
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
  loading = false;

  // Dialogs
  dialogVisible = false;
  deleteDialog = false;
  deleteManyDialog = false;

  // Form (UI)
  form: RowView = {
    numeroCommande: '',
    description: '',
    quantite: 0,
    largeur: 0,
    longueur: 0,
    grammage: 0,
    soufflet: 0,
    typeSac: 'FOND_V', // ✅ unifié
    pliL: 0,           // toujours saisis tels quels
    pliW: 0,
    poidsPoigner: 0,
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

  /** API -> UI : mapping direct, sans defaults conditionnels */
  private dtoToView(dto: CommandeDTO): RowView {
    return {
      ...dto,
      typeSac: dto.typeSac ?? 'FOND_V',
      pliL: dto.plilongueur ?? 0,
      pliW: dto.plilargeur  ?? 0,
      description: dto.description ?? '',
      imageUrl: (dto as any).imageUrl ?? ''
    };
  }

  /** UI -> payload strict API : toujours envoyer les deux plis tels quels */
  private viewToApiPayload(view: RowView): CommandeDTO {
    // normalisation simple (cosmétique) de l'info type pour le back
    let typeSac = ((view.typeSac as any) ?? 'FOND_V').toString().trim().toUpperCase();
    if (typeSac === 'FOND V' || typeSac === 'V') typeSac = 'FOND_V';
    if (typeSac.includes('CARR')) typeSac = 'FOND_CARRE';

    // conversions numériques + garde-fous basiques
    const quantite     = this.toNum(view.quantite, 0);
    const largeur      = this.toNum(view.largeur, 0);
    const longueur     = this.toNum(view.longueur, 0);
    const grammage     = this.toNum(view.grammage, 0);
    const soufflet     = Math.max(this.toNum(view.soufflet, 0), 0);
    const poidsPoigner = Math.max(this.toNum(view.poidsPoigner, 0), 0);

    // ⬇️ plus AUCUN défaut conditionnel sur le type
    const plilongueur  = this.toNum(view.pliL, 0);
    const plilargeur   = this.toNum(view.pliW, 0);

    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      description: (view.description ?? '').trim(),
      quantite,
      largeur,
      longueur,
      grammage,
      soufflet,

      // noms attendus par le backend
      typeSac,
      plilongueur,
      plilargeur,

      poidsPoigner,

      // champs éventuels renvoyés par l’API : on les laisse passer si présents
      poidsNecessaire: view.poidsNecessaire,
      poidsReserve: view.poidsReserve,
      poidsConsomme: view.poidsConsomme
    } as any;
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
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => { this.rows = (data || []).map(d => this.dtoToView(d)); this.loading = false; },
      error: err => { console.error('Erreur chargement commandes:', err); this.loading = false; }
    });
  }

  /* ============================ Toolbar ============================ */

  openNew() {
    this.form = {
      numeroCommande: '',
      description: '',
      quantite: 0,
      largeur: 0,
      longueur: 0,
      grammage: 0,
      soufflet: 0,
      typeSac: 'FOND_V', // info seulement
      pliL: 0,
      pliW: 0,
      poidsPoigner: 0,
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

  // Surface en cm² : toujours prendre pliL & pliW (aucune condition sur le type)
  // Surface en cm²
  private surfaceUnitaireFromRow(c: RowView): number {
    const L  = Number(c.longueur ?? 0);
    const W  = Number(c.largeur ?? 0);
    const v  = Math.max(Number(c.soufflet ?? 0), 0);

    const typeSac = (c.typeSac as any) || 'FOND_V';
    const isCarre = typeSac === 'FOND_CARRE';

    const pliL = Number(c.pliL ?? 0);
    const pliW = Number(c.pliW ?? 0);

    const L_eff = isCarre ? (L + v / 2 + pliL) : (L + pliL);
    const W_eff = (W + v) * 2 + pliW;

    return L_eff * W_eff;
  }



  // Poids d’un sac en grammes (g)
  calculPoidsUnitaireFromRow(c: RowView): number {
    const surfaceCm2   = this.surfaceUnitaireFromRow(c);
    const grammageGm2  = Number(c.grammage ?? 0);
    const poidsPoigner = Math.max(Number(c.poidsPoigner ?? 0), 0); // g

    if (!(surfaceCm2 > 0) || !(grammageGm2 > 0)) return poidsPoigner;

    const poidsFeuilleG = (surfaceCm2 * grammageGm2) / 10_000; // g
    return poidsFeuilleG + poidsPoigner;
  }

  // Formatage simple en grammes avec 2–3 décimales
  formatGrams(v: number | null | undefined, digits: number = 2): string {
    const x = Number(v ?? 0);
    return x.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: digits,
      maximumFractionDigits: 3
    }) + ' g';
  }
}
