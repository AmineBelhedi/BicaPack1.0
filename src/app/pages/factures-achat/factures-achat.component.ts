import { DatePipe } from '@angular/common';
import { ThisReceiver } from '@angular/compiler';
import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService, SharedModule } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FileUpload } from 'primeng/fileupload';
import { Table } from 'primeng/table';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { DocumentFacturation } from 'src/app/models/documentFacture';
import { FactureAchat, LigneFactureAchat } from 'src/app/models/facture-achat-delavage';
import { Fournisseur } from 'src/app/models/fournisseur';
import { ApiService } from 'src/app/services/api.service';
import { Banque, BanqueService } from 'src/app/services/banque.service';
import { CommandeService } from 'src/app/services/commande.service';
import { CompteComptable, CompteComptableService } from 'src/app/services/compte-comptable.service';
import { AffectationRequest, DeviseTotalDTO, FacturationService } from 'src/app/services/facturation.service';
@Component({
  selector: 'app-factures-achat',
  templateUrl: './factures-achat.component.html',
  styleUrls: ['./factures-achat.component.scss'],
  providers: [MessageService, ConfirmationService,DatePipe]
})
export class FacturesAchatComponent {
  @ViewChild('factureAchatUpload') factureAchatUpload: FileUpload | undefined;
  @ViewChild('factureAchatUploadCreate') factureAchatUploadCreate: FileUpload | undefined;
  
  factures: FactureAchat[] = [];
  nouvelleFacture: FactureAchat = this.initialiserFacture();
  dialogVisible = false;
  dialogUpdate = false;
  dialogDelete = false;
  dialogView = false;
  isDesktop :boolean ; 
  loading = false;
  factureToDelete: FactureAchat | null = null;
  selectedFacture: FactureAchat = this.initialiserFacture();
  comptes: CompteComptable[] = [];
  // Fournisseur
  fournisseur: Fournisseur = new Fournisseur();
  fournisseurs: Fournisseur[] = [];
  filteredFournisseur: Fournisseur[] = [];
  filteredCompteCredit : CompteComptable[]=[];
  filteredCompteDebit : CompteComptable[]=[]; 

  fournisseurDialogCreate = false;
  fournisseurDialogUpdate = false;
  deleteFournisseurDialog = false;
  submittedFournisseur = false;
  ligneFacture : LigneFactureAchat ;
  fileFactures: File[] = []; // 🔹 plusieurs fichiers possibles
  comptesDebit : CompteComptable[]=[]; 
  comptesCredit :CompteComptable[]=[]; 
  comptesRetenue : CompteComptable[]=[]; 

  compteComptableBanque : CompteComptable ; 
  comptesBanques :CompteComptable[]=[]; 
  filteredComptesBanque : CompteComptable[]=[]; 
  compteBanqueDialog : boolean = false ; 

  compteRetenue : CompteComptable ; 
  compteRetenueDialog : boolean = false ; 

  filteredCompteRetenue : CompteComptable[]=[];   
  compteCredit : CompteComptable ; 
  compteDebit : CompteComptable; 
  compteCreditDialog : boolean = false ; 
  compteDebitDialog : boolean = false ; 
  banque : Banque ; 
  banques :Banque[]=[]; 
  loadingTable : boolean=false ; 
  filteredBanque : Banque[]=[]; 
  banqueDialog : boolean = false ; 
  dialogAffectation = false;  // ouverture du dialog
  ligneEnCours: LigneFactureAchat | null = null;  
  affectations: AffectationRequest[] = [];  
  commandes: CommandeDTO[] = []; 
  dialogExistantes: boolean = false;
  dialogNouvelles: boolean = false;
  items: MenuItem[] = [];
  constructor(
    private factureService: FacturationService,private compteService: CompteComptableService, private banqueService :BanqueService, private datePipe: DatePipe, 
    private messageService: MessageService,private layoutService : LayoutService, private confirmationService: ConfirmationService,private commandeService : CommandeService, 
    private api: ApiService
  ) {}

  ngOnInit(): void {
   this.loadFacturesLazy({ first: 0, rows: 10 ,sortField: 'dateFacture', 
  sortOrder: 1 }); // charger la première page
    //this.loadFactures();
    this.getFournisseurs();
    this.getComptesCredit(); 
    this.getComptesDebit(); 
    this.getComptesComptableBanque(); 
    this.getComptesRetenue();
    this.isDesktop = this.layoutService.isDesktop(); 
    this.loadComptes();
    this.getCommandes();
    this.loadBanques();
    this.getTotalFactureAchat(); 
  
  }
  removeExistingAffectation(index: number) {
    this.ligneEnCours.affectations.splice(index, 1);
  }
  getSpeedDialItems(ligne: any, index: number): MenuItem[] {
    return [
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.removeLigne(index)
      },
      {
        label: 'Affectation',
        icon: 'pi pi-share-alt',
        command: () => this.openAffectationDialog(ligne)
      }
    ];
  }

    clearDateFilter() {
  this.startDate = undefined;
  this.endDate = undefined;
  this.loadFacturesLazy({ first: 0, rows: 10,sortField: 'dateFacture', 
  sortOrder: 1  }); // recharge sans filtre
}
getCommandes(){
  this.commandeService.getAll().subscribe(res=>{
    this.commandes=res; 
  },err=>{

  })
}

saveCompteDebit(){
  this.compteService.createCompteDebit(this.compteDebit).subscribe(res=>{
    this.nouvelleFacture.compteDebit=res ; 
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
saveCompteRetenue(){
  this.compteService.createCompteRetenue(this.compteRetenue).subscribe(res=>{
    this.nouvelleFacture.compteRetenue=res ; 
    this.messageService.add({
      severity: 'success',
      summary: 'Création Compte',
      detail: 'Compte Retenu créer avec succès'
    });
    this.compteRetenueDialog = false; 
    this.getComptesRetenue() ; 
  },err=>{
    this.messageService.add({
      severity: 'error',
      summary: 'Création Compte',
      detail: 'Création Compte Retenu a échouée'
    });
  })
}
saveCompteCredit(){
  this.compteService.createCompteCredit(this.compteCredit).subscribe(res=>{
    this.nouvelleFacture.compteCredit=res ; 
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

getComptesCredit(){
  this.compteService.getAllCredit().subscribe(res=>{
    this.comptesCredit = res; 
  })
}
getComptesComptableBanque(){
  this.compteService.getAllCompteComptableBanques().subscribe(res=>{
    this.comptesBanques = res; 
  })
}
getComptesRetenue (){
  this.compteService.getAllRetenue().subscribe(res=>{
    this.comptesRetenue =res ; 
 this.comptesRetenue.map(item=>{
  item.name = item.numeroCompte + ' | '+item.intitule+' | '+item.taux; 
 })
  })
}
getComptesDebit(){
  this.compteService.getAllDebit().subscribe(res=>{
    this.comptesDebit =res ;
  })
}


confirmDeleteDocument(factureId: number, documentId: number) {
  this.confirmationService.confirm({
    message: 'Voulez-vous vraiment supprimer ce fichier ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    accept: () => {
      this.deleteDocument(factureId, documentId);
    }
  });
}
deleteDocument(factureId: number, documentId: number) {
  this.factureService.deleteDocument( documentId).subscribe({
    next: () => {
      // Retirer le document de la liste affichée
      // const facture = this.factures.find(f => f.id === factureId);
      // if (facture && facture.documents) {
      //   facture.documents = facture.documents.filter(d => d.id !== documentId);
      // }
      this.nouvelleFacture.documents= this.nouvelleFacture.documents.filter(d => d.id !== documentId);
      this.messageService.add({
        severity: 'success',
        summary: 'Supprimé',
        detail: 'Document supprimé avec succès'
      });
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de la suppression du document'
      });
    }
  });
}
  openAffectationDialog(ligne: LigneFactureAchat) {
    this.ligneEnCours = ligne;
    
    this.affectations = []; // reset
    this.dialogAffectation = true;
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
  // Ajouter une ligne d'affectation
  addAffectation() {
    this.affectations.push({ commandeId: null, pourcentage: 0 });
  }

  // Supprimer une ligne d'affectation
  removeAffectation(index: number) {
    this.affectations.splice(index, 1);
  }

  saveAffectations() {
    if (!this.ligneEnCours?.id) {
      this.messageService.add({ severity: 'warn', summary: 'Erreur', detail: 'Ligne non valide' });
      return;
    }

    this.factureService.affecterLigneFacture(this.ligneEnCours.id, this.affectations).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Ligne affectée avec succès' });
        this.dialogAffectation = false;
        this.factureService.getFactureAchatById(this.nouvelleFacture.id).subscribe(res=>{
          this.nouvelleFacture=res ; 
        })
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec affectation' });
        console.error(err);
      }
    });
  }
  // Charger toutes les factures
  loadFactures() {
    this.loading = true;
    this.factureService.getAllFactureAchat().subscribe({
      next: (res) => {
        res.map(item => {
          item.dateEcheance = new Date(item.dateEcheance);
          item.dateFacture = new Date(item.dateFacture);
        });
  
        // tri décroissant par dateFacture
        this.factures = res.sort((a, b) => 
          new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
        );
  
        this.loading = false;
       // console.log(this.factures);
      },
      error: () => this.loading = false
    });
  }
  

  loadBanques(): void {
    this.banqueService.getAllBanques().subscribe({
      next: (data) => this.banques = data,
      error: (err) => console.error('Erreur chargement banques', err)
    });
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
  

  // Fournisseur
  openNewFournisseur() {
    this.fournisseur = { id: 0, nom: '', matFiscale: '' };
    this.submittedFournisseur = false;
    this.fournisseurDialogCreate = true;
  }
  openNewCompteCredit(){
    this.compteCredit ={ id: 0 , intitule :'' , numeroCompte : '' }; 
    this.compteCreditDialog = true ; 
  }
  openNewCompteDebit(){
    this.compteDebit ={ id: 0 , intitule :'' , numeroCompte : '' }; 
    this.compteDebitDialog = true ; 
  }
  openNewCompteBanque(){
    this.compteComptableBanque = { id: 0 , intitule :'' , numeroCompte : '' }; 
    this.compteBanqueDialog = true ; 
  }
  opennewCompteRetenue(){
    this.compteRetenue={ id: 0 , intitule :'' , numeroCompte : '' }; 
    this.compteRetenueDialog = true ; 
  }

  hideCompteRetenueDialog(){
    this.compteRetenueDialog= false ; 
    this.compteRetenue={ id: 0 , intitule :'' , numeroCompte : '' }; 
  }
  hideCompteBanqueDialog(){
    this.compteBanqueDialog= false ; 
    this.compteComptableBanque={ id: 0 , intitule :'' , numeroCompte : '' }; 
  }
  hideBanqueDialog(){
    this.banqueDialog = false; 
    this.banque ={
      id : 0 , nom : '' , numeroRib: '' , compteComptable:null
    }
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
  hideDialogCompteCredit(){
    this.compteCreditDialog = false; 
  }
  hideDialogCompteDebit(){
    this.compteDebitDialog = false; 
  }
  hdieDialogBanque(){
    this.banqueDialog = false ; 
  }


  saveFournisseur() {
    this.submittedFournisseur = true;
    if (this.fournisseur.nom?.trim()) {
      this.api.addFournisseur(this.fournisseur).subscribe(
        (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Fournisseur Created',
            life: 3000,
          });
          this.getFournisseurs();
          this.nouvelleFacture.fournisseur = res;
          this.fournisseurDialogCreate = false;
          this.resetFournisseur();
        },
        (error) => {
          alert(error.message);
        }
      );
    }
  }

  resetFournisseur() {
    this.fournisseur = { id: 0 };
  }

  // Initialiser une facture
  initialiserFacture(): FactureAchat {
    return {
      id: 0,
      numeroFacture: '',
      dateFacture: new Date(),
      dateEcheance: new Date(),
      datePaiement : new Date () , 
      modePaiement: '',
      categorisation: '',
      cours : 0 , 
      devise:'EUR',
      brouillon: true,
      fournisseur: null,
      lignes: [this.creerLigne()],
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
      banque : null,
      documents: []
    };
  }
  onFournisseurSelected(event: any) {
    const fournisseur = event.value; // ✅ récupérer le fournisseur sélectionné
  
    if (fournisseur) {
      if (fournisseur.compteCredit) {
        this.nouvelleFacture.compteCredit = fournisseur.compteCredit;
      }
      if (fournisseur.compteDebit) {
        this.nouvelleFacture.compteDebit = fournisseur.compteDebit;
      }
      
    }

  }
  
  
  isFormValid(): boolean {
    const f = this.nouvelleFacture;
  
    // Vérifier les champs obligatoires
    return !!(
      f.fournisseur &&
      f.numeroFacture &&
      f.dateFacture &&
      f.modePaiement &&
      f.devise &&
      f.compteCredit &&
      f.compteDebit 
    );
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
    const query = event.query.toLowerCase();
    this.filteredFournisseur = this.fournisseurs.filter(f =>
      f.nom.toLowerCase().startsWith(query)
    );
  }
  filterBanque(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredBanque = this.banques.filter(f =>
      f.numeroRib.toLowerCase().startsWith(query)
    );
  }
  filterComptesCredit(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredCompteCredit = this.comptesCredit.filter(f =>
      f.numeroCompte.toLowerCase().startsWith(query)
    );
  }
  filterComptesBanque(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredComptesBanque = this.comptesBanques.filter(f =>
      f.numeroCompte.toLowerCase().startsWith(query)
    );
  }
  filterComptesDebit(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredCompteDebit = this.comptesDebit.filter(f =>
      f.numeroCompte.toLowerCase().startsWith(query)
    );
  }
  filterComptesRetenue(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredCompteRetenue = this.comptesRetenue.filter(f =>
      f.numeroCompte.toLowerCase().startsWith(query)
    );
  }
  openNewDialog() {
    // this.nouvelleFacture = this.initialiserFacture();
    // this.dialogVisible = true;
    this.nouvelleFacture = this.mergeFactureSafe();
    this.dialogVisible = true;
  }
// getTotalByDevise(devise: string): number {
//   if (!this.factures) return 0;
//   return this.factures
//     .filter(f => f.devise === devise)
//     .reduce((sum, f) => sum + (f.totalTTC || 0), 0);
// }

  // editFacture(facture: FactureAchat) {
  //   this.nouvelleFacture = { ...facture }; 
  //   this.dialogUpdate = true; 
  // }
  editFacture(facture: FactureAchat) {
    this.nouvelleFacture = this.mergeFactureSafe(facture);
    this.nouvelleFacture.dateFacture = new Date(this.nouvelleFacture.dateFacture);
    if (this.nouvelleFacture.datePaiement != undefined )
    this.nouvelleFacture.datePaiement = new Date(this.nouvelleFacture.datePaiement);
    this.dialogUpdate = true;
  }
  
    totalFacturesAchat : DeviseTotalDTO[] =[] ; 
    totaux: { [key: string]: number } = {};


getTotalFactureAchat() {
  this.factureService.getTotalFacturesAchat().subscribe(res => {
    this.totaux = {};
    res.forEach((t: any) => {
      this.totaux[t.devise] = t.total;
    });
    //console.log(this.totaux); // { EUR: 1914981.86, TND: 3484888.92 }
  });
}

  mergeFactureSafe(facture?: Partial<FactureAchat>): FactureAchat {
    const base = this.initialiserFacture();
  
    return {
      ...base,
      ...facture,
      lignes: facture?.lignes && facture.lignes.length > 0 ? facture.lignes : base.lignes,
      banque: facture?.banque ?? base.banque,
      documents: facture?.documents ?? base.documents
    };
  }
  familles: string[] = ['TEXTILE', 'CHIMIQUE', 'ACCESSOIRE', 'SERVICE']; // tes familles par défaut
filteredFamilles: string[] = [];

filterFamilles(event: any) {
  const query = event.query.toLowerCase();
  this.filteredFamilles = this.familles.filter(f =>
    f.toLowerCase().includes(query)
  );
}

convertFamilleMaj(value: string) {
  if (value) {
    this.nouvelleFacture.fournisseur.famille = value.toUpperCase();
    // Ajouter dynamiquement si nouvelle famille
    if (!this.familles.includes(this.nouvelleFacture.fournisseur.famille)) {
      this.familles.push(this.nouvelleFacture.fournisseur.famille);
    }
  }
}

  
  maximizeDialog(dialog: any) {
    // Ajoute la classe primeng qui force le mode maximisé
    const element = document.querySelector('.p-dialog');
    if (element) {
      element.classList.add('p-dialog-maximized');
    }
  }
  
  openViewFacture(f: FactureAchat) {
    this.dialogView = true;
    this.selectedFacture = { ...f };

    // 1) totaux immédiats (au cas où l’objet de la liste est déjà complet)
    this.recomputeViewTotals();
   // this.cdr.detectChanges(); // optionnel mais utile selon le thème/CD

    // 2) re-hydratation depuis l’API puis recalcul
    // this.factureService.getFactureAchatById(f.id).subscribe({
    //   next: (full) => {
    //     this.selectedFacture = full;
    //     this.recomputeViewTotals();
    //     this.cdr.detectChanges(); // garantit l’affichage
    //   }
    // });
  }

viewTotals = { ht: 0, tva: 0, red: 0, ttc: 0 };
  private recomputeViewTotals(): void {
    const f = this.selectedFacture;
    if (!f || !Array.isArray(f.lignes) || f.lignes.length === 0) {
      this.viewTotals = { ht: 0, tva: 0, red: 0, ttc: 0 };
      return;
    }

    let ht = 0, tva = 0, red = 0, ttc = 0;
    for (const l of f.lignes) {
      const q = this.n(l?.quantite);
      const pu = this.n(l?.prixUnitaire);
      const tx = this.n(l?.taxe);        // TVA %
      const rd = this.n(l?.reduction);   // Réduction %
      const base = q * pu;

      if (tx === rd) {
        ht  += base;
        tva += 0;
        red += 0;
        ttc += base;
      } else {
        const mRed   = base * (rd / 100);
        const after  = base - mRed;
        const mTVA   = after * (tx / 100);
        ht  += after;
        tva += mTVA;
        red += mRed;
        ttc += after + mTVA;
      }
    }
    this.viewTotals = { ht, tva, red, ttc };
  }
  // Initiales de la banque si pas de logo
getBankInitials(name?: string): string {
  if (!name) return 'B';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]).join('').toUpperCase();
}
private n(v: any): number {
  const x = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(x) ? x : 0;
}

// Copier dans le presse-papiers (avec toast)
copyToClipboard(text?: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    this.messageService.add({
      severity: 'success',
      summary: 'Copié',
      detail: 'RIB copié dans le presse-papiers'
    });
  }).catch(() => {
    this.messageService.add({
      severity: 'warn',
      summary: 'Impossible de copier',
      detail: 'Veuillez copier manuellement'
    });
  });
}
  deleteFacture(facture: FactureAchat) {
    this.factureToDelete = facture;
    this.dialogDelete = true;
  }

  addProduct() {

    this.nouvelleFacture.lignes.push(this.creerLigne());
  }


  loadComptes(): void {
    this.compteService.getAll().subscribe({
      next: (data) => this.comptes = data,
      error: (err) => console.error('Erreur chargement comptes', err)
    });
  }

  ajouterCompte() {
    const nouveau: CompteComptable = { numeroCompte: '601', intitule: 'Achats matières premières' };
    this.compteService.create(nouveau).subscribe({
      next: (res) => {
        console.log('Compte ajouté', res);
        this.loadComptes();
      }
    });
  }
  modesPaiement = [
    { label: 'Espèces', value: 'ESPECES' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Carte Bancaire', value: 'CARTE' }
  ];
  // Sauvegarder une facture
  saveFacture() {
    this.loading=true ; 
    this.factureService.createFactureAchat(this.nouvelleFacture).subscribe((res) => {
      this.dialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Nouvelle facture créée' });
      this.loadFacturesLazy({ first: 0, rows: 10 ,sortField: 'dateFacture', 
  sortOrder: 1 }); 
     // this.factureAchatUploadCreate.clear();
    
      this.loading = false;
    });
  }
  removeLigne(index: number) {
    this.nouvelleFacture.lignes.splice(index, 1);
  }

  onFileSelect(event: any, fileUpload: FileUpload) {
    const file: File = event.files[0]; // on prend le premier fichier
    if (file) {
      this.uploadFacturePdf(file, fileUpload);
    }
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal(
        (event.target as HTMLInputElement).value,
        'contains'
    );
}
search: string = '';

onSearchChange() {
  // Recharge depuis le backend avec le filtre texte
  this.loadFacturesLazySearch({ first: 0, rows: 10 });
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

  //   this.factureService.getFacturesAchatPagedFiltered(page, size, sortField, sortOrder, filters)
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
startDate?: string;
endDate?: string;
applyDateFilter() {
  this.startDate = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd') : undefined;
this.endDate = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd') : undefined;

  this.loadFacturesLazy({ first: 0, rows: 10 });
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

  this.factureService.getFacturesAchatPagedFiltered(page, size, sortField, sortOrder, filters)
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

  this.factureService.getFacturesAchatPagedFiltered(page, size, sortField, sortOrder, filters)
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
  // loadFacturesLazySearch(event: LazyLoadEvent) {
  //  // this.loading = true;

  //   const page = event.first ? event.first / (event.rows || 10) : 0;
  //   const size = event.rows || 10;
  //   const sortField = event.sortField || 'dateFacture';
  //   const sortOrder = event.sortOrder === 1 ? 'desc' : 'asc';

  //   const filters: any = {};
  //   if (this.search) filters.search = this.search;
  //   if (this.fournisseurId) filters.fournisseurId = this.fournisseurId;
  //   if (this.exonere !== undefined) filters.exonere = this.exonere;

  //   this.factureService.getFacturesAchatPagedFiltered(page, size, sortField, sortOrder, filters)
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
 @ViewChild('dtF') dtF!: Table;



    getTotalByDevise(devise: string): number {
    const table = this.dtF;
    const data = table?.filteredValue?.length ? table.filteredValue : table?.value;
    return (data || [])
    .filter(f => f.devise === devise)
    .reduce((sum, f) => sum + Number(f.netAPayer ?? f.totalTTC ?? 0), 0);

  }


  uploadFacturePdf(file: File, fileUpload: FileUpload) {
    this.factureService.uploadDocument(
      this.nouvelleFacture.id,
      file,
      "FACTURE_ACHAT_" + this.nouvelleFacture.numeroFacture
    ).subscribe({
      next: (doc: DocumentFacturation) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Document ${doc.filename} téléversé`
        });
  
        fileUpload.clear(); // vider la sélection
  
        // 🔥 Ajouter directement le doc à la liste existante
        if (!this.nouvelleFacture.documents) {
          this.nouvelleFacture.documents = [];
        }
        this.nouvelleFacture.documents.push(doc);
  
        // ✅ plus besoin de rappeler getFactureAchatById
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de l’upload du document'
        });
      }
    });
  }
  

 updateFacture() {
  this.loading = true;
  this.factureService.updateFactureAchat(this.nouvelleFacture.id, this.nouvelleFacture).subscribe({
    next: (res) => {
      if (this.fileFactures.length > 0) {
        this.factureService.uploadMultipleDocuments(res.id, this.fileFactures, 'FACTURE_ACHAT').subscribe({
          next: () => {
            this.updateFactureInTable(res);
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Facture mise à jour et fichiers ajoutés' });
            this.fileFactures = [];
            this.dialogUpdate = false;
            this.factureAchatUpload.clear();
            this.loading = false;
          },
          error: () => {
            this.messageService.add({ severity: 'warn', summary: 'Erreur fichier', detail: 'Fichiers non téléversés' });
            this.dialogUpdate = false;
            this.loading = false;
          }
        });
      } else {
        this.updateFactureInTable(res);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Facture mise à jour' });
        this.factureAchatUpload.clear();
        this.dialogUpdate = false;
        this.loading = false;
      }
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour de la facture' });
      console.error("Erreur lors de la mise à jour de la facture", err);
      this.loading = false;
    }
  });
}

/** 🔹 Méthode utilitaire pour mettre à jour la ligne dans le tableau */
private updateFactureInTable(updated: any) {
  const index = this.factures.findIndex(f => f.id === updated.id);
  if (index !== -1) {
    this.factures[index] = { ...updated }; // remplace la ligne
    this.factures = [...this.factures];    // force le refresh Angular
  }
}


  confirmDelete(facture: FactureAchat) {
    this.factureService.deleteFactureAchat(facture.id).subscribe({
      next: () => {
        this.loadFactures();
        this.dialogDelete = false;
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de la facture", err);
      }
    });
  }

  get totalReduction(): number {
    return this.nouvelleFacture.lignes.reduce((total, ligne) => {
      const base = (ligne.quantite || 0) * (ligne.prixUnitaire || 0);
      const montantReduction = base * ((ligne.reduction || 0) / 100);
      return total + montantReduction;
    }, 0);
  }
  
  get totalTVA(): number {
    return this.nouvelleFacture.lignes.reduce((t, ligne) => {
      const base = (ligne.quantite || 0) * (ligne.prixUnitaire || 0);
      // ⚡️ TVA sur le brut (ignorer la réduction)
      return t + (base * ((ligne.taxe || 0) / 100));
    }, 0);
  }
  
  // Totaux calculés en front (optionnel, car déjà calculés en back)
  // get totalHT(): number {
  //   return this.nouvelleFacture.lignes.reduce((t, l) => {
  //     const base = (l.quantite || 0) * (l.prixUnitaire || 0);
  
  //     // ⚡️ Si taxe == réduction, on ignore les deux
  //     if (l.taxe === l.reduction) {
  //       return t + base;
  //     }
  
  //     return t + (base * (1 - (l.reduction || 0) / 100));
  //   }, 0);
  // }
  
  // get totalTVA(): number {
  //   return this.nouvelleFacture.lignes.reduce((t, l) => {
  //     const base = (l.quantite || 0) * (l.prixUnitaire || 0);
  
  
  //     return t + (base * (1 - (l.reduction || 0) / 100) * ((l.taxe || 0) / 100));
  //   }, 0);
  // }
  // get totalTTC(): number {
  //   return this.nouvelleFacture.lignes.reduce((t, l) => {
  //     const base = (l.quantite || 0) * (l.prixUnitaire || 0);
  
  //     if (l.taxe === l.reduction) {
  //       return t + base; // ⚡️ TTC = HT si ça s’annule
  //     }
  
  //     return t + (base * (1 - (l.reduction || 0) / 100) * (1 + (l.taxe || 0) / 100));
  //   }, 0);
  // }
  // === TOTALS EXISTANTS ===

// Montant total HT
get totalHT(): number {
  return this.nouvelleFacture.lignes.reduce((t, l) => {
    const base = (l.quantite || 0) * (l.prixUnitaire || 0);

    if (l.taxe === l.reduction) {
      return t + base;
    }
    return t + (base * (1 - (l.reduction || 0) / 100));
  }, 0);
}

// TVA totale


// Montant TTC
get totalTTC(): number {
  return this.nouvelleFacture.lignes.reduce((t, l) => {
    const base = (l.quantite || 0) * (l.prixUnitaire || 0);

    if (l.taxe === l.reduction) {
      return t + base;
    }
    return t + (base * (1 - (l.reduction || 0) / 100) * (1 + (l.taxe || 0) / 100));
  }, 0);
}

// === NOUVEAU : RETENUE ===

// Retenue appliquée si compteRetenue existe
get totalRetenue(): number {
  if (!this.nouvelleFacture.compteRetenue || !this.nouvelleFacture.compteRetenue.taux) {
    return 0;
  }

  const taux = this.nouvelleFacture.compteRetenue.taux || 0;
  return this.totalTTC * (taux / 100);
}
get netAPayer(): number {
  return this.totalTTC - this.totalRetenue;
}
// === NET À PAYER ===


  getTotalLigne(ligne: any): number {
    const base = (ligne.quantite || 0) * (ligne.prixUnitaire || 0);
  
    // ⚡️ Si taxe = réduction => on considère que ça s'annule
    if (ligne.taxe === ligne.reduction) {
      return base;
    }
  
    // Sinon, on applique le calcul normal
    return (base * (1 + (ligne.taxe || 0) / 100)) * (1 - (ligne.reduction || 0) / 100);
  }
  
  // Voir une facture
  // openViewFacture(facture: FactureAchat) {
  //   this.dialogView = true;
  //   this.selectedFacture = { ...facture };
  // }
  openEditFacture(facture :FactureAchat){

  }

  // Gestion upload fichier
  uploadFactures(event: any) {
    this.fileFactures = event.files;
    console.log('Fichiers sélectionnés :', this.fileFactures);
  }

  triggerUpload(fileUpload: any): void {
    const nativeInput = fileUpload?.el?.nativeElement.querySelector('input[type="file"]');
    if (nativeInput) {
      nativeInput.click();
    }
  }

  // --- HT ---
get selectedTotalHT(): number {
  if (!this.selectedFacture?.lignes) return 0;

  return this.selectedFacture.lignes.reduce((t, l) => {
    const base = (l.quantite || 0) * (l.prixUnitaire || 0);

    if (l.taxe === l.reduction) {
      return t + base;
    }
    return t + (base * (1 - (l.reduction || 0) / 100));
  }, 0);
}



recalculerPourcentages() {
  const total = this.affectations.length;

  if (total === 1) {
    // Si une seule affectation -> 100%
    this.affectations[0].pourcentage = 100;
  } else if (total > 1) {
    let somme = 0;

    // Prendre toutes les valeurs sauf la dernière
    for (let i = 0; i < total - 1; i++) {
      let val = Number(this.affectations[i].pourcentage || 0);

      // bornes min/max
      if (val < 1) val = 1;
      if (val > 100) val = 100;

      this.affectations[i].pourcentage = val;
      somme += val;
    }

    // Calcul du reste pour le dernier
    let reste = 100 - somme;
    if (reste < 0) reste = 0;
    if (reste > 100) reste = 100;

    this.affectations[total - 1].pourcentage = reste;
  }
}
// --- TVA ---
get selectedTotalTVA(): number {
  if (!this.selectedFacture?.lignes) return 0;

  return this.selectedFacture.lignes.reduce((t, l) => {
    const base = (l.quantite || 0) * (l.prixUnitaire || 0);
    // TVA calculée sur le brut (comme tu as demandé)
    return t + (base * ((l.taxe || 0) / 100));
  }, 0);
}

// --- Réduction ---
get selectedTotalReduction(): number {
  if (!this.selectedFacture?.lignes) return 0;

  return this.selectedFacture.lignes.reduce((total, ligne) => {
    const base = (ligne.quantite || 0) * (ligne.prixUnitaire || 0);
    return total + (base * ((ligne.reduction || 0) / 100));
  }, 0);
}

// --- TTC ---
get selectedTotalTTC(): number {
  if (!this.selectedFacture?.lignes) return 0;

  return this.selectedFacture.lignes.reduce((t, l) => {
    const base = (l.quantite || 0) * (l.prixUnitaire || 0);

    if (l.taxe === l.reduction) {
      return t + base;
    }
    return t + (base * (1 - (l.reduction || 0) / 100) * (1 + (l.taxe || 0) / 100));
  }, 0);
}

// --- Retenue ---
get selectedTotalRetenue(): number {
  if (!this.selectedFacture?.compteRetenue?.taux) {
    return 0;
  }
  const taux = this.selectedFacture.compteRetenue.taux || 0;
  return this.selectedTotalTTC * (taux / 100);
}

// --- Net à payer ---
get selectedNetAPayer(): number {
  return this.selectedTotalTTC - this.selectedTotalRetenue;
}

}
