// src/app/components/production-card/production-card.component.ts
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ProductionApiService, ProductionDTO } from 'src/app/services/production-api.service';
import { ConfirmationService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-production-card',
  templateUrl: './production-card.component.html',
  styleUrls: ['./production-card.component.scss']
})
export class ProductionCardComponent implements OnChanges ,OnInit {
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

  // Dialog édition (par ligne)
  editVisible = false;
  editModel: { id?: number; dateISO: string; qty: number | null } = { id: undefined, dateISO: '', qty: null };

  // Données (une ligne = un enregistrement)
  private rows: ProductionDTO[] = [];

  constructor(private api: ProductionApiService, private confirm: ConfirmationService , private auth : AuthService) {}
  ngOnInit(): void {
    this.getUser() ;
  }

  ngOnChanges(): void {
    const t = new Date();
    this.filterTo = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    this.filterFrom = new Date(this.filterTo);
    this.filterFrom.setDate(this.filterTo.getDate() - 30);

    if (this.commandeId != null) this.refreshAll();
  }

  // Utils dates (ISO strict)
  private toIso(d: Date): string {
    return formatDate(d, 'yyyy-MM-dd', 'en'); // ⬅️ évite 500 parsing
  }
  private isoToday(): string { return this.toIso(new Date()); }

  // Cible atteinte ?
  get isCompleted(): boolean {
    return (this.cible ?? 0) > 0 && (this.total ?? 0) >= (this.cible ?? 0) - 1e-9;
  }

  // Tri: date desc, puis id asc
  private sortRows(a: ProductionDTO, b: ProductionDTO): number {
    if (a.dateProduction < b.dateProduction) return 1;
    if (a.dateProduction > b.dateProduction) return -1;
    return (a.id ?? 0) - (b.id ?? 0);
  }

  // Chargement
  private refreshAll(): void {
    const fromISO = this.toIso(this.filterFrom);
    const toISO   = this.toIso(this.filterTo);

    this.api.listBetween(this.commandeId, fromISO, toISO).subscribe({
      next: rows => {
        this.rows = (rows ?? []).sort(this.sortRows.bind(this));

        // Aujourd’hui = somme des lignes du jour
        const tISO = this.isoToday();
        this.today = this.rows
          .filter(r => r.dateProduction === tISO)
          .reduce((s, r) => s + (r.quantite || 0), 0);

        // ✅ notifier après avoir mis à jour rows/today
        this.api.changed$.next(this.commandeId);
      },
      error: () => { this.rows = []; this.today = 0; }
    });


    this.api.total(this.commandeId).subscribe({
      next: v => {
        this.total = v || 0;
        this.progress = this.cible > 0 ? Math.min(100, Math.round((this.total / this.cible) * 100)) : 0;
        this.remain = this.cible > 0 ? Math.max(0, this.cible - this.total) : 0;

        // ✅ notifier après avoir mis à jour total/progress/remain
        this.api.changed$.next(this.commandeId);
      },
      error: () => { this.total = 0; this.progress = 0; this.remain = 0; }
    });
  }

  // Table (filtre + tri)
  get displayedRows(): ProductionDTO[] {
    const fromISO = this.toIso(this.filterFrom);
    const toISO   = this.toIso(this.filterTo);
    return (this.rows ?? [])
      .filter(r => r.dateProduction >= fromISO && r.dateProduction <= toISO)
      .sort(this.sortRows.bind(this));
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

  // Ajout
  openAdd(): void {
    if (this.isCompleted) return;
    this.addModel = { date: new Date(), qty: 100 ,};
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
    const allowed = Math.max(0, (this.cible || 0) - (this.total || 0)); // restant par rapport à la cible
    const q = this.cible > 0 ? Math.min(wanted, allowed) : wanted;

    const dto = { commandeId: this.commandeId, dateProduction: iso, quantite: q , createdBy : this.fullnameUser  } ;
    // console.log('[POST dto]', dto);

    this.api.create(this.commandeId, dto).subscribe({
      next: (created) => {
        this.addVisible = false;
        this.resetAdd();

        // Mise à jour locale (évite un nouveau GET)
        this.rows = [created, ...this.rows].sort(this.sortRows.bind(this));

        // KPIs
        this.total = (this.total || 0) + (created.quantite || 0);
        this.progress = this.cible > 0 ? Math.min(100, Math.round((this.total / this.cible) * 100)) : 0;
        if (created.dateProduction === this.isoToday()) {
          this.today += created.quantite || 0;
        }
        this.remain = this.cible > 0 ? Math.max(0, this.cible - this.total) : 0;
        // ✅ prévenir la liste des commandes
        this.api.changed$.next(this.commandeId);

      }
    });
  }


    user : User = new User() ; 
    fullnameUser : string ; 
  
    getUser(){
      this.auth.getProfile().subscribe(res=>{
        this.user = res ;
        this.fullnameUser = this.user.firstname + ' ' + this.user.lastname ;
      })
      }

  // Édition par ligne
  openEdit(row: ProductionDTO): void {
    this.editModel = { id: row.id, dateISO: row.dateProduction, qty: row.quantite };
    this.editVisible = true;
  }

  canConfirmEdit(): boolean {
    const q = Number(this.editModel.qty || 0);
    return !!this.editModel.id && !!this.editModel.dateISO && q >= 0;
  }

  cancelEdit(): void { this.editVisible = false; this.resetEdit(); }
  resetEdit(): void { this.editModel = { id: undefined, dateISO: '', qty: null }; }

  confirmEdit(): void {
    if (!this.canConfirmEdit()) return;
    const { id, dateISO } = this.editModel;
    if (id == null) return;

    const old = this.rows.find(r => r.id === id);
    const current = old?.quantite || 0;
    const wanted  = Math.max(0, Number(this.editModel.qty || 0));
    const allowedNew = this.cible > 0 ? Math.max(0, (this.cible || 0) - ((this.total || 0) - current)) : Number.MAX_SAFE_INTEGER;
    const q = this.cible > 0 ? Math.min(wanted, allowedNew) : wanted;

    this.api.update(this.commandeId, id, {
      commandeId: this.commandeId,
      dateProduction: dateISO,
      quantite: q,
      updatedBy : this.fullnameUser
    }).subscribe({
      next: (updated) => {
        const i = this.rows.findIndex(r => r.id === updated.id);
        if (i >= 0) this.rows[i] = updated;
        this.rows = [...this.rows].sort(this.sortRows.bind(this));

        // KPIs
        this.total = (this.total - current) + (updated.quantite || 0);
        const tISO = this.isoToday();
        if (dateISO === tISO) {
          this.today = this.rows
            .filter(r => r.dateProduction === tISO)
            .reduce((s, r) => s + (r.quantite || 0), 0);
        }
        this.progress = this.cible > 0 ? Math.min(100, Math.round((this.total / this.cible) * 100)) : 0;
        this.remain = this.cible > 0 ? Math.max(0, this.cible - this.total) : 0;

        this.editVisible = false;
        this.resetEdit();
        // ✅ prévenir la liste des commandes
        this.api.changed$.next(this.commandeId);

      }
    });
  }

  // Suppression par ligne
  deleteRow(row: ProductionDTO): void {
    if (row.id == null) return;

    this.confirm.confirm({
      header: 'Supprimer',
      message: `Supprimer la ligne du ${row.dateProduction} (${row.quantite | 0} pièces) ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.api.remove(this.commandeId, row.id!).subscribe({
          next: () => {
            const wasToday = row.dateProduction === this.isoToday();

            this.rows = this.rows.filter(r => r.id !== row.id);
            this.total = (this.total || 0) - (row.quantite || 0);

            if (wasToday) {
              this.today = this.rows
                .filter(r => r.dateProduction === this.isoToday())
                .reduce((s, r) => s + (r.quantite || 0), 0);
            }

            this.progress = this.cible > 0 ? Math.min(100, Math.round((this.total / this.cible) * 100)) : 0;
            this.remain = this.cible > 0 ? Math.max(0, this.cible - this.total) : 0;
            // ✅ prévenir la liste des commandes
            this.api.changed$.next(this.commandeId);

          }
        });
      }
    });
  }
}
