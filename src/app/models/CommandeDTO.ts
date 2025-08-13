export interface CommandeDTO {
  id?: number;
  numeroCommande: string;
  quantite: number;
  largeur: number;   // mm
  longueur: number;  // mm
  epaisseur: number; // mm
  modeleName?: string;

  // Champs optionnels exposés par l’API (si présents)
  poidsNecessaire?: number;
  poidsReserve?: number;
  poidsConsomme?: number;
}
