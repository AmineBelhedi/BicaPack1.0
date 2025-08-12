export interface CommandeDTO {
    id?: number;
    numeroCommande: string;
    quantite: number;
    largeur: number;   // mm
    longueur: number;  // mm
    epaisseur: number; // garder si tu l’utilises encore; sinon remplace par grammage côté calcul
    modeleName?: string;
  
    // si exposés par l’API (optionnel)
    poidsNecessaire?: number;
    poidsReserve?: number;
    poidsConsomme?: number;
  }
  