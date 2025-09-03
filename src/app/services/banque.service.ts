import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { CompteComptable } from './compte-comptable.service';

// 🔹 Ton modèle BanqueDTO (à adapter selon ton backend)
export interface Banque {
  id?: number;
  nom: string;
  numeroRib: string;
  compteComptable ?: CompteComptable;
  logo?: string; // URL ou base64
}

@Injectable({
  providedIn: 'root'
})
export class BanqueService {

  private apiUrl = `${environment.apiUrl}banques`;// ⚡️ adapte selon ton backend

  constructor(private http: HttpClient) {}

  // ✅ Récupérer toutes les banques
  getAllBanques(): Observable<Banque[]> {
    return this.http.get<Banque[]>(this.apiUrl);
  }

  // ✅ Récupérer une banque par ID
  getBanqueById(id: number): Observable<Banque> {
    return this.http.get<Banque>(`${this.apiUrl}/${id}`);
  }

  // ✅ Créer une nouvelle banque
  createBanque(banque: Banque): Observable<Banque> {
    return this.http.post<Banque>(this.apiUrl, banque);
  }

  // ✅ Mettre à jour une banque
  updateBanque(id: number, banque: Banque): Observable<Banque> {
    return this.http.put<Banque>(`${this.apiUrl}/${id}`, banque);
  }

  // ✅ Supprimer une banque
  deleteBanque(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
