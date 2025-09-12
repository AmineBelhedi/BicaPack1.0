export interface CommandeDTO {
  id?: number;
  numeroCommande: string;
  quantite: number;
  largeur: number;  
  longueur: number;  
  grammage: number; 
  soufflet : number ; 
  plilongueur?: number;  // cm
  plilargeur?: number;   // cm
  typeSac?: 'FOND_V' | 'FOND_CARRE' | string;
  poidsPoigner : number ; 
  description: string;
    imageSac ?: string ; 
  // Champs optionnels exposés par l’API (si présents)
  poidsNecessaire?: number;
  poidsReserve?: number;
  poidsConsomme?: number;
  okExport ?: boolean ; 
  okFacturation ?: boolean ; 
  exportStatus ?: string ; 
  poidsUnitaire ?: number ; 
  prixUnitaire?: number ; 
  prixUnitaireAvecMarge ?: number ; 
  prixUnitaireAvecPerte ?: number ; 
  prixUnitaireAvecMargeEtPerte ?: number ; 
  nombreDePieceParColis ?: number ; 
  prixColis ?: number ; 
  tauxPerte ?: number ; 
  prixKilo ?: number ; 
  prixTotal ?: number ; 
  marge ?: number ; 
}
