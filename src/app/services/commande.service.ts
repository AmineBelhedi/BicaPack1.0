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
  getAllOkFacturation(): Observable<CommandeDTO[]> { return this.http.get<CommandeDTO[]>(`${this.baseUrl}/facturees`); }
  getAllOkExport(): Observable<CommandeDTO[]> { return this.http.get<CommandeDTO[]>(`${this.baseUrl}/exporte`); }
  getAllNonExportNonFacturation(): Observable<CommandeDTO[]> { return this.http.get<CommandeDTO[]>(`${this.baseUrl}/non-facturees-et-non-exporte`); }

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

  reserver(commandeId: number , rouleauId : number  , poids : number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/${rouleauId}/${poids}/reserver`, null);
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
getByExportStatus(status: string): Observable<CommandeDTO[]> {
  return this.http.get<CommandeDTO[]>(`${this.baseUrl}/export-status/${status}`);
}

updateExportStatus(commandeId: number, status: string): Observable<string> {
  return this.http.put(`${this.baseUrl}/${commandeId}/export-status?status=${status}`, null, { responseType: 'text' });
}

  uploadImage(commandeId: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file, file.name); // le nom du champ DOIT être "file"
    return this.http.post<void>(`${this.baseUrl}/${commandeId}/fichier/upload`, form);
  }

  addAllocation(commandeId: number, payload: { rouleauId: number; poidsReserve: number }) {
    return this.http.post<RouleauCommandeDTO>(
      `${this.baseUrl}/${commandeId}/allocations`,
      payload
    );
  }

  consumeAllocation(commandeId: number, allocationId: number) {
    return this.http.post<RouleauCommandeDTO>(
      `${this.baseUrl}/${commandeId}/allocations/${allocationId}/consommer`,
      null
    );
  }

  deleteAllocation(commandeId: number, allocationId: number) {
    return this.http.delete<void>(
      `${this.baseUrl}/${commandeId}/allocations/${allocationId}`
    );
  }

  /* === ✅ Nouveaux endpoints === */
  updateExport(commandeId: number, okExport: boolean): Observable<string> {
    return this.http.put(`${this.baseUrl}/${commandeId}/export?okExport=${okExport}`, null, { responseType: 'text' });
  }

  updateFacturation(commandeId: number, okFacturation: boolean): Observable<string> {
    return this.http.put(`${this.baseUrl}/${commandeId}/facturation?okFacturation=${okFacturation}`, null, { responseType: 'text' });
  }
}
