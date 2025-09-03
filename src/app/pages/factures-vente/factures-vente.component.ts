import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService, SharedModule } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table } from 'primeng/table';
import { FactureVente, LigneFactureAchat } from 'src/app/models/facture-achat-delavage';
import { Fournisseur } from 'src/app/models/fournisseur';
import { ApiService } from 'src/app/services/api.service';
import { Banque, BanqueService } from 'src/app/services/banque.service';
import { CompteComptable, CompteComptableService } from 'src/app/services/compte-comptable.service';
import { FacturationService } from 'src/app/services/facturation.service';

@Component({
  selector: 'app-factures-vente',
  templateUrl: './factures-vente.component.html',

  styleUrl: './factures-vente.component.scss', 
  providers:[MessageService , ConfirmationService,DatePipe]
})
export class FacturesVenteComponent {


  
  
  factures: FactureVente[] = [];
  nouvelleFacture: FactureVente = this.initialiserFacture();
  dialogVisible = false;
  dialogUpdate = false;
  dialogDelete = false; 

  loading = false;
  isDesktop: boolean = true;
  factureToDelete: FactureVente | null = null; // Facture à supprimer
 // Fournisseur
 fournisseur: Fournisseur = new Fournisseur();
 fournisseurDialogCreate: boolean = false;
 fournisseurDialogUpdate: boolean = false;
 deleteFournisseurDialog: boolean = false;
 fournisseurs: Fournisseur[] = [];
 filteredFournisseur: Fournisseur[] = [];
 submittedFournisseur: boolean = false;
 compteComptableBanque : CompteComptable ; 

 comptesBanques : CompteComptable[]=[]; 
 compteComptable : CompteComptable ; 
 filteredComptesComptable : CompteComptable[]=[];   
 compteComptableDialog : boolean = false ; 

 comptesComptable :CompteComptable[]=[]; 
 filteredComptesBanque : CompteComptable[]=[]; 
 compteBanqueDialog : boolean = false ; 


 compteClient : CompteComptable; 
 comptesClient : CompteComptable[]=[] ; 
 filteredComptesClient : CompteComptable[]=[]; 
 compteClientDialog : boolean = false ; 


loadingTable:boolean = false ; 

 banque : Banque ; 
 banques :Banque[]=[]; 
 filteredBanque : Banque[]=[]; 
 banqueDialog : boolean = false ; 
 modesPaiement = [
  { label: 'Espèces', value: 'ESPECES' },
  { label: 'Virement', value: 'VIREMENT' },
  { label: 'Chèque', value: 'CHEQUE' },
  { label: 'Carte Bancaire', value: 'CARTE' }
];
  constructor(private factureService: FacturationService, private compteService : CompteComptableService, 
    private messageService : MessageService, private banqueService : BanqueService, private datePipe: DatePipe, 
    private api : ApiService) {}

  ngOnInit(): void {
       this.loadFacturesLazy({ first: 0, rows: 10,sortField: 'dateFacture', 
  sortOrder: 1  }); // charger la première page
  
    //this.loadFactures();
    this.getFournisseurs();
    this.loadBanques(); 
    this.getComptesComptableBanque(); 
    this.getCompteComptable(); 
    this.getComptesClient(); 
      this.getTotalFactureVente();

  }

    totalFacturesVente : number = 0 ; 
    getTotalFactureVente(){
      this.factureService.getTotalFacturesVente().subscribe(res=>{
        this.totalFacturesVente =res ; 
        console.log(this.totalFacturesVente)
      })
    }

  loadBanques(): void {
    this.banqueService.getAllBanques().subscribe({
      next: (data) => this.banques = data,
      error: (err) => console.error('Erreur chargement banques', err)
    });
  }


  clearDateFilter() {
  this.startDate = undefined;
  this.endDate = undefined;
  this.loadFacturesLazy({ first: 0, rows: 10, sortField: 'dateFacture', 
  sortOrder: 1    }); // recharge sans filtre
}

  loadFactures() {
    this.loading = true;
    this.factureService.getAll().subscribe({
      next: (res) => {
        res.map(item=>{
          item.dateEcheance = new Date(item.dateEcheance); 
          item.dateFacture = new Date(item.dateFacture); 
        })
        this.factures = res.sort((a, b) => 
          new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
        );
  
       // console.log(this.factures)
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  openNewFournisseur(){
    this.fournisseur ={
      id :0 ,nom :'' , matFiscale :'',
    }; 
    this.submittedFournisseur = false ; 
    this.fournisseurDialogCreate = true ; 
  }
  getFournisseurs() {
    this.api.getAllFournisseurs().subscribe((res) => {
        this.fournisseurs = res;
    });
}
hideDialogFournisseur() {
  this.fournisseurDialogCreate = false;
  this.submittedFournisseur = false;
}
getCompteComptable(){
  this.compteService.getAllCompteComptableFactureVente().subscribe(res=>{
    this.comptesComptable = res; 
  })
}

getComptesClient(){
  this.compteService.getAllCompteClient().subscribe(res=>{
    this.comptesClient = res; 
  })
}

saveFournisseur() {
  this.submittedFournisseur = true;

  if (this.fournisseur.nom?.trim()) {
      // Create new tissu
      this.fournisseurs.push(this.fournisseur);
  
      this.api.addFournisseur(this.fournisseur).subscribe(
          (res) => {
              this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail: 'Fournisseur Created',
                  life: 3000,
              });
              this.getFournisseurs() ;
              this.nouvelleFacture.fournisseur=res;  
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

resetFournisseur() {
  this.fournisseur ={
    id :0 ,
  }
}
getComptesComptableBanque(){
  this.compteService.getAllCompteComptableBanques().subscribe(res=>{
    this.comptesBanques = res; 
  })
}
saveCompteBanque(){
  this.compteService.createCompteComptable(this.compteComptableBanque).subscribe(res=>{
    this.nouvelleFacture.banque.compteComptable=res ; 
    this.messageService.add({
      severity: 'success',
      summary: 'Création Compte',
      detail: 'Compte Comptable créer avec succès'
    });
    this.compteBanqueDialog = false; 
  },err=>{
    this.messageService.add({
      severity: 'error',
      summary: 'Création Compte',
      detail: 'Création Compte  a échouée'
    });
  })
}

saveCompteComptable(){
  this.compteService.createCompteComptableFactureVente(this.compteComptable).subscribe(res=>{
    this.nouvelleFacture.compteComptable=res ; 
    this.messageService.add({
      severity: 'success',
      summary: 'Création Compte',
      detail: 'Compte Comptable créer avec succès'
    });
    this.compteComptableDialog = false; 
  },err=>{
    this.messageService.add({
      severity: 'error',
      summary: 'Création Compte',
      detail: 'Création Compte  a échouée'
    });
  })
}
saveCompteClient(){
  this.compteService.createCompteClient(this.compteClient).subscribe(res=>{
    this.nouvelleFacture.compteClient=res ; 
    this.messageService.add({
      severity: 'success',
      summary: 'Création Compte',
      detail: 'Compte Client créer avec succès'
    });
    this.compteClientDialog = false; 
  },err=>{
    this.messageService.add({
      severity: 'error',
      summary: 'Création Compte',
      detail: 'Création Compte Client a échouée'
    });
  })
}
openNewCompteBanque(){
  this.compteComptableBanque = { id: 0 , intitule :'' , numeroCompte : '' }; 
  this.compteBanqueDialog = true ; 
}
openNewCompteComptable(){
  this.compteComptable = { id: 0 , intitule :'' , numeroCompte : '' }; 
  this.compteComptableDialog = true ; 
}

openNewCompteClient(){
  this.compteClient = { id: 0 , intitule :'' , numeroCompte : '' }; 
  this.compteClientDialog = true ; 
}
hdieDialogBanque(){
  this.banqueDialog = false ; 
}
openNewBanque(){
  this.banque ={
    id : 0 , 
    nom : '' , 
    numeroRib : '' , 
  }
  this.banqueDialog = true ; 
}
resetBanque(){
  this.banque ={
    id : 0 , 
    nom : '' , 
    numeroRib : '' , 
  }
  this.banqueDialog=false ; 
}
filterComptesBanque(event: AutoCompleteCompleteEvent) {
  const query = event.query.toLowerCase();
  this.filteredComptesBanque = this.comptesBanques.filter(f =>
    f.numeroCompte.toLowerCase().startsWith(query)
  );
}
filterComptesComptable(event: AutoCompleteCompleteEvent) {
  const query = event.query.toLowerCase();
  this.filteredComptesComptable = this.comptesComptable.filter(f =>
    f.numeroCompte.toLowerCase().startsWith(query)
  );
}
filterComptesClient(event: AutoCompleteCompleteEvent) {
  const query = event.query.toLowerCase();
  this.filteredComptesClient = this.comptesClient.filter(f =>
    f.numeroCompte.toLowerCase().startsWith(query)
  );
}
filterBanque(event: AutoCompleteCompleteEvent) {
  const query = event.query.toLowerCase();
  this.filteredBanque = this.banques.filter(f =>
    f.numeroRib.toLowerCase().startsWith(query)
  );
}

hideCompteBanqueDialog(){
  this.compteBanqueDialog= false ; 
  this.compteComptableBanque={ id: 0 , intitule :'' , numeroCompte : '' }; 
}
hideCompteComptableDialog(){
  this.compteComptableDialog= false ; 
  this.compteComptable={ id: 0 , intitule :'' , numeroCompte : '' }; 
}
hideCompteClientDialog(){
  this.compteClientDialog= false ; 
  this.compteClient={ id: 0 , intitule :'' , numeroCompte : '' }; 
}
ajouterBanque() {
  this.banqueService.createBanque(this.banque).subscribe({
    next: (res) => {
      this.resetBanque();
      this.nouvelleFacture.banque=res ; 
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Banque créée avec succès'
      });
      this.loadBanques();
    
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'La banque n\'a pas pu être créée'
      });
    }
  });
}
  initialiserFacture(): FactureVente {
    return {
      id:0 , 
      numeroFacture: '',
      dateFacture: new Date(),
      dateEcheance: new Date() ,
         datePaiement : new Date () , 
      modePaiement: '',
      categorisation: '',
      documentFacturation : null , 
      brouillon: true,
      fournisseur: null,
      lignes: [this.creerLigne()]  
    };
  }

  creerLigne(): LigneFactureAchat {
    return {
      produit: '',
      description: '',
      quantite: 1,
      prixUnitaire: 0,
      reduction: 0,
      taxe: 0
    };
  }
  filterFournisseur(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.fournisseurs as any[]).length; i++) {
        let acc = (this.fournisseurs as any[])[i];
        if (acc.nom.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(acc);
        }
    }

    this.filteredFournisseur = filtered;
}

search: string = '';

onSearchChange() {
  // Recharge depuis le backend avec le filtre texte
  this.loadFacturesLazySearch({ first: 0, rows: 10, sortField: 'dateFacture', 
  sortOrder: -1   });
}
  fournisseurId?: number;
  exonere?: boolean;
 totalRecords: number = 0;
  // loadFacturesLazy(event: LazyLoadEvent) {
  //   this.loadingTable = true;

  //   const page = event.first ? event.first / (event.rows || 10) : 0;
  //   const size = event.rows || 10;
  //   const sortField = event.sortField || 'dateFacture';
  //   const sortOrder = event.sortOrder === 1 ? 'desc' : 'asc';

  //   const filters: any = {};
  //   if (this.search) filters.search = this.search;
  //   if (this.fournisseurId) filters.fournisseurId = this.fournisseurId;
  //   if (this.exonere !== undefined) filters.exonere = this.exonere;

  //   this.factureService.getFacturesVentePagedFiltered(page, size, sortField, sortOrder, filters)
  //     .subscribe({
  //       next: (data) => {
  //         this.factures = data.content;
  //         this.totalRecords = data.totalElements;
  //         this.loadingTable = false;
  //       },
  //       error: (err) => {
  //         console.error('Erreur chargement factures', err);
  //         this.loadingTable = false;
  //       }
  //     });
  // }
  //   loadFacturesLazySearch(event: LazyLoadEvent) {
  //   //this.loading = true;

  //   const page = event.first ? event.first / (event.rows || 10) : 0;
  //   const size = event.rows || 10;
  //   const sortField = event.sortField || 'dateFacture';
  //   const sortOrder = event.sortOrder === 1 ? 'desc' : 'asc';

  //   const filters: any = {};
  //   if (this.search) filters.search = this.search;
  //   if (this.fournisseurId) filters.fournisseurId = this.fournisseurId;
  //   if (this.exonere !== undefined) filters.exonere = this.exonere;

  //   this.factureService.getFacturesVentePagedFiltered(page, size, sortField, sortOrder, filters)
  //     .subscribe({
  //       next: (data) => {
  //         this.factures = data.content;
  //         this.totalRecords = data.totalElements;
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error('Erreur chargement factures', err);
  //         this.loading = false;
  //       }
  //     });
  // }

  startDate?: string;
endDate?: string;
applyDateFilter() {
  this.startDate = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd') : undefined;
this.endDate = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd') : undefined;

  this.loadFacturesLazy({ 
  first: 0, 
  rows: 10, 
  sortField: 'dateFacture', 
  sortOrder: -1   // -1 = DESC, 1 = ASC
});
}

  loadFacturesLazy(event: LazyLoadEvent) {
  this.loading = true;

  const page = event.first ? event.first / (event.rows || 10) : 0;
  const size = event.rows || 10;
  const sortField = event.sortField || 'dateFacture';
  const sortOrder = event.sortOrder === 1 ? 'desc' : 'asc';

  const filters: any = {};
  if (this.search) filters.search = this.search;
  if (this.fournisseurId) filters.fournisseurId = this.fournisseurId;
  if (this.startDate) filters.startDate = this.startDate;
  if (this.endDate) filters.endDate = this.endDate;

  this.factureService.getFacturesVentePagedFiltered(page, size, sortField, sortOrder, filters)
    .subscribe({
      next: (data) => {
        this.factures = data.content;
        this.totalRecords = data.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement factures', err);
        this.loading = false;
      }
    });
}
  loadFacturesLazySearch(event: LazyLoadEvent) {
  //this.loading = true;

  const page = event.first ? event.first / (event.rows || 10) : 0;
  const size = event.rows || 10;
  const sortField = event.sortField || 'dateFacture';
  const sortOrder = event.sortOrder === 1 ? 'desc' : 'asc';

  const filters: any = {};
  if (this.search) filters.search = this.search;
  if (this.fournisseurId) filters.fournisseurId = this.fournisseurId;
  if (this.startDate) filters.startDate = this.startDate;
  if (this.endDate) filters.endDate = this.endDate;

  this.factureService.getFacturesVentePagedFiltered(page, size, sortField, sortOrder, filters)
    .subscribe({
      next: (data) => {
        this.factures = data.content;
        this.totalRecords = data.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement factures', err);
        this.loading = false;
      }
    });
}
  openNewDialog() {
    this.nouvelleFacture = this.initialiserFacture();
    this.dialogVisible = true;
  }

  editFacture(facture: FactureVente) {
    
  this.nouvelleFacture = { ...facture }; 
      this.nouvelleFacture.dateFacture = new Date(this.nouvelleFacture.dateFacture);
       if (this.nouvelleFacture.dateEcheance != undefined )
              this.nouvelleFacture.dateEcheance = new Date(this.nouvelleFacture.dateEcheance);
      if (this.nouvelleFacture.datePaiement != undefined )
        this.nouvelleFacture.datePaiement = new Date(this.nouvelleFacture.datePaiement);
//  console.log(this.nouvelleFacture)
  this.dialogUpdate = true; 
}
  deleteFacture(facture: FactureVente) {
      this.factureToDelete = facture;
      this.dialogDelete = true;
    }
 @ViewChild('dt') dtF!: Table;
     getTotalByDevise(): number {
    const table = this.dtF;
    const data = table?.filteredValue?.length ? table.filteredValue : table?.value;
    return (data || [])
    .reduce((sum, f) => sum + Number(f.netAPayer ?? f.totalTTC ?? 0), 0);

  }

  
  addProduct() {
    this.nouvelleFacture.lignes.push(this.creerLigne());
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal(
        (event.target as HTMLInputElement).value,
        'contains'
    );
}
removeLigne(index: number) {
  this.nouvelleFacture.lignes.splice(index, 1);
}
  saveFacture() {
    this.factureService.create(this.nouvelleFacture).subscribe((res) => {
      if (this.fileFacture) {
        this.factureService
            .uploadFactureFile(res.id, this.fileFacture)
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Facture ajouté',
                        detail: this.fileFacture?.name,
                    });
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Nouvelle Facture créer',
                    });
                    this.fileFacture = null; // Réinitialiser
                    this.loadFactures()
                    this.dialogVisible = false;
                    this.loading = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Erreur fichier',
                        detail: 'Facture non téléversé',
                    });
                    this.loadFactures()
                    this.dialogUpdate = false;
                    this.fileFacture = null;
                    this.loading = false;
                },
            });
    } else {
        this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Nouvelle facture crée',
        });
        this.loadFactures();
        this.dialogVisible = false;
        this.loading = false;
    }
      // this.dialogVisible = false;
      // this.loadFactures();
    });
  }

  updateFacture() {
    if (this.nouvelleFacture.numeroFacture) { // On vérifie que l'ID ou un champ clé est bien présent
      this.factureService.update(this.nouvelleFacture.id, this.nouvelleFacture).subscribe({
        next: (res) => {
            if (this.fileFacture) {
                    this.factureService
                        .uploadFactureFile(res.id, this.fileFacture)
                        .subscribe({
                            next: () => {
                                this.messageService.add({
                                    severity: 'info',
                                    summary: 'Facture ajouté',
                                    detail: this.fileFacture?.name,
                                });
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Succès',
                                    detail: 'Facture mis à jour',
                                });
                                this.fileFacture = null; // Réinitialiser
                                this.loadFactures()
                                this.dialogUpdate = false;
                                this.loading = false;
                            },
                            error: () => {
                                this.messageService.add({
                                    severity: 'warn',
                                    summary: 'Erreur fichier',
                                    detail: 'Facture non téléversé',
                                });
                                this.loadFactures()
                                this.dialogUpdate = false;
                                this.fileFacture = null;
                                this.loading = false;
                            },
                        });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Facture mis à jour',
                    });
                    this.loadFactures();
                    this.dialogUpdate = false;
                    this.loading = false;
                }
          //                  this.messageService.add({
          //               severity: 'success',
          //               summary: 'Succès',
          //               detail: 'Facture mis à jour',
          //           });
          // this.dialogUpdate = false;
          // this.loadFactures();  
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour de la facture", err);
        }
      });
    }
  }

  confirmDelete(facture: FactureVente) {
  this.factureService.delete(facture.id).subscribe({
    next: () => {
      this.loadFactures();
      this.dialogDelete=false ;   
      // Recharge la liste des factures après la suppression
    },
    error: (err) => {
      console.error("Erreur lors de la suppression de la facture", err);
    }
  });
}



  get totalHT(): number {
    return this.nouvelleFacture.lignes.reduce((t, l) =>
      t + (l.quantite * l.prixUnitaire * (1 - l.reduction / 100)), 0);
  }
  
  get totalTVA(): number {
    return this.nouvelleFacture.lignes.reduce((t, l) =>
      t + (l.quantite * l.prixUnitaire * (1 - l.reduction / 100) * (l.taxe / 100)), 0);
  }
  
  get totalTTC(): number {
    return this.nouvelleFacture.lignes.reduce((t, l) =>
      t + (l.quantite * l.prixUnitaire * (1 - l.reduction / 100) * (1 + l.taxe / 100)), 0);
  }
  
  dialogView:boolean = false ; 
 selectedFacture : FactureVente | null =null; 
  openViewFacture(facture : FactureVente){
    this.dialogView = true ; 
    this.selectedFacture = {...facture}; 
  }
  fileFacture : File | null=null ; 
  uploadFacture(event: any) {
    this.fileFacture = event.files[0];
    // TODO: upload vers backend via api.uploadBonReception(file, reception.id)
    console.log('Upload fichier facture :', this.fileFacture);
}
uploadFactureUpdate(event: any) {
  this.fileFacture = event.files[0];
  // TODO: upload vers backend via api.uploadBonReception(file, reception.id)
  this.uploadFactureAfterCreation(this.nouvelleFacture.id);
  console.log('Upload fichier facture :', this.fileFacture);
}
triggerUpload(fileUpload: any): void {
  const nativeInput = fileUpload?.el?.nativeElement.querySelector('input[type="file"]');
  if (nativeInput) {
    nativeInput.click();
  }
}

uploadFactureAfterCreation(factureAchatId: number): void {
  if (!this.fileFacture) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun fichier',
      detail: 'Veuillez sélectionner un fichier à téléverser'
    });
    return;
  }

  this.loading = true;

  this.factureService.uploadFactureFile(factureAchatId, this.fileFacture).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Facture téléversé avec succès'
      });
      this.fileFacture = null; // Réinitialiser
      this.factureService.getById(factureAchatId).subscribe(res=>{
        this.nouvelleFacture=res ; 
      })
      //this.getLivraisons();
      this.loading = false;
      //this.uploadBonLivraisonDialog=false; 
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléversement du facture'
      });
      this.loading = false;
    }
  });
}
}
