import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { DocumentFacturation } from '../models/documentFacture';
import { FactureVente, FactureAchat } from '../models/facture-achat-delavage';

export interface AffectationRequest {
  commandeId: number;
  pourcentage: number;
}

export interface DeviseTotalDTO {
  devise : string ; 
  total : number ; 
}
const API_URL = `${environment.apiUrl}factures-vente`;
const API_URL_ACHAT = `${environment.apiUrl}factures-achat`;
@Injectable({
  providedIn: 'root'
})
export class FacturationService {


  constructor(private http: HttpClient) {}

  getAll(): Observable<FactureVente[]> {
    return this.http.get<FactureVente[]>(API_URL);
  }
  getTotalFacturesAchat(): Observable<DeviseTotalDTO[]> {
    return this.http.get<DeviseTotalDTO[]>(API_URL_ACHAT+'/totals');
  }
    getTotalFacturesVente(): Observable<any> {
    return this.http.get<any>(API_URL+'/totals');
  }
  getById(id: number): Observable<FactureVente> {
    return this.http.get<FactureVente>(`${API_URL}/${id}`);
  }

  create(facture: FactureVente): Observable<FactureVente> {
    return this.http.post<FactureVente>(API_URL, facture);
  }

  update(id: number, facture: FactureVente): Observable<FactureVente> {
    return this.http.put<FactureVente>(`${API_URL}/${id}`, facture);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }


  uploadFactureFile(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post(`${API_URL}/facture/${id}/upload`, formData);
  }


// getFacturesAchatPagedFiltered(
//   page: number,
//   size: number,
//   sortField: string,
//   sortOrder: string,
//   filters: { search?: string; fournisseurId?: number; exonere?: boolean }
// ): Observable<any> {
//   const params: any = {
//     page,
//     size,
//     sortField,
//     sortOrder
//   };

//   if (filters.search) params.search = filters.search;
//   if (filters.fournisseurId) params.fournisseurId = filters.fournisseurId;
//   if (filters.exonere !== undefined) params.exonere = filters.exonere;

//   return this.http.get<any>(API_URL_ACHAT+ '/page', { params });
// }

getFacturesAchatPagedFiltered(
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  filters: { search?: string; fournisseurId?: number; startDate?: string; endDate?: string }
): Observable<any> {
  const params: any = { page, size, sortField, sortOrder };

  if (filters.search) params.search = filters.search;
  if (filters.fournisseurId) params.fournisseurId = filters.fournisseurId;
  if (filters.startDate) params.startDate = filters.startDate; // format YYYY-MM-DD
  if (filters.endDate) params.endDate = filters.endDate;

  return this.http.get<any>(API_URL_ACHAT + '/page', { params });
}

// getFacturesVentePagedFiltered(
//   page: number,
//   size: number,
//   sortField: string,
//   sortOrder: string,
//   filters: { search?: string; fournisseurId?: number; exonere?: boolean }
// ): Observable<any> {
//   const params: any = {
//     page,
//     size,
//     sortField,
//     sortOrder
//   };

//   if (filters.search) params.search = filters.search;
//   if (filters.fournisseurId) params.fournisseurId = filters.fournisseurId;
//   if (filters.exonere !== undefined) params.exonere = filters.exonere;

//   return this.http.get<any>(API_URL+ '/page', { params });
// }


getFacturesVentePagedFiltered(
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  filters: { search?: string; fournisseurId?: number; startDate?: string; endDate?: string }
): Observable<any> {
  const params: any = { page, size, sortField, sortOrder };

  if (filters.search) params.search = filters.search;
  if (filters.fournisseurId) params.fournisseurId = filters.fournisseurId;
  if (filters.startDate) params.startDate = filters.startDate; // format YYYY-MM-DD
  if (filters.endDate) params.endDate = filters.endDate;

  return this.http.get<any>(API_URL + '/page', { params });
}
  // 🔹 CRUD Facture Achat
  getAllFactureAchat(): Observable<FactureAchat[]> {
    return this.http.get<FactureAchat[]>(API_URL_ACHAT);
  }

  getFactureAchatById(id: number): Observable<FactureAchat> {
    return this.http.get<FactureAchat>(`${API_URL_ACHAT}/${id}`);
  }

  createFactureAchat(facture: FactureAchat): Observable<FactureAchat> {
    return this.http.post<FactureAchat>(API_URL_ACHAT, facture);
  }

  updateFactureAchat(id: number, facture: FactureAchat): Observable<FactureAchat> {
    return this.http.put<FactureAchat>(`${API_URL_ACHAT}/${id}`, facture);
  }

  deleteFactureAchat(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL_ACHAT}/${id}`);
  }

  // 🔹 Upload d’un seul document
  uploadDocument(id: number, file: File, role: string): Observable<DocumentFacturation> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    return this.http.post<DocumentFacturation>(`${API_URL_ACHAT}/${id}/upload`, formData);
  }

  // 🔹 Upload de plusieurs documents en une seule requête
  uploadMultipleDocuments(id: number, files: File[], role: string): Observable<DocumentFacturation[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('role', role);
    return this.http.post<DocumentFacturation[]>(`${API_URL_ACHAT}/${id}/upload-multiple`, formData);
  }

  // 🔹 Supprimer un document lié à une facture
  deleteDocument( documentId: number): Observable<void> {
    return this.http.delete<void>(`${API_URL_ACHAT}/facture/${documentId}`);
  }

  affecterLigneFacture(ligneId: number, affectations: AffectationRequest[]): Observable<void> {
    return this.http.post<void>(`${API_URL_ACHAT}/lignes/${ligneId}/affectations`, affectations);
  }
}
