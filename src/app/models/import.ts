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
  laize: number;
  valide: boolean;
  disponible: boolean;

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
  rouleaux?: RouleauImport[]; // liste des rouleaux liés
}
