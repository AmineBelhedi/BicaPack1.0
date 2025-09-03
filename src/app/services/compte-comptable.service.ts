import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

// ✅ Définition du modèle
export interface CompteComptable {
  id?: number;
  numeroCompte: string;
  taux ?: number ; 
  intitule: string;
  type ?: string ; 
  name ?: string ; 
}

@Injectable({
  providedIn: 'root'
})
export class CompteComptableService {

  private apiUrl = `${environment.apiUrl}comptes`;

  constructor(private http: HttpClient) {}

  // ✅ Récupérer tous les comptes
  getAll(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl);
  }
  getAllCredit(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allCredit");
  }
  getAllDebit(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allDebit");
  }
  getAllCompteClient(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allCompteClient");
  }
    getAllCompteComptableFactureVente(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allCompteComptableFactureVente");
  }
  getAllRetenue(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allRetenue");
  }
  getAllCompteComptableBanques(): Observable<CompteComptable[]> {
    return this.http.get<CompteComptable[]>(this.apiUrl+"/allComptesBanque");
  }
  // ✅ Récupérer un compte par ID
  getById(id: number): Observable<CompteComptable> {
    return this.http.get<CompteComptable>(`${this.apiUrl}/${id}`);
  }

  // ✅ Créer un compte
  create(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl, compte);
  }
  createCompteCredit(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/credit', compte);
  }
  createCompteDebit(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/debit', compte);
  }
  createCompteRetenue(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/retenue', compte);
  }
  createCompteComptable(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/compteBanque', compte);
  }
  createCompteClient(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/compteClient', compte);
  }
  createCompteComptableFactureVente(compte: CompteComptable): Observable<CompteComptable> {
    return this.http.post<CompteComptable>(this.apiUrl+'/compteComptableFactureVente', compte);
  }
  // ✅ Mettre à jour un compte
  update(id: number, compte: CompteComptable): Observable<CompteComptable> {
    return this.http.put<CompteComptable>(`${this.apiUrl}/${id}`, compte);
  }

  // ✅ Supprimer un compte
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
