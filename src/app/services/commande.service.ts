import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CommandeModel } from '../models/commande.model';

const LS_KEY = 'bicapack_commandes_v1';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private load(): CommandeModel[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return this.seed();
      const parsed = JSON.parse(raw) as CommandeModel[];
      return parsed.map(c => ({ ...c, dateCommande: new Date(c.dateCommande) }));
    } catch {
      return this.seed();
    }
  }

  private persist(list: CommandeModel[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  }

  private seed(): CommandeModel[] {
    const demo: CommandeModel[] = [
      {
        id: 1,
        numeroCommande: 'CMD-2025-001',
        nomCommande: 'Boîtes carton Type A',
        quantite: 1200,
        client: 'Client A',
        dateCommande: new Date(),
        statut: 'Brouillon',
        imageUrl: ''
      },
      {
        id: 2,
        numeroCommande: 'CMD-2025-002',
        nomCommande: 'Boîtes luxe dorure',
        quantite: 500,
        client: 'Denim Cool SL',
        dateCommande: new Date(),
        statut: 'Confirmée'
      }
    ];
    this.persist(demo);
    return demo;
  }

  /* —— CRUD —— */
  getAll(): Observable<CommandeModel[]> {
    return of(this.load()).pipe(delay(120));
  }

  create(payload: CommandeModel): Observable<CommandeModel> {
    const list = this.load();
    const created = { ...payload, id: this.nextId(list) };
    const next = [created, ...list];
    this.persist(next);
    return of(created).pipe(delay(120));
  }

  update(payload: CommandeModel): Observable<CommandeModel> {
    const list = this.load();
    const next = list.map(c => (c.id === payload.id ? { ...c, ...payload } : c));
    this.persist(next);
    return of(payload).pipe(delay(120));
  }

  delete(id: number): Observable<void> {
    const list = this.load().filter(c => c.id !== id);
    this.persist(list);
    return of(void 0).pipe(delay(120));
  }

  deleteMany(ids: number[]): Observable<void> {
    const set = new Set(ids);
    const list = this.load().filter(c => !set.has(c.id!));
    this.persist(list);
    return of(void 0).pipe(delay(120));
  }

  private nextId(all: CommandeModel[]): number {
    return (all.reduce((m, c) => Math.max(m, c.id || 0), 0) || 0) + 1;
  }
}
