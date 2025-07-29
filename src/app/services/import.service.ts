import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  private apiUrl = 'http://localhost:8080/api/imports'; // adapte selon ton backend

  constructor(private http: HttpClient) {}

  getImportById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  saveImport(importData: any): Observable<any> {
    return this.http.post(this.apiUrl, importData);
  }

  updateImport(id: number, importData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, importData);
  }

  uploadImportFile(file: File, importId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${importId}/upload`, formData);
  }

  deleteRouleau(importId: number, rouleauId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${importId}/rouleaux/${rouleauId}`);
  }
}
