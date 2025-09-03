import { CommandeDTO } from "./CommandeDTO";

export interface AffectationLigneFacture {
    id?: number;
    pourcentage: number;         // 0–100
    montantAffecte: number;      // calculé automatiquement côté backend
    commande: CommandeDTO;          // Commande associée
    createdBy?: string;
    createdAt?: Date;
  }