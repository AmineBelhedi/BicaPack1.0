import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';
import { ProductionApiService } from 'src/app/services/production-api.service';

// Vue UI = DTO + champs non-API + champs calculés
type RowView = CommandeDTO & {
  imageUrl?: string;
  // Aliases UI
  pliL?: number;
  pliW?: number;
  // ✅ Champs calculés (une seule fois par ligne)
  prodTotal?: number;  // total produit cumulé
  prodToday?: number;  // produit aujourd’hui
  nombreDeColis?: number; // AJOUTÉ
  prixColis?: number;
};

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
  providers: [MessageService]
})
export class CommandeComponent implements OnInit, OnDestroy {
  rows: RowView[] = [];
  selected: RowView[] = [];
  rowsPerPageOptions = [10, 20, 30];
  loading = false;

  // Vue Table/Card
  @ViewChild('dt') dt?: Table;
  viewMode: 'table' | 'card' = (localStorage.getItem('cmdView') as any) || 'table';

  // Paginator Card
  cardFirst = 0;
  cardRows  = 12;
  cardRowsOptions = [8, 12, 16, 24];

  // Subscriptions
  private prodSub?: Subscription;

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
    typeSac: 'FOND_V',
    pliL: 0,
    pliW: 0,
    poidsPoigner: 0,
    imageUrl: ''
  };

  // Delete courant
  current!: RowView;

  // Upload image
  selectedFileName: string | null = null;

  // ✅ Gardes anti-doublons d’appels + date du jour calculée une fois
  private inflightToday = new Set<number>();
  private inflightTotal = new Set<number>();
  private todayIso = this.todayISO();

  constructor(
    private svc: CommandeService,
    private toast: MessageService,    private confirmationService: ConfirmationService
,
    private prodApi: ProductionApiService,
    private router: Router
  ) {}

  /* ============================ INIT ============================ */

  ngOnInit(): void {
    this.getAll();

    // ⚡️ refresh ciblé quand la production change (event bus du service)
    this.prodSub = this.prodApi.changed$.subscribe((cmdId) => {
      if (!cmdId) return;
      const row = this.rows.find(r => r.id === cmdId);
      if (row) this.loadProdStatsForRow(row);
    });
  }

  ngOnDestroy(): void {
    this.prodSub?.unsubscribe();
  }

  /* ============================ API ============================ */

   confirmerExport(commandeId: number) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment marquer cette commande comme exportée ?',
      header: 'Confirmation Export',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.svc.updateExport(commandeId, true).subscribe({
          next: res => {this.toast.add({ severity: 'success', summary: 'Export', detail: res }) ; this.getAll(); },
          error: () =>{ this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour' }) ; }
        });
      }
    });
  }
    confirmerFacturation(commandeId: number) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment passer cette commande à la facturation ?',
      header: 'Confirmation Facturation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.svc.updateFacturation(commandeId, true).subscribe({
          next: res => {this.toast.add({ severity: 'success', summary: 'Facturation', detail: res }); this.getAll();},
          error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de mettre à jour' })
        });
      }
    });
  }

  getAll() {
    this.loading = true;
    this.svc.getAllNonExportNonFacturation().subscribe({
      next: data => {
        this.rows = (data || []).map(d => this.dtoToView(d));
        this.loading = false;
        // ✅ calcule prodTotal/prodToday une seule fois par ligne
        this.refreshProdStatsForVisibleRows();
      },
      error: err => {
        console.error('Erreur chargement commandes:', err);
        this.loading = false;
      }
    });
  }

  /* ===================== Mapping API ⇄ Vue ===================== */

  private dtoToView(dto: CommandeDTO): RowView {
    return {
      ...dto,
      typeSac: dto.typeSac ?? 'FOND_V',
      pliL: dto.plilongueur ?? 0,
      pliW: dto.plilargeur  ?? 0,
      description: dto.description ?? '',
      imageUrl: (dto as any).imageUrl ?? '',
      nombreDeColis: this.getNombreDeColis(dto.quantite, dto.nombreDePieceParColis),
    prixColis: dto.prixColis
    };
  }

  private viewToApiPayload(view: RowView): CommandeDTO {
    let typeSac = ((view.typeSac as any) ?? 'FOND_V').toString().trim().toUpperCase();
    if (typeSac === 'FOND V' || typeSac === 'V') typeSac = 'FOND_V';
    if (typeSac.includes('CARR')) typeSac = 'FOND_CARRE';

    const toNum = (v: any, fb = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fb;
    };

    const quantite     = toNum(view.quantite, 0);
    const largeur      = toNum(view.largeur, 0);
    const longueur     = toNum(view.longueur, 0);
    const grammage     = toNum(view.grammage, 0);
    const soufflet     = Math.max(toNum(view.soufflet, 0), 0);
    const poidsPoigner = Math.max(toNum(view.poidsPoigner, 0), 0);
    const plilongueur  = toNum(view.pliL, 0);
    const plilargeur   = toNum(view.pliW, 0);

    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      description: (view.description ?? '').trim(),
      quantite,
      largeur,
      longueur,
      grammage,
      soufflet,
      typeSac,
      plilongueur,
      plilargeur,
      poidsPoigner,
      poidsNecessaire: view.poidsNecessaire,
      poidsReserve: view.poidsReserve,
      poidsConsomme: view.poidsConsomme
    } as any;
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
      typeSac: 'FOND_V',
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
        this.refreshProdStatsForVisibleRows();
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

  askDelete(_: any, item: RowView) {
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
        this.refreshProdStatsForVisibleRows();
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
          // recalcul des stats pour cette ligne
          this.loadProdStatsForRow(this.rows[idx]);
          this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée', life: 2500 });
          this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 })
      });
    } else {
      this.svc.create(payload).subscribe({
        next: created => {
          const row = this.dtoToView(created);
          this.rows = [row, ...this.rows];
          // calcule les stats pour la nouvelle ligne
          this.loadProdStatsForRow(row);
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

  calculPoidsUnitaireFromRow(c: RowView): number {
    const surfaceCm2   = this.surfaceUnitaireFromRow(c);
    const grammageGm2  = Number(c.grammage ?? 0);
    const poidsPoigner = Math.max(Number(c.poidsPoigner ?? 0), 0);

    if (!(surfaceCm2 > 0) || !(grammageGm2 > 0)) return poidsPoigner;

    const poidsFeuilleG = (surfaceCm2 * grammageGm2) / 10_000;
    return poidsFeuilleG + poidsPoigner;
  }

  formatGrams(v: number | null | undefined, digits: number = 2): string {
    const x = Number(v ?? 0);
    return x.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: digits,
      maximumFractionDigits: 3
    }) + ' g';
  }

  private todayISO(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString('en-CA'); // YYYY-MM-DD
  }

  /* ======= Stats production : calcul une seule fois / gardes anti-doublons ======= */

  private loadProdStatsForRow(c: RowView) {
    if (!c?.id) return;
    const id = c.id!;

    // --- TOTAL ---
    if (!this.inflightTotal.has(id)) {
      this.inflightTotal.add(id);
      this.prodApi.total(id).pipe(
        finalize(() => this.inflightTotal.delete(id))
      ).subscribe({
        next: v => c.prodTotal = v || 0,
        error: () => c.prodTotal = 0
      });
    }

    // --- TODAY ---
    if (!this.inflightToday.has(id)) {
      this.inflightToday.add(id);
      this.prodApi.listBetween(id, this.todayIso, this.todayIso).pipe(
        finalize(() => this.inflightToday.delete(id))
      ).subscribe({
        next: rows => c.prodToday = (rows || []).reduce((s, r) => s + (r.quantite || 0), 0),
        error: () => c.prodToday = 0
      });
    }
  }

  private refreshProdStatsForVisibleRows() {
    for (const c of this.rows || []) this.loadProdStatsForRow(c);
  }

  /* ============================ View helpers ============================ */

  getRowActions(row: any): MenuItem[] {
    return [
      {
        label: 'Détails',
        icon: 'pi pi-eye',
        routerLink: ['/pages/detail-commande', row.id]
      },
      {
        label: 'Production',
        icon: 'pi pi-chart-line',
        routerLink: ['/pages/detail-commande', row.id],
        queryParams: { view: 'production' }
      },
      { separator: true },
      {
        label: 'Modifier',
        icon: 'pi pi-pencil',
        command: () => this.edit(row)
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: (event) => this.askDelete(event, row)
      }
    ];
  }

  // ---- Card view helpers ----
  get cardTotal(): number {
    return (this.dt?.filteredValue?.length ?? this.rows.length) || 0;
  }
  get cardsSlice(): RowView[] {
    const arr = (this.dt?.filteredValue ?? this.rows) as RowView[];
    return arr.slice(this.cardFirst, this.cardFirst + this.cardRows);
  }
  onCardPageChange(e: any) {
    this.cardFirst = e.first;
    this.cardRows  = e.rows;
  }

  toggleView(mode: 'table' | 'card') {
    this.viewMode = mode;
    localStorage.setItem('cmdView', mode);
    if (mode === 'card') this.cardFirst = 0;
  }
  // Ajoute la fonction utilitaire si elle n'existe pas déjà
getNombreDeColis(quantite: number, nombreDePieceParColis: number): number {
  if (!quantite || !nombreDePieceParColis || nombreDePieceParColis === 0) return 0;
  return Math.ceil(quantite / nombreDePieceParColis);
}
}
