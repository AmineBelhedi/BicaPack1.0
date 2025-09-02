// src/app/services/production-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { Subject } from 'rxjs';

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



  constructor(private http: HttpClient ) {}

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



  create(commandeId: number, dto: Omit<ProductionDTO, 'id'>): Observable<ProductionDTO> {
    return this.http.post<ProductionDTO>(this.join(this.base, `${commandeId}/production`), dto);
  }

  update(commandeId: number, id: number, dto: ProductionDTO): Observable<ProductionDTO> {
    return this.http.put<ProductionDTO>(this.join(this.base, `${commandeId}/production/${id}`), dto);
  }

  remove(commandeId: number, id: number): Observable<void> {
    return this.http.delete<void>(this.join(this.base, `${commandeId}/production/${id}`));
  }
  changed$ = new Subject<number>();
}
