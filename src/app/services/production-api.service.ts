// src/app/services/production-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface ProductionDTO {
  id?: number;
  commandeId: number;
  dateProduction: string; // 'YYYY-MM-DD'
  quantite: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductionApiService {
  // ===== Event bus : notifie l’ID de la commande dont la production a changé
  private _changed$ = new Subject<number>();
  /** À écouter dans CommandeComponent: this.prodApi.changed$.subscribe(cmdId => ...) */
  changed$ = this._changed$.asObservable();

  constructor(private http: HttpClient) {}

  // ===== Utils
  private join(base: string, path: string) {
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const p = path.startsWith('/') ? path.slice(1) : path;
    return `${b}/${p}`;
  }
  private base = this.join(environment.apiUrl, 'commandes');

  // ===== Read
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

  // ===== Write (+ notification automatique)
  create(commandeId: number, dto: Omit<ProductionDTO, 'id'>): Observable<ProductionDTO> {
    return this.http.post<ProductionDTO>(this.join(this.base, `${commandeId}/production`), dto)
      .pipe(tap(() => this.notifyChanged(commandeId)));
  }

  update(commandeId: number, id: number, dto: ProductionDTO): Observable<ProductionDTO> {
    return this.http.put<ProductionDTO>(this.join(this.base, `${commandeId}/production/${id}`), dto)
      .pipe(tap(() => this.notifyChanged(commandeId)));
  }

  remove(commandeId: number, id: number): Observable<void> {
    return this.http.delete<void>(this.join(this.base, `${commandeId}/production/${id}`))
      .pipe(tap(() => this.notifyChanged(commandeId)));
  }

  // ===== Emetteur manuel (utile si une autre méthode modifie la prod)
  notifyChanged(commandeId: number) {
    this._changed$.next(commandeId);
  }
}
