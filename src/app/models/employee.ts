import { SousTraitant } from "./sousTraitant";

export class Employee{

    id : number ; 
    firstname ?: string ; 
    lastname ?: string ; 
    birthDate ?: Date ; 
    gender ?:string;  
    email ?: string ; 
    phoneNumber ?: string ; 
    secondPhoneNumber ?: string ; 
    address ?: string ; 
    hireDate ?:Date ; 
    jobTitle ?: string ; 
    department ?: string ; 
    employmentType ?:string ; 
    salary ?: number ; 
    socialSecurityNumber ?: string ; 
    matricule ?: string ; 
    cin ?:string ; 
    photo ?:string ; 
    categorie ?: string ; 
    contractEndDate ?: Date ; 
    salaryBrut ? : number ; 
    sousTraitant ?: SousTraitant ; 
    echelon ?: string ; 
    suspended ?: boolean; 
    raisonSuspension ?: string ; 
    dateSuspension ?: Date ; 



}