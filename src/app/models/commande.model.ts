export type StatutCommande = 'Brouillon' | 'Confirmée' | 'En production' | 'Livrée' | 'Annulée';

export interface CommandeModel {
  id?: number;
  numeroCommande: string;
  nomCommande: string;
  quantite: number;
  client?: string;
  dateCommande: Date | string;
  statut?: StatutCommande;
  imageUrl?: string; // URL ou base64
}
