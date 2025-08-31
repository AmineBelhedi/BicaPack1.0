import { Component, Input, OnChanges } from '@angular/core';
import { ProductionApiService, ProductionDTO } from 'src/app/services/production-api.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-production-card',
  templateUrl: './production-card.component.html',
  styleUrls: ['./production-card.component.scss']
})
export class ProductionCardComponent implements OnChanges {
  @Input() commandeId!: number;
  @Input() cible = 0;

  // KPIs
  total = 0;
  today = 0;
  remain = 0;
  progress = 0;

  // Période
  filterFrom!: Date;
  filterTo!: Date;

  // Dialog ajout
  addVisible = false;
  addModel: { date: Date | null; qty: number | null } = { date: new Date(), qty: 100 };

  // Dialog édition
  editVisible = false;
  editModel: { dateISO: string; qty: number | null } = { dateISO: '', qty: null };

  // Données du back (une ligne par jour, avec id)
  private rows: ProductionDTO[] = [];

  constructor(private api: ProductionApiService, private confirm: ConfirmationService) {}

  ngOnChanges(): void {
    const t = new Date();
    this.filterTo = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    this.filterFrom = new Date(this.filterTo);
    this.filterFrom.setDate(this.filterTo.getDate() - 30);

    if (this.commandeId != null) this.refreshAll();
  }

  // ==== Utils dates
  private toIso(d: Date): string {
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dd.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
  }
  private isoToday(): string { return this.toIso(new Date()); }

  // ==== Règle métier : cible atteinte ?
  get isCompleted(): boolean {
    return (this.cible ?? 0) > 0 && (this.total ?? 0) >= (this.cible ?? 0) - 1e-9;
  }

  // ==== Chargement
  private refreshAll(): void {
    const fromISO = this.toIso(this.filterFrom);
    const toISO   = this.toIso(this.filterTo);

    this.api.listBetween(this.commandeId, fromISO, toISO).subscribe({
      next: rows => {
        this.rows = rows ?? [];
        const tISO = this.isoToday();
        this.today = this.rows.find(r => r.dateProduction === tISO)?.quantite ?? 0;
      },
      error: () => { this.rows = []; this.today = 0; }
    });

    this.api.total(this.commandeId).subscribe({
      next: v => {
        this.total = v || 0;
        this.progress = this.cible > 0 ? Math.min(100, Math.round((this.total / this.cible) * 100)) : 0;
      },
      error: () => { this.total = 0; this.progress = 0; }
    });

    this.api.remaining(this.commandeId).subscribe({
      next: v => this.remain = v || 0,
      error: () => this.remain = 0
    });
  }

  // ==== Table (tri décroissant : le plus récent en haut)
  get displayedDays(): { date: string; quantite: number }[] {
    const fromISO = this.toIso(this.filterFrom);
    const toISO   = this.toIso(this.filterTo);
    return (this.rows ?? [])
      .filter(r => r.dateProduction >= fromISO && r.dateProduction <= toISO)
      .sort((a, b) => b.dateProduction.localeCompare(a.dateProduction)) // ⬅️ décroissant
      .map(r => ({ date: r.dateProduction, quantite: r.quantite || 0 }));
  }

  onPeriodChange(): void { this.refreshAll(); }

  resetPeriod(): void {
    const t = new Date();
    this.filterTo = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    this.filterFrom = new Date(this.filterTo);
    this.filterFrom.setDate(this.filterTo.getDate() - 30);
    this.refreshAll();
  }

  quickRange(kind: '7' | '30' | '90' | 'YTD'): void {
    const t = new Date();
    const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    this.filterTo = today;

    if (kind === 'YTD') {
      this.filterFrom = new Date(today.getFullYear(), 0, 1);
    } else {
      const days = Number(kind);
      this.filterFrom = new Date(today);
      this.filterFrom.setDate(today.getDate() - days + 1);
    }
    this.refreshAll();
  }

  // ==== Ajout
  openAdd(): void {
    if (this.isCompleted) return; // sécurité
    this.addModel = { date: new Date(), qty: 100 };
    this.addVisible = true;
  }

  canConfirmAdd(): boolean {
    const q = Number(this.addModel.qty || 0);
    return !!this.addModel.date && q > 0 && !this.isCompleted;
  }

  cancelAdd(): void { this.addVisible = false; this.resetAdd(); }
  resetAdd(): void { this.addModel = { date: new Date(), qty: 100 }; }

  confirmAdd(): void {
    if (!this.canConfirmAdd()) return;

    const iso = this.toIso(this.addModel.date!);
    const wanted  = Math.max(0, Number(this.addModel.qty || 0));
    const allowed = Math.max(0, (this.cible || 0) - (this.total || 0)); // restant

    if (allowed <= 0) { this.addVisible = false; this.resetAdd(); return; }

    const q = Math.min(wanted, allowed); // on ne dépasse pas la cible

    this.api.create(this.commandeId, {
      commandeId: this.commandeId,
      dateProduction: iso,
      quantite: q
    }).subscribe({
      next: () => { this.addVisible = false; this.resetAdd(); this.refreshAll(); }
    });
  }

  // ==== Édition
  private currentQtyOf(dateISO: string): number {
    return this.rows.find(r => r.dateProduction === dateISO)?.quantite ?? 0;
  }

  editDay(dateISO: string): void {
    this.editModel = { dateISO, qty: this.currentQtyOf(dateISO) };
    this.editVisible = true;
  }

  canConfirmEdit(): boolean {
    const q = Number(this.editModel.qty || 0);
    return !!this.editModel.dateISO && q >= 0;
  }

  cancelEdit(): void { this.editVisible = false; this.resetEdit(); }
  resetEdit(): void { this.editModel = { dateISO: '', qty: null }; }

  confirmEdit(): void {
    if (!this.canConfirmEdit()) return;
    const { dateISO } = this.editModel;

    const current = this.currentQtyOf(dateISO);
    const wanted  = Math.max(0, Number(this.editModel.qty || 0));
    // total_new = total - current + wanted <= cible
    const allowedNew = Math.max(0, (this.cible || 0) - ((this.total || 0) - current));
    const q = Math.min(wanted, allowedNew);

    this.api.setDayTotal(this.commandeId, dateISO, q).subscribe({
      next: () => { this.editVisible = false; this.resetEdit(); this.refreshAll(); }
    });
  }

  // ==== Suppression
  removeDay(dateISO: string): void {
    const row = this.rows.find(r => r.dateProduction === dateISO);

    this.confirm.confirm({
      header: 'Supprimer',
      message: `Supprimer la production du ${dateISO} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        if (row?.id != null) {
          this.api.deleteDay(this.commandeId, row.id).subscribe({
            next: () => this.refreshAll()
          });
        } else {
          this.api.setDayTotal(this.commandeId, dateISO, 0).subscribe({
            next: () => this.refreshAll()
          });
        }
      }
    });
  }
}
