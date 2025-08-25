export interface CommandeDTO {
  id?: number;
  numeroCommande: string;
  quantite: number;
  largeur: number;  
  longueur: number;  
  grammage: number; 
  soufflet : number ; 
  pli : number ;
  poidsPoigner : number ; 
  description: string;
    imageSac ?: string ; 
  // Champs optionnels exposés par l’API (si présents)
  poidsNecessaire?: number;
  poidsReserve?: number;
  poidsConsomme?: number;
}
