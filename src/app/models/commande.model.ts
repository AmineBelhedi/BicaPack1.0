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
  quantite: number;

  // mm
  largeur?: number;
  longueur?: number;
  epaisseur?: number;

  // champs qui n’existent pas dans CommandeDTO -> mettre en optionnels
  nomCommande?: string;
  statut?: StatutCommande;
  dateCommande?: Date | string;
  imageUrl?: string;

  // extras optionnels
  modeleName?: string;
  rouleaux?: string[];
  piecesJointes?: PieceJointe[];
}
