export type StatutModele = 'PROTOTYPE' | 'EN_COURS' | 'VALIDE';

export interface ModeleSac {
  id: number;
  nom: string;
  longueur: number; // cm
  largeur: number;  // cm
  grammage: number; // g/m²
  statut: StatutModele;
  stock: number;            // pièces disponibles
  seuilCritique?: number;   // seuil d’alerte (ex: 50)
  image?: string;           // URL
  createdAt?: string;       // ISO
  updatedAt?: string;       // ISO
}
