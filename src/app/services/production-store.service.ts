import { Injectable } from '@angular/core';

export type Shift = 'MATIN' | 'SOIR' | 'NUIT';

export interface ProductionJour {
  id: number;
  dateProduction: string;   // 'YYYY-MM-DD'
  shift: Shift;
  quantite: number;
  machine?: string;
  operateur?: string;
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductionStoreService {
  private key(commandeId: number) { return `prod:${commandeId}`; }

  // ---- lecture/écriture bas niveau
  private read(commandeId: number): ProductionJour[] {
    const raw = localStorage.getItem(this.key(commandeId));
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as ProductionJour[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  private write(commandeId: number, arr: ProductionJour[]) {
    localStorage.setItem(this.key(commandeId), JSON.stringify(arr));
  }
  private nextId(list: ProductionJour[]) {
    return list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1;
  }

  // ---- API principale
  list(commandeId: number): ProductionJour[] {
    const arr = this.read(commandeId);
    return arr.sort(
      (a, b) => a.dateProduction.localeCompare(b.dateProduction) || a.shift.localeCompare(b.shift)
    );
  }

  saveAll(commandeId: number, arr: ProductionJour[]) {
    this.write(commandeId, arr);
  }

  add(commandeId: number, row: Omit<ProductionJour, 'id'>): number {
    const list = this.read(commandeId);
    const id = this.nextId(list);
    list.push({ id, ...row });
    this.write(commandeId, list);
    return id;
  }

  update(commandeId: number, row: ProductionJour) {
    const list = this.read(commandeId);
    const idx = list.findIndex(x => x.id === row.id);
    if (idx >= 0) {
      list[idx] = { ...row };
      this.write(commandeId, list);
    }
  }

  remove(commandeId: number, id: number) {
    const list = this.read(commandeId).filter(x => x.id !== id);
    this.write(commandeId, list);
  }

  clear(commandeId: number) {
    localStorage.removeItem(this.key(commandeId));
  }

  // ---- Agrégations & utilitaires
  total(commandeId: number) {
    return this.read(commandeId).reduce((s, r) => s + (r.quantite || 0), 0);
  }

  getDailyTotal(commandeId: number, dateISO: string) {
    return this.read(commandeId)
      .filter(r => r.dateProduction === dateISO)
      .reduce((s, r) => s + (r.quantite || 0), 0);
  }

  /** Définit le total du jour (tous shifts confondus) en ajustant MATIN. */
  setDayTotal(commandeId: number, dateISO: string, totalWanted: number, defaultShift: Shift = 'MATIN') {
    const current = this.getDailyTotal(commandeId, dateISO);
    this.addToDay(commandeId, dateISO, (totalWanted || 0) - current, defaultShift);
  }

  /** Ajoute un delta au jour (crée une ligne MATIN si elle n’existe pas). */
  addToDay(commandeId: number, dateISO: string, delta: number, defaultShift: Shift = 'MATIN') {
    if (!delta) return;
    const list = this.read(commandeId);
    let row = list.find(r => r.dateProduction === dateISO && r.shift === defaultShift);
    if (!row) {
      row = { id: this.nextId(list), dateProduction: dateISO, shift: defaultShift, quantite: 0 };
      list.push(row);
    }
    row.quantite = Math.max(0, (row.quantite || 0) + delta);
    this.write(commandeId, list);
  }

  /** Retourne l’historique agrégé par date (tous shifts confondus). */
  aggregateByDate(commandeId: number): { dateProduction: string; quantite: number }[] {
    const map = new Map<string, number>();
    for (const r of this.read(commandeId)) {
      map.set(r.dateProduction, (map.get(r.dateProduction) || 0) + (r.quantite || 0));
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateProduction, quantite]) => ({ dateProduction, quantite }));
  }
}
