import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ImportModel } from '../../models/import'; // assure-toi que ce fichier existe
import { ImportService } from 'src/app/services/import.service';

@Component({
    selector: 'app-import',
    templateUrl: './import.component.html',
    providers: [MessageService]
})
export class ImportComponent implements OnInit {
    importDialog: boolean = false;
    deleteImportDialog: boolean = false;
    deleteImportsDialog: boolean = false;

    imports: ImportModel[] = [];
    selectedImports: ImportModel[] = [];
    importData: ImportModel = {
        numeroImport: '',
        nomProduit: '',
        fournisseur: '',
        dateImport: new Date()
    };
    submitted: boolean = false;
    rowsPerPageOptions = [10, 20, 30];

    cols: any[] = [];

    constructor(
        private messageService: MessageService,
        private router: Router , private importService  : ImportService
    ) {}

    ngOnInit(): void {
        // Données simulées (tu les remplaceras par l'appel API plus tard)
        this.imports = [
            {
                id: 1,
                numeroImport: 'IMP-001',
                nomProduit: 'Papier Kraft 90g',
                fournisseur: 'Fournisseur A',
                dateImport: new Date()
            }
        ];
            this.getAllImports() ; 
        this.cols = [
            { field: 'numeroImport', header: 'N° Import' },
            { field: 'nomProduit', header: 'Produit' },
            { field: 'fournisseur', header: 'Fournisseur' },
            { field: 'dateImport', header: 'Date Import' }
        ];
    }


    getAllImports(){

        this.importService.getAllImports().subscribe({
            next: data => this.imports = data,
            error: err => console.error('Erreur chargement imports:', err)
          });
          
    }
    openNew() {
        this.importData = {
            numeroImport: '',
            nomProduit: '',
            fournisseur: '',
            dateImport: new Date()
        };
        this.submitted = false;
        this.importDialog = true;
    }

    editImport(importItem: ImportModel) {
        this.importData = { ...importItem };
        this.importDialog = true;
    }

    deleteImport(importItem: ImportModel) {
        this.importData = { ...importItem };
        this.deleteImportDialog = true;
    }

    confirmDelete() {
        this.imports = this.imports.filter(i => i.id !== this.importData.id);
        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Import supprimé', life: 3000 });
        this.deleteImportDialog = false;
        this.importData = {
            numeroImport: '',
            nomProduit: '',
            fournisseur: '',
            dateImport: new Date()
        };
    }

    deleteSelectedImports() {
        this.deleteImportsDialog = true;
    }

    confirmDeleteSelected() {
        this.imports = this.imports.filter(val => !this.selectedImports.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Importations supprimées', life: 3000 });
        this.deleteImportsDialog = false;
        this.selectedImports = [];
    }

    // saveImport() {
    //     this.submitted = true;
    //     if (this.importData.numeroImport?.trim() && this.importData.nomProduit?.trim()) {
    //         if (this.importData.id) {
    //             const index = this.findIndexById(this.importData.id);
    //             this.imports[index] = { ...this.importData };
    //             this.messageService.add({ severity: 'success', summary: 'Mis à jour', detail: 'Import modifié', life: 3000 });
    //         } else {
    //             this.importData.id = this.createId();
    //             this.imports.push({ ...this.importData });
    //             this.messageService.add({ severity: 'success', summary: 'Créé', detail: 'Nouvel import ajouté', life: 3000 });
    //         }
    //         this.imports = [...this.imports];
    //         this.importDialog = false;
    //         this.importData = {
    //             numeroImport: '',
    //             nomProduit: '',
    //             fournisseur: '',
    //             dateImport: new Date()
    //         };
    //     }
    // }
    saveImport() {
        this.submitted = true;
      
        if (this.importData.numeroImport?.trim() && this.importData.nomProduit?.trim()) {
          if (this.importData.id) {
            // ▶️ Update
            this.importService.updateImport(this.importData).subscribe({
              next: (updated) => {
                const index = this.findIndexById(updated.id!);
                this.imports[index] = updated;
                this.messageService.add({ severity: 'success', summary: 'Mis à jour', detail: 'Import modifié', life: 3000 });
                this.afterSave();
              },
              error: err => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour', life: 3000 });
              }
            });
          } else {
            // ➕ Create
            this.importService.createImport(this.importData).subscribe({
              next: (created) => {
                this.imports.push(created);
                this.messageService.add({ severity: 'success', summary: 'Créé', detail: 'Nouvel import ajouté', life: 3000 });
                this.afterSave();
              },
              error: err => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la création', life: 3000 });
              }
            });
          }
        }
      }
      afterSave() {
        this.imports = [...this.imports]; // Forcer détection changement
        this.importDialog = false;
        this.importData = {
          numeroImport: '',
          nomProduit: '',
          fournisseur: '',
          dateImport: new Date()
        };
        this.submitted = false;
      }
            
    findIndexById(id: number): number {
        return this.imports.findIndex(i => i.id === id);
    }

    createId(): number {
        return Math.floor(Math.random() * 1000000);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    goToDetails(importItem: ImportModel) {
        this.router.navigate(['/pages/import-details', importItem.id]);
    }
}
