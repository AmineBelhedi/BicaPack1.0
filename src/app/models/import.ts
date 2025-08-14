export interface RouleauImport {
  id?: number;
  numero: string;
  metrage: number;
  numeroInterne : string ; 
  description : string ; 
  grammage : number ; 
  code : string ; 
  prix : number ; 
  poids: number;
  poidsReserve ?: number ; 
  poidsRestant ?: number ; 
  laize: number;
  valide: boolean;
  disponible: boolean;
  reference ?: string ; 
   partiel ?: boolean;
 status  ?: boolean;
  reserved  ?: boolean;
}

export interface ImportModel {
  id?: number;
  numeroImport: string;
  dateImport: string | Date  ;
  fournisseur: string;
  nomProduit: string;
  
  totalMetrage?: number;
  totalRouleaux?: number;
  prix?: number;
  observations?: string;
  fichierImport?: string; // nom du fichier PDF importé
  packingList ?: string ; 
  rouleaux?: RouleauImport[]; // liste des rouleaux liés
}
