import { CompteComptable } from "../services/compte-comptable.service";

export class Fournisseur {
    id: number;
    nom?: string;
    matFiscale?: string;
    adresse?: string;
    email?: string;
    phone1?: string;
    phone2?: string;
    tva?: string;
    siteWeb?: string;
    fax?: string;
    typeFournisseur ?: string ; 
    famille ?: string ; 
    compteDebit?: CompteComptable;
    compteCredit?: CompteComptable;
}
