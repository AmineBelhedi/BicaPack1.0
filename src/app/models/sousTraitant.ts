import { EffectifSousTraitant } from "./effectifSousTraitant";

export class SousTraitant {

    id : number ; 
    name ?:string ; 
    dateCreation ?: Date ; 
    codeUsine ?: string ; 
    responsable ?: string ; 
    createdBy ?: string ; 
    matFiscale ?: string ; 
    address ?: string ; 
    contact ?: string ; 
    fullName ?: string ; 
    effectifTotal ?: number ; 
    effectifs ?: EffectifSousTraitant[] ; 
    logoUrl ?: string ; 
    commandeEnCours ?: number ; 
    

}