import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { SousTraitant } from 'src/app/models/sousTraitant';
import { User } from 'src/app/models/user';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sous-traitant',
  templateUrl: './sous-traitant.component.html',
  styleUrl: './sous-traitant.component.scss',
  providers :[MessageService]
})
export class SousTraitantComponent {
  sousTraitant: SousTraitant = new SousTraitant();
  sousTraitantDialog: boolean = false;
  deleteSousTraitantDialog: boolean = false;
  deleteSousTraitantsDialog: boolean = false;
  user : User = new User() ; 
  sousTraitants: SousTraitant[] = [];

  isDesktop: boolean = true;
  selectedSousTraitants: SousTraitant[] = [];

  loading: boolean = true;
  submitted: boolean = false;

  cols: any[] = [];
  statuses: any[] = [];

  // Patterns de validation pour les champs spécifiques
  namePattern: RegExp = /^[a-zA-Z\s]+$/;
  matFiscalePattern: RegExp = /^[0-9]{8}$/;
  datePattern: RegExp = /^\d{4}-\d{2}-\d{2}$/;
  contactPattern: RegExp = /^[0-9]{8,15}$/;

  rowsPerPageOptions = [5, 10, 20];

  constructor(private messageService: MessageService, private api: ApiService , private auth : AuthService) { }

  ngOnInit() {
    this.getAllSousTraitants() ;
    this.auth.getProfile().subscribe(res=>{
      this.user = res; 
    })
    this.cols = [
      { field: 'name', header: 'Nom' },
      { field: 'matFiscale', header: 'Matricule Fiscale' },
      { field: 'dateCreation', header: 'Date de Création' },
      { field: 'createdBy', header: 'Créé Par' },
      { field: 'address', header: 'Adresse' },
      { field: 'contact', header: 'Contact' }
    ];

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    this.statuses = [
      { label: 'Actif', value: 'actif' },
      { label: 'Inactif', value: 'inactif' }
    ];
  }
  getAllSousTraitants() {
    this.api.getAllSousTraitants().subscribe(res => {
     
      this.sousTraitants = res;
      this.loading = false;
      // this.sousTraitants.map(sousTraitant => {
      //   sousTraitant.dateCreation = new Date(sousTraitant.dateCreation);
      // })
      // console.log(this.sousTraitants);
    }, err => {
      this.loading = false;
    })
  }
  hasEmptyFields(modele: any): boolean {
    const fieldsToCheck = ['codeUsine', 'responsable', 'name','matFiscale'];
    return fieldsToCheck.some(field => !modele[field] || modele[field].trim() === '');
}
  
  checkScreenSize() {
    this.isDesktop = window.innerWidth >= 768;
  }

  openNew() {
    this.sousTraitant = new SousTraitant();
    this.submitted = false;
    this.sousTraitantDialog = true;
  }

  deleteSelectedSousTraitants() {
    this.deleteSousTraitantsDialog = true;
  }

  editSousTraitant(sousTraitant: SousTraitant) {
    this.sousTraitant = { ...sousTraitant };
    this.sousTraitantDialog = true;
  }

  deleteSousTraitant(sousTraitant: SousTraitant) {
    this.deleteSousTraitantDialog = true;
    this.sousTraitant = { ...sousTraitant };
  }

  confirmDeleteSelected() {
    this.deleteSousTraitantsDialog = false;
    this.selectedSousTraitants.forEach(sousTraitant => {
      this.api.deleteSousTraitant(sousTraitant).subscribe(res => {
        // Traitement en cas de succès
      });
    });

    this.sousTraitants = this.sousTraitants.filter(val => !this.selectedSousTraitants.includes(val));
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-traitants supprimés', life: 3000 });
    this.selectedSousTraitants = [];
  }

  confirmDelete() {
    this.deleteSousTraitantDialog = false;
    this.api.deleteSousTraitant(this.sousTraitant).subscribe(res => {
      this.sousTraitants = this.sousTraitants.filter(val => val.id !== this.sousTraitant.id);
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-traitant supprimé', life: 3000 });
      this.resetSousTraitantForm();
    });
  }

  hideDialog() {
    this.sousTraitantDialog = false;
    this.submitted = false;
  }

  formValide(): boolean {
    // Implémentez ici la logique de validation de votre formulaire
    return true;
  }

  saveSousTraitant() {
    this.submitted = true;

    if (!this.formValide()) {
      return;
    }

    if (this.sousTraitant.name?.trim()) {
      if (this.sousTraitant.id) {
        this.sousTraitants[this.findIndexById(this.sousTraitant.id.toString())] = this.sousTraitant;

        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-traitant mis à jour', life: 3000 });
        this.api.updateSousTraitant(this.sousTraitant).subscribe(res => {
          this.sousTraitantDialog = false;
        }, error => {
          alert(error.message);
        });
      } else {
        this.sousTraitant.createdBy = this.user.firstname + ' '+this.user.lastname ; 
        this.api.addSousTraitant(this.sousTraitant).subscribe(res => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Sous-traitant créé', life: 3000 });
          this.getAllSousTraitants();
          this.sousTraitantDialog = false;
          this.resetSousTraitantForm();
        }, error => {
          alert(error.message);
        });
      }
      this.sousTraitants = [...this.sousTraitants];
    }
  }

  
  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.sousTraitants.length; i++) {
      if (this.sousTraitants[i].id.toString() === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  resetSousTraitantForm() {
    this.sousTraitant = new SousTraitant();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
