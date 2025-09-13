import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod'; // <-- Ajoute cet import

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = environment.apiUrl + 'commandes';  // Utilise l'URL de l'environnement

  constructor(private http: HttpClient) { }

  // Récupérer les produits pour une commande
  getProduitsByCommande(commandeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${commandeId}/produits`);
  }

  addProduitToCommande(commandeId: number, produit: { nom: string, prix: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${commandeId}/produits`, produit);
  }

  deleteProduit(commandeId: number, produitId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${commandeId}/produits/${produitId}`);
}

}
