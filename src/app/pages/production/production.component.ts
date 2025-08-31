import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductionStoreService, ProductionJour } from 'src/app/services/production-store.service';

interface DailyRow {
  dateProduction: string; // yyyy-MM-dd
  quantite: number;       // somme de tous les shifts ce jour-là
}

@Component({
  selector: 'app-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss']
})
export class ProductionComponent implements OnInit {
  commandeId!: number;

  // cible (quantité de la commande) — en local pour l’instant (modifiable dans l’UI)
  target = 0;

  total = 0;
  remaining = 0;
  progress = 0; // 0..100

  // formulaire d’ajout/modif simple
  formDate: Date = new Date();
  formQty = 100;

  // tableau (agrégé par jour)
  daily: DailyRow[] = [];
  loading = false;

  // helpers
  todayISO = this.toISO(new Date());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: ProductionStoreService
  ) {}

  ngOnInit(): void {
    this.commandeId = +this.route.snapshot.paramMap.get('id')!;
    this.target = this.loadTarget();
    this.refresh();
  }

  // ====== CORE ======
  refresh() {
    this.loading = true;
    const list: ProductionJour[] = this.store.list(this.commandeId);

    // total produit
    this.total = list.reduce((s, r) => s + (r.quantite || 0), 0);

    // agrégation par date
    const byDate: Record<string, number> = {};
    for (const r of list) {
      byDate[r.dateProduction] = (byDate[r.dateProduction] || 0) + (r.quantite || 0);
    }
    this.daily = Object.keys(byDate)
      .sort() // asc
      .map(d => ({ dateProduction: d, quantite: byDate[d] }));

    // stats
    this.remaining = Math.max(0, (this.target || 0) - this.total);
    this.progress = this.target > 0 ? Math.min(100, Math.round((this.total / this.target) * 100)) : 0;

    this.loading = false;
  }

  // ====== ACTIONS ======
  addToDay(delta: number) {
    const d = this.toISO(this.formDate);
    // on ajoute delta au jour (crée si absent) en utilisant une ligne shift MATIN
    const dayRows = this.store.list(this.commandeId).filter(r => r.dateProduction === d);
    const matin = dayRows.find(r => r.shift === 'MATIN');
    if (matin) {
      this.store.update(this.commandeId, { ...matin, quantite: Math.max(0, (matin.quantite || 0) + delta) });
    } else {
      this.store.add(this.commandeId, {
        dateProduction: d,
        shift: 'MATIN',
        quantite: Math.max(0, delta),
        machine: '',
        operateur: '',
        commentaire: ''
      });
    }
    this.refresh();
  }

  setDay(totalWanted: number) {
    const d = this.toISO(this.formDate);
    const current = this.getDailyTotal(d);
    const delta = (totalWanted || 0) - current;
    this.addToSpecificDay(d, delta);
  }

  // mise à jour depuis la table (on définit le total du jour)
  onEditRow(r: DailyRow) {
    const newTotal = Math.max(0, Number(r.quantite || 0));
    const current = this.getDailyTotal(r.dateProduction);
    const delta = newTotal - current;
    this.addToSpecificDay(r.dateProduction, delta);
  }

  // remet la journée à 0
  zeroDay(r: DailyRow) {
    const current = this.getDailyTotal(r.dateProduction);
    if (current !== 0) {
      this.addToSpecificDay(r.dateProduction, -current);
    }
  }

  // ====== HELPERS ======
  private addToSpecificDay(dateISO: string, delta: number) {
    if (delta === 0) return;
    // applique le delta sur (ou crée) la ligne shift MATIN de ce jour
    const dayRows = this.store.list(this.commandeId).filter(rr => rr.dateProduction === dateISO);
    const matin = dayRows.find(rr => rr.shift === 'MATIN');
    if (matin) {
      this.store.update(this.commandeId, { ...matin, quantite: Math.max(0, (matin.quantite || 0) + delta) });
    } else {
      this.store.add(this.commandeId, {
        dateProduction: dateISO,
        shift: 'MATIN',
        quantite: Math.max(0, delta),
        machine: '',
        operateur: '',
        commentaire: ''
      });
    }
    this.refresh();
  }

  private getDailyTotal(dateISO: string) {
    return this.store.list(this.commandeId)
      .filter(r => r.dateProduction === dateISO)
      .reduce((s, r) => s + (r.quantite || 0), 0);
  }

  toISO(d: Date) {
    // yyyy-MM-dd (sans timezone)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toLocaleDateString('en-CA');
  }

  // gestion cible (stockée localement par commande)
  saveTarget() {
    localStorage.setItem(`target:${this.commandeId}`, String(this.target || 0));
    this.refresh();
  }
  loadTarget() {
    const v = localStorage.getItem(`target:${this.commandeId}`);
    return v ? Number(v) : 0;
  }

  back() {
    this.router.navigate(['/pages/detail-commande', this.commandeId]);
  }

  // Actions rapides
  setToday(q: number) {
    this.formDate = new Date();
    this.setDay(q);
  }
  addToday(delta: number) {
    this.formDate = new Date();
    this.addToDay(delta);
  }
}
