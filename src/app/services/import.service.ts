import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImportModel, RouleauImport } from '../models/import';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  private apiUrl = `${environment.apiUrl}imports`;

  constructor(private http: HttpClient) {}

  // ▶ Ajouter un nouvel import
  createImport(data: ImportModel): Observable<ImportModel> {
    return this.http.post<ImportModel>(this.apiUrl, data);
  }

  // ▶ Obtenir un import par ID
  getImportById(id: number): Observable<ImportModel> {
    return this.http.get<ImportModel>(`${this.apiUrl}/${id}`);
  }

  // ▶ Obtenir tous les imports
  getAllImports(): Observable<ImportModel[]> {
    return this.http.get<ImportModel[]>(this.apiUrl);
  }

  // ▶ Supprimer un import
  deleteImport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ▶ Ajouter un rouleau à un import
  addRouleauToImport(importId: number, rouleau: RouleauImport): Observable<RouleauImport> {
    return this.http.post<RouleauImport>(`${this.apiUrl}/${importId}/rouleaux`, rouleau);
  }

  // ▶ Modifier un rouleau
  updateRouleau(rouleauId: number, rouleau: RouleauImport): Observable<RouleauImport> {
    return this.http.put<RouleauImport>(`${this.apiUrl}/rouleaux/${rouleauId}`, rouleau);
  }

  // ▶ Supprimer un rouleau
  deleteRouleau(rouleauId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rouleaux/${rouleauId}`);
  }

  // ▶ Update complet (si nécessaire)
updateImport(importData: ImportModel): Observable<ImportModel> {
  return this.http.post<ImportModel>(`${this.apiUrl}`, importData); // ou PUT si ton backend supporte update par PUT
}

}
