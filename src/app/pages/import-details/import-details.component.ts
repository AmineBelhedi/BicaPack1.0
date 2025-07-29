import { Component } from '@angular/core';

@Component({
  selector: 'app-import-details',
  templateUrl: './import-details.component.html',
  styleUrls: ['./import-details.component.scss']
})
export class ImportDetailsComponent {
  importData: any = {
    numeroImport: '80896779',
    fournisseur: 'MONDI',
    nomProduit: 'Papier Kraft 90g',
    totalMetrage: 0,
    totalRouleaux: 0,
    prix: 0,
    dateImport: new Date(),
    observations: '',
    fichierImport: null
  };

  rouleaux = [
    { id: this.createId(), numero: '0007448973', metrage: 121.02, laize: 84.5, poids: 78, valide: false, disponible: false },
    { id: this.createId(), numero: '0007448931', metrage: 112, laize: 78, poids: 60, valide: false, disponible: false }
  ];

  // Dialogs
  rouleauDialog = false;
  deleteRouleauDialog = false;

  rouleauData: any = {}; // pour ajouter/modifier
  rouleauToDelete: any = null; // pour suppression

  colonnesOptions = [
    { label: 'Statut', value: 'status' },
    { label: 'Disponibilité', value: 'dispo' }
  ];
  colonnesAffichees = [...this.colonnesOptions];

  // == Ajout / édition ==
  openEditDialog(r?: any) {
    if (r) {
      this.rouleauData = { ...r };
    } else {
      this.rouleauData = {};
    }
    this.rouleauDialog = true;
  }

  saveRouleau() {
    if (this.rouleauData.id) {
      const index = this.rouleaux.findIndex(r => r.id === this.rouleauData.id);
      if (index !== -1) this.rouleaux[index] = { ...this.rouleauData };
    } else {
      this.rouleauData.id = this.createId();
      this.rouleauData.valide = false;
      this.rouleauData.disponible = true;
      this.rouleaux.push(this.rouleauData);
    }
    this.rouleauDialog = false;
    this.rouleauData = {};
  }

  // == Suppression ==
  confirmDelete(r: any) {
    this.rouleauToDelete = r;
    this.deleteRouleauDialog = true;
  }

  deleteConfirmed() {
    this.rouleaux = this.rouleaux.filter(x => x.id !== this.rouleauToDelete.id);
    this.deleteRouleauDialog = false;
    this.rouleauToDelete = null;
  }

  // == Utilitaire ==
  createId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  isColVisible(colKey: string): boolean {
    return this.colonnesAffichees.some(c => c.value === colKey);
  }


  newRouleau: any = {};
rouleauEnCours: any = null;

addRouleau() {
  if (!this.newRouleau.numero) return;

  if (this.rouleauEnCours) {
    const index = this.rouleaux.findIndex(r => r.id === this.rouleauEnCours.id);
    if (index !== -1) {
      this.rouleaux[index] = { ...this.newRouleau, id: this.rouleauEnCours.id };
    }
    this.rouleauEnCours = null;
  } else {
    const nouveau = {
      ...this.newRouleau,
      id: this.createId(),
      valide: false,
      disponible: true
    };
    this.rouleaux.push(nouveau);
  }

  this.newRouleau = {};
}

onFileUpload(event: any) {
  const file = event.files[0];
  if (file) {
    console.log('Fichier sélectionné :', file);
    this.importData.fichierImport = file;
  }
}


}
