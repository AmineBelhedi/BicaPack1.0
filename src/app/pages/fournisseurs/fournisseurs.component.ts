import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';

import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Fournisseur } from 'src/app/models/fournisseur';
import { ApiService } from 'src/app/services/api.service';
import { CompteComptable, CompteComptableService } from 'src/app/services/compte-comptable.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
    selector: 'app-fournisseurs',
    templateUrl: './fournisseurs.component.html',
    styleUrl: './fournisseurs.component.scss',
    providers: [MessageService, DatePipe],
})
export class FournisseursComponent {
    fournisseur: Fournisseur = new Fournisseur();
    fournisseurDialogCreate: boolean = false;
    fournisseurDialogUpdate: boolean = false;
    deleteFournisseurDialog: boolean = false;
    deleteFournisseursDialog: boolean = false;
    fournisseurs: Fournisseur[] = [];
    selectedFournisseurs: Fournisseur[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    rowsPerPageOptions = [5, 10, 20];
    comptesDebit : CompteComptable[]=[]; 
    comptesCredit :CompteComptable[]=[]; 
    filteredCompteCredit : CompteComptable[]=[];
    filteredCompteDebit : CompteComptable[]=[]; 
    compteCredit : CompteComptable ; 
  compteDebit : CompteComptable; 
  compteCreditDialog : boolean = false ; 
  compteDebitDialog : boolean = false ; 
    loading: boolean = true;
    isDesktop: boolean = true;

    constructor(
        private messageService: MessageService,
        private api: ApiService,
        private datePipe: DatePipe,private compteService :CompteComptableService,
        private router: Router,
    ) {}

    checkScreenSize() {
        this.isDesktop = window.innerWidth >= 768; // Ajuster cette valeur pour le breakpoint tablette/bureau
    }
    getComptesCredit(){
        this.compteService.getAllCredit().subscribe(res=>{
          this.comptesCredit = res; 
        })
      }
      getComptesDebit(){
        this.compteService.getAllDebit().subscribe(res=>{
          this.comptesDebit =res ;
        })
      }
      saveCompteDebit(){
        this.compteService.createCompteDebit(this.compteDebit).subscribe(res=>{
          this.fournisseur.compteDebit=res ; 
          this.messageService.add({
            severity: 'success',
            summary: 'Création Compte',
            detail: 'Compte Débit créer avec succès'
          });
          this.compteDebitDialog = false; 
        },err=>{
          this.messageService.add({
            severity: 'error',
            summary: 'Création Compte',
            detail: 'Création Compte Débit a échouée'
          });
        })
      }
      saveCompteCredit(){
        this.compteService.createCompteCredit(this.compteCredit).subscribe(res=>{
          this.fournisseur.compteCredit=res ; 
          this.messageService.add({
            severity: 'success',
            summary: 'Création Compte',
            detail: 'Compte Crédit créer avec succès'
          });
          this.compteCreditDialog = false; 
        },err=>{
          this.messageService.add({
            severity: 'error',
            summary: 'Création Compte',
            detail: 'Création Compte Crédit a échouée'
          });
        })
      }
      
    ngOnInit() {
        this.api.getAllFournisseurs().subscribe(
            (res) => {
                this.fournisseurs = res;
                this.fournisseurs = res.sort((a, b) => b.id - a.id); // Tri décroissant par ID
                this.loading = false;
                // console.log(this.fournisseurs);
            },
            (error) => {
                this.loading = false;
            }
        );

        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));
        this.getComptesCredit(); 
        this.getComptesDebit(); 
        this.cols = [
            { field: 'id', header: 'ID' },
            { field: 'nom', header: 'Nom Fournisseur' },
            { field: 'matFiscale', header: 'Matricule Fiscale' },
        ];
    }
    hasEmptyFields(fournisseur: any): boolean {
        const fieldsToCheck = ['nom', 'matFiscale'];
        return fieldsToCheck.some(field => !fournisseur[field] || fournisseur[field].trim() === '');
    }
    openNew() {
        this.fournisseur = {
            id: 0,
            nom: '',
            matFiscale: '',
        };
        this.submitted = false;
        this.fournisseurDialogCreate = true;
    }

    deleteSelectedFournisseurs() {
        this.deleteFournisseursDialog = true;
    }

    editFournisseur(fournisseur: Fournisseur) {
        this.fournisseur = { ...fournisseur };
        this.fournisseurDialogUpdate = true;
    }

    deleteFournisseur(fournisseur: Fournisseur) {
        this.fournisseur = { ...fournisseur };
        this.deleteFournisseurDialog = true;
    }

    confirmDeleteSelected() {
        this.deleteFournisseursDialog = false;
        this.selectedFournisseurs.forEach((fournisseur) => {
            this.api.deleteFournisseur(fournisseur).subscribe((res) => {});
        });
        this.fournisseurs = this.fournisseurs.filter(
            (val) => !this.selectedFournisseurs.includes(val)
        );
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Fournisseurs supprimés',
            life: 3000,
        });
        this.selectedFournisseurs = [];
    }
    filterComptesCredit(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        this.filteredCompteCredit = this.comptesCredit.filter(f =>
          f.numeroCompte.toLowerCase().startsWith(query)
        );
      }
      filterComptesDebit(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        this.filteredCompteDebit = this.comptesDebit.filter(f =>
          f.numeroCompte.toLowerCase().startsWith(query)
        );
      }
      openNewCompteCredit(){
        this.compteCredit ={ id: 0 , intitule :this.fournisseur.nom.toUpperCase() , numeroCompte : '' }; 
        this.compteCreditDialog = true ; 
      }
      openNewCompteDebit(){
        this.compteDebit ={ id: 0 , intitule :this.fournisseur.nom.toUpperCase(), numeroCompte : '' }; 
        this.compteDebitDialog = true ; 
      }
      hideDialogCompteCredit(){
        this.compteCreditDialog = false; 
      }
      hideDialogCompteDebit(){
        this.compteDebitDialog = false; 
      }
    confirmDelete() {
        this.deleteFournisseurDialog = false;
        this.api.deleteFournisseur(this.fournisseur).subscribe((res) => {
            this.fournisseurs = this.fournisseurs.filter(
                (val) => val.id !== this.fournisseur.id
            );
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Fournisseur supprimé',
                life: 3000,
            });
            this.resetFournisseur();
        });
    }

    hideDialog() {
        this.fournisseurDialogCreate = false;
        this.fournisseurDialogUpdate = false;
        this.submitted = false;
    }

    formValide(): boolean {
        // Ajouter votre logique de validation de formulaire ici
        return true;
    }

    saveFournisseur() {
        this.submitted = true;
        // if (!this.formValide()) {
        //     return;
        // }

        if (this.fournisseur.nom?.trim()) {
            if (this.fournisseur.id) {
                // Mettre à jour le fournisseur existant
                this.fournisseurs[
                    this.findIndexById(this.fournisseur.id.toString())
                ] = this.fournisseur;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Fournisseur mis à jour',
                    life: 3000,
                });
                this.api.updateFournisseur(this.fournisseur).subscribe(
                    (res) => {
                        this.getAllFournisseurs();
                        this.fournisseurDialogUpdate = false;
                        this.resetFournisseur();
                    },
                    (error) => {
                        alert(error.message);
                    }
                );
            } else {
                // Créer un nouveau fournisseur
               
                this.api.addFournisseur(this.fournisseur).subscribe(
                    (res) => {
                        this.fournisseurs.push(this.fournisseur);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Fournisseur créé',
                            life: 3000,
                        });
                        this.getAllFournisseurs();
                        this.fournisseurDialogCreate = false;
                        this.resetFournisseur();
                    },
                    (error) => {
                        alert(error.message);
                    }
                );
            }
            this.fournisseurs = [...this.fournisseurs];
        }
    }

    getAllFournisseurs() {
        this.api.getAllFournisseurs().subscribe((res) => {
            this.fournisseurs = res.sort((a, b) => b.id - a.id); // Tri décroissant par ID
        });
    }
    

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.fournisseurs.length; i++) {
            if (this.fournisseurs[i].id.toString() === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    resetFournisseur() {
        this.fournisseur = {
            id: 0,
            nom: '',
            matFiscale: '',
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    getSeverity(status: string) {
        switch (status) {
            case 'NEW':
                return 'success';
            case 'EXT':
                return 'warning';
            default:
                return 'success';
        }
    }
}


