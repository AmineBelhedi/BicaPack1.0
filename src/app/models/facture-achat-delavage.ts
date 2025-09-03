import { Banque } from "../services/banque.service";
import { CompteComptable } from "../services/compte-comptable.service";
import { AffectationLigneFacture } from "./affectationLigneFacture";
import { DocumentFacturation } from "./documentFacture";
import { Fournisseur } from "./fournisseur";

export interface LigneFactureVente {
    id?: number;
    produit: string;
    description?: string;
    quantite: number;
    prixUnitaire: number;
    reduction: number;
    taxe: number;
    total?: number;
  }

  export interface LigneFactureAchat{
    id?: number;
    produit: string;
    description?: string;
    quantite: number;
    prixUnitaire: number;
    reduction: number;
    taxe: number;
    total?: number;
    affectations?: AffectationLigneFacture[];
  }
  export interface FactureAchat {
    id: number;
    numeroFacture: string;
    dateFacture: Date;        // ISO string
    dateEcheance: Date;       // ISO string
      datePaiement: Date;       // ISO string
    modePaiement: string;
    categorisation: string;
    brouillon: boolean;
    fournisseur: Fournisseur;
    lignes: LigneFactureAchat[];
    totalHT?: number;
    tva?: number;
    totalTTC?: number;
    totalRetenue ?: number ; 
    netAPayer ?: number ; 
    factureAchat ?: DocumentFacturation; 
    documents ?: DocumentFacturation[]; 
    cours : number ; 
    devise : string ;
    exonore ?: boolean; 
    compteDebit?: CompteComptable;
    compteCredit?: CompteComptable;
    compteRetenue?: CompteComptable;
    banque ?: Banque ; 
  
  }
  
  export interface FactureVente {
    id: number;
    numeroFacture: string;
    dateFacture: Date;        // ISO string
    dateEcheance: Date;       // ISO string
    modePaiement: string;
       datePaiement: Date;  
    categorisation: string;
    brouillon: boolean;
    fournisseur: Fournisseur;
    lignes: LigneFactureVente[];
    totalHT?: number;
    tva?: number;
    totalTTC?: number;
    documentFacturation ?: DocumentFacturation; 
    banque ?: Banque ; 
    compteClient?: CompteComptable;
    compteComptable?: CompteComptable;
  }
  


