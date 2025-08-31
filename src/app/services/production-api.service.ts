// src/app/services/production-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ProductionDTO {
  id?: number;
  commandeId: number;
  dateProduction: string; // 'YYYY-MM-DD'
  quantite: number;
}

@Injectable({ providedIn: 'root' })
export class ProductionApiService {
  constructor(private http: HttpClient) {}

  private join(base: string, path: string) {
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const p = path.startsWith('/') ? path.slice(1) : path;
    return `${b}/${p}`;
  }

  private base = this.join(environment.apiUrl, 'commandes');

  listBetween(commandeId: number, start: string, end: string): Observable<ProductionDTO[]> {
    const params = new HttpParams().set('start', String(start)).set('end', String(end));
    return this.http.get<ProductionDTO[]>(
      this.join(this.base, `${commandeId}/production/between`),
      { params }
    );
  }

  total(commandeId: number): Observable<number> {
    return this.http.get<number>(this.join(this.base, `${commandeId}/production/total`));
  }

  remaining(commandeId: number): Observable<number> {
    return this.http.get<number>(this.join(this.base, `${commandeId}/production/remaining`));
  }

  create(commandeId: number, dto: Omit<ProductionDTO, 'id'>): Observable<ProductionDTO> {
    return this.http.post<ProductionDTO>(this.join(this.base, `${commandeId}/production`), dto);
  }

  setDaily(commandeId: number, date: string, qty: number): Observable<ProductionDTO> {
    const params = new HttpParams().set('qty', String(qty));
    return this.http.put<ProductionDTO>(this.join(this.base, `${commandeId}/production/day/${date}`), null, { params });
  }

  addToDay(commandeId: number, date: string, delta: number): Observable<ProductionDTO> {
    const params = new HttpParams().set('delta', String(delta));
    return this.http.post<ProductionDTO>(this.join(this.base, `${commandeId}/production/day/${date}/add`), null, { params });
  }

  /** 🔥 Supprimer réellement la ligne de production (par id) */
  deleteDay(commandeId: number, id: number): Observable<void> {
    return this.http.delete<void>(this.join(this.base, `${commandeId}/production/${id}`));
  }

  // Helpers
  getDailyTotal(commandeId: number, dateISO: string): Observable<number> {
    return this.listBetween(commandeId, dateISO, dateISO).pipe(map(rows => rows?.[0]?.quantite ?? 0));
  }
  setDayTotal(commandeId: number, dateISO: string, totalWanted: number) {
    return this.setDaily(commandeId, dateISO, Math.max(0, Number(totalWanted) || 0));
  }
  aggregateByDate(commandeId: number, startISO: string, endISO: string): Observable<{ dateProduction: string; quantite: number }[]> {
    return this.listBetween(commandeId, startISO, endISO).pipe(
      map(rows => (rows ?? [])
        .sort((a, b) => a.dateProduction.localeCompare(b.dateProduction))
        .map(r => ({ dateProduction: r.dateProduction, quantite: r.quantite || 0 }))
      )
    );
  }
}
