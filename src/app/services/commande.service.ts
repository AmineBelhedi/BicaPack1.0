import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { CommandeDTO } from '../models/CommandeDTO';
import { environment } from 'src/environments/environment.prod';

export interface RouleauCommandeDTO {
  id: number;
  commandeId: number;
  rouleauId: number;
  poidsReserve: number;
  metrageReserve?: number;
  etat: 'RESERVED' | 'CONSUMED' | 'CANCELED';
  dateAllocation?: string;
  dateConsommation?: string;
  dateAnnulation?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}commandes`; // ajuste si besoin

  /* CRUD */
  getAll(): Observable<CommandeDTO[]> { return this.http.get<CommandeDTO[]>(this.baseUrl); }
  getById(id: number): Observable<CommandeDTO> { return this.http.get<CommandeDTO>(`${this.baseUrl}/${id}`); }
  create(payload: CommandeDTO): Observable<CommandeDTO> { return this.http.post<CommandeDTO>(this.baseUrl, payload); }
  update(payload: CommandeDTO): Observable<CommandeDTO> { return this.http.put<CommandeDTO>(`${this.baseUrl}/${payload.id}`, payload); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
  deleteMany(ids: number[]): Observable<void[]> { return forkJoin(ids.map(id => this.delete(id))); }

  /* Métier */
  calculPoidsNecessaire(commandeId: number, grammage: number): Observable<void> {
    const params = new HttpParams().set('grammage', grammage);
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/calcul-poids`, null, { params });
  }

  reserver(commandeId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/reserver`, null);
  }

  consommer(commandeId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/consommer`, null);
  }

  annulerReservation(commandeId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/annuler-reservation`, null);
  }

  getAllocations(commandeId: number): Observable<RouleauCommandeDTO[]> {
    return this.http.get<RouleauCommandeDTO[]>(`${this.baseUrl}/${commandeId}/allocations`);
  }
}
