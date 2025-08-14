import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { filter, map, Observable } from 'rxjs';
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
// ▶ Rechercher les rouleaux disponibles par laize et poids minimum
searchRouleauxByLaizeAndPoidsMin(laize: number, poidsMin: number): Observable<RouleauImport[]> {
  const url = `${this.apiUrl}/search?laize=${laize}&poidsMin=${poidsMin}`;
  return this.http.get<RouleauImport[]>(url);
}

  // ▶ Ajouter un rouleau à un import
  addRouleauToImport(importId: number, rouleau: RouleauImport): Observable<RouleauImport> {
    return this.http.post<RouleauImport>(`${this.apiUrl}/${importId}/rouleaux`, rouleau);
  }
  uploadFacture(importId: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file, file.name); // le nom du champ DOIT être "file"
    return this.http.post<void>(`${this.apiUrl}/${importId}/fichier/upload`, form);
  }
  uploadPackingList(importId: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file, file.name); // le nom du champ DOIT être "file"
    return this.http.post<void>(`${this.apiUrl}/${importId}/packing-list/upload`, form);
  }

  uploadFactureWithProgress(importId: number, file: File): Observable<number> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post(`${this.apiUrl}/${importId}/fichier/upload`, form, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(evt => evt.type === HttpEventType.UploadProgress || evt.type === HttpEventType.Response),
      map(evt => {
        if (evt.type === HttpEventType.UploadProgress) {
          const percent = evt.total ? Math.round((100 * evt.loaded) / evt.total) : 0;
          return percent;
        }
        // Réponse finale (202/200) => 100%
        return 100;
      })
    );
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
listRouleaux(importId: number) {
  return this.http.get<RouleauImport[]>(`${this.apiUrl}/${importId}/rouleaux`);
}


}
