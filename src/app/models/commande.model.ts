export type StatutCommande = 'Confirmée' | 'En production' | 'Livrée' | 'Annulée';

export interface PieceJointe {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface CommandeModel {
  id?: number;
  numeroCommande: string;
  nomCommande: string;
  quantite: number;
  dateCommande: Date | string;
  statut: StatutCommande;
  imageUrl?: string;

  // optionnel si tu utilises ces champs dans la page détail
  rouleaux?: string[];
  piecesJointes?: PieceJointe[];
}
