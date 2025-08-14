import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FileUploadHandlerEvent, FileUpload } from 'primeng/fileupload';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { RouleauImport } from 'src/app/models/import';
import { CommandeService } from 'src/app/services/commande.service';
import { ImportService } from 'src/app/services/import.service';
type RowView = CommandeDTO & {
  nomCommande?: string;
  imageUrl?: string;
};

type Allocation = {
  id: number;
  rouleauId: number | string;
  poidsReserve: number;
  etat: 'RESERVED' | 'CONSUMED' | 'CANCELED';
  dateAllocation?: string;
  dateConsommation?: string;
  dateAnnulation?: string;
};

type PieceJointe = { name: string; size: number; type: string; url: string };

@Component({
  selector: 'app-detail-commande',
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.scss'], providers :[MessageService]
})
export class DetailCommandeComponent implements OnInit {
  loading = true;
  notFound = false;
  commande?: CommandeDTO;
  uploading = false;
  rouleaux : RouleauImport[]=[]; 
  cacheBust: number | null = null;
  qrValue = '';
  allocations: Allocation[] = [];
  grammage = 80; // g/m²
    idCommande  : any ; 
  // UI only
  pieces: PieceJointe[] = [];

  // --- petit formulaire "ajouter rouleau utilisé"
  formAlloc = { rouleauId: '', poids: 0 };

  // allocations locales (quand il n'y a pas d'API)
  private localAllocs: Allocation[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,private importService :ImportService, 
    private svc: CommandeService, private toast: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.idCommande =this.route.snapshot.paramMap.get('id'); 
    if (!id) { this.notFound = true; this.loading = false; return; }
    this.getCommande(); 
    
  }


  getRouleaux(){
    this.importService.searchRouleauxByLaizeAndPoidsMin(this.commande.largeur, this.calculPoidsTotalCommande(this.commande)).subscribe({
      next: (rouleaux) => {
        console.log('Rouleaux trouvés :', rouleaux);
        this.rouleaux = rouleaux;
        this.rouleaux.map(item=>{
          item.reference = item.numero+" | "+item.laize+" | Poids Dispo : "+item.poidsRestant +"Kg"; 
        })
      },
      error: (err) => console.error('Erreur de recherche', err)
    });
    
  }


  getCommande(){
    this.svc.getById(this.idCommande).subscribe({
      next: (cmd) => {
        this.commande = cmd;
        this.qrValue = `${location.origin}/pages/detail-commande/${this.idCommande}`;
        if (this.commande.poidsPoigner != null && this.commande.poidsPoigner > 0 ){
          this.hasPoigner = true ; 
        }
        if (this.commande.soufflet != null && this.commande.soufflet > 0 ){
          this.hasSoufflet = true ; 
        }
        this.getRouleaux();
        // charge les allocations serveur + locales
        this.localAllocs = this.loadLocalAllocations(this.idCommande);
        this.reloadAllocations();

        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }
  private dtoToView(dto: CommandeDTO): RowView {
    return {
      ...dto,
      nomCommande: (dto as any).nomCommande ?? dto.description ?? '',
      imageUrl: (dto as any).imageUrl ?? ''
    };
  }
  private toNum(v: any, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  private viewToApiPayload(view: RowView): CommandeDTO {
    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      quantite: this.toNum(view.quantite, 0),
      largeur: this.toNum(view.largeur, 0),
      longueur: this.toNum(view.longueur, 0),
      grammage: this.toNum(view.grammage, 0),
      poidsPoigner: this.toNum(view.poidsPoigner, 0),
      soufflet: this.toNum(view.soufflet, 0),
      description: (view.nomCommande ?? view.description ?? '').trim(),
      // Si ton backend expose ces champs, ils restent transmis tels quels :
      poidsNecessaire: view.poidsNecessaire,
      poidsReserve: view.poidsReserve,
      poidsConsomme: view.poidsConsomme
    };
  }


  hasPoigner: boolean = false;
hasSoufflet: boolean = false;

togglePoigner() {
  if (!this.hasPoigner) {
    this.commande.poidsPoigner = null; 
    this.saveCommande(); 
    // réinitialise si décoché
  }
}

toggleSoufflet() {
  if (!this.hasSoufflet) {
    this.commande.soufflet = null; // réinitialise si décoché
    this.saveCommande();
  }
}
poidsTotal : number = 0 ; 
  saveCommande() {
    if (!this.commande.numeroCommande?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande obligatoire', life: 2500 });
      return;
    }
    if ((this.commande.quantite ?? 0) <= 0 ||
        (this.commande.largeur  ?? 0) <= 0 ||
        (this.commande.longueur ?? 0) <= 0 ||
        (this.commande.grammage ?? 0) <= 0  ) {
      this.toast.add({ severity: 'warn', summary: 'Vérifier les valeurs', detail: 'Quantité et dimensions', life: 2500 });
      return;
    }

    const payload = this.viewToApiPayload(this.commande);

    if (this.commande.id) {
      this.svc.update(payload).subscribe({
        next: updated => {
          const v = this.dtoToView(updated);
      
          this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée', life: 2500 });
          //this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 })
      });
    } 
  }
  onPickImage(evt: Event, commandeId: number): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
  
    // (optionnel) petite validation
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      this.toast.add({ severity: 'warn', summary: 'Fichier trop volumineux', detail: `Max ${maxMb} Mo` });
      input.value = '';
      return;
    }
  
    this.uploading = true;
    this.svc.uploadImage(commandeId, file).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Image téléversée', detail: 'Mise à jour réussie' });
        this.cacheBust = Date.now(); 
            // force le refresh de l’aperçu
        this.uploading = false;
        this.getCommande();
        input.value = '';                // reset input
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Échec', detail: 'Upload échoué' });
        this.uploading = false;
        input.value = '';
      }
    });
  }
  backToList() { this.router.navigate(['/pages/commandes']); }

  /* ===================== Actions backend (global) ===================== */
  calculerPoids() {
    if (!this.commande?.id) return;
    this.svc.calculPoidsNecessaire(this.commande.id, this.grammage).subscribe({
      next: () => this.reload(),
      error: () => {}
    });
  }

  onImageUpload(evt: FileUploadHandlerEvent, uploader: FileUpload): void {
    const file = evt.files?.[0];
    if (!file || !this.commande?.id) {
      this.toast.add({ severity: 'warn', summary: 'Manquant', detail: 'Fichier ou commande non trouvé.' });
      return;
    }

    this.uploading = true;
    this.svc.uploadImage(this.commande.id, file).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Succès', detail: 'Image téléversée.' });
        uploader.clear();
        this.uploading = false;

        // Si l’URL d’image ne change pas côté serveur, force le rafraîchissement du cache :
        this.cacheBust = Date.now();

        // Optionnel : recharger la commande depuis l’API si elle renvoie l’URL mise à jour
        // this.reloadCommande();
      },
      error: (err) => {
        console.error(err);
        this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Upload échoué.' });
        this.uploading = false;
      }
    });
  }

  reserver(rouleauId: number, poids: number) {
    if (!this.commande?.id) return;
  
    this.svc.reserver(this.commande.id, rouleauId, poids).subscribe({
      next: () => {
        this.reloadAllocations();
        this.toast.add({
          severity: 'success',
          summary: 'Réservation réussie',
          detail: `Rouleau réservé avec ${poids} kg`
        });
      },
      error: (err) => {
        console.error(err);
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible de réserver le rouleau`
        });
      }
    });
  }

  consommer() {
    if (!this.commande?.id) return;
    this.svc.consommer(this.commande.id).subscribe({
      next: () => { this.reloadAllocations(); this.reload(); },
      error: () => {}
    });
  }

  annulerReservations() {
    if (!this.commande?.id) return;
    this.svc.annulerReservation(this.commande.id).subscribe({
      next: () => { this.reloadAllocations(); this.reload(); },
      error: () => {}
    });
  }

  /* ===================== Allocations (form + tableau) ===================== */

  // tableau sans colonne "État"
  get displayedAllocations(): Allocation[] {
    return (this.allocations || []).filter(a => a.etat !== 'CANCELED');
  }

  formatAllocDate(a: Allocation): string {
    const v = a.dateConsommation || a.dateAllocation;
    return v ? new Date(v).toLocaleString() : '—';
  }

  // ➕ Ajouter un rouleau comme "utilisé"
  addRouleauUtilise() {
    if (!this.commande?.id) return;

    const ridRaw = this.formAlloc.rouleauId?.toString().trim();
    const poids = Number(this.formAlloc.poids);
    if (!ridRaw || poids <= 0) return;

    // Si l'API existe: on l'utilise
    const svcAny = this.svc as any;
    if (svcAny.addAllocation && svcAny.consumeAllocation) {
      svcAny.addAllocation(this.commande.id, { rouleauId: ridRaw, poidsReserve: poids }).subscribe({
        next: (alloc: Allocation) => {
          svcAny.consumeAllocation(this.commande!.id!, alloc.id).subscribe({
            next: () => { this.formAlloc = { rouleauId: '', poids: 0 }; this.reloadAllocations(); },
            error: () => {}
          });
        },
        error: () => {}
      });
      return;
    }

    // Sinon: fallback FRONT-ONLY (localStorage)
    const alloc: Allocation = {
      id: -Date.now(), // id local négatif
      rouleauId: /^\d+$/.test(ridRaw) ? Number(ridRaw) : ridRaw,
      poidsReserve: poids,
      etat: 'CONSUMED',
      dateAllocation: new Date().toISOString(),
      dateConsommation: new Date().toISOString()
    };

    this.localAllocs.push(alloc);
    this.allocations = [...this.allocations, alloc];
    this.saveLocalAllocations(this.commande.id);
    this.formAlloc = { rouleauId: '', poids: 0 };
  }

  // 🗑️ Supprimer une ligne
  removeAllocation(a: Allocation) {
    if (!this.commande?.id) return;

    const svcAny = this.svc as any;

    // locale ?
    if (a.id < 0) {
      this.localAllocs = this.localAllocs.filter(x => x.id !== a.id);
      this.allocations = this.allocations.filter(x => x.id !== a.id);
      this.saveLocalAllocations(this.commande.id);
      return;
    }

    // serveur ?
    if (svcAny.deleteAllocation) {
      svcAny.deleteAllocation(this.commande.id, a.id).subscribe({
        next: () => this.reloadAllocations(),
        error: () => {}
      });
    }
  }

  /* ===================== Pièces jointes (UI only) ===================== */
  onUploadPieces(event: any) {
    const files: File[] = event.files || [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      this.pieces.push({ name: f.name, size: f.size, type: f.type, url });
    }
    if (event.options?.clear) event.options.clear();
  }

  downloadPiece(p: PieceJointe) {
    const a = document.createElement('a');
    a.href = p.url;
    a.download = p.name;
    a.click();
  }

  removePiece(i: number) {
    URL.revokeObjectURL(this.pieces[i].url);
    this.pieces.splice(i, 1);
  }

  /* ===================== Helpers ===================== */
  private reload() {
    if (!this.commande?.id) return;
    this.svc.getById(this.commande.id).subscribe({
      next: (cmd) => (this.commande = cmd)
    });
  }

  private reloadAllocations() {
    if (!this.commande?.id) return;
    this.svc.getAllocations(this.commande.id).subscribe({
      next: rows => (this.allocations = [...(rows as any), ...this.localAllocs]),
      error: () => { this.allocations = [...this.localAllocs]; }
    });
  }

  private localKey(id: number) { return `alloc_local_${id}`; }

  private loadLocalAllocations(id: number): Allocation[] {
    try {
      const raw = localStorage.getItem(this.localKey(id));
      return raw ? (JSON.parse(raw) as Allocation[]) : [];
    } catch { return []; }
  }

  private saveLocalAllocations(id: number) {
    try { localStorage.setItem(this.localKey(id), JSON.stringify(this.localAllocs)); } catch {}
  }

  calculPoidsTotal(commande: CommandeDTO): number {
    let total = 0;
  
    // Sécurité : convertir en nombre si défini
    const longueur = Number(commande.longueur) || 0;
    const largeur = Number(commande.largeur) || 0;
    const grammage = Number(commande.grammage) || 0; // ou commande.grammage si renommé
  
    if (longueur > 0 && largeur > 0 && grammage > 0) {
      total += longueur * largeur * grammage;
    }
  
    if (commande.poidsPoigner && commande.poidsPoigner > 0) {
      total += Number(commande.poidsPoigner);
    }
  
    return total;
  }
  calculPoidsTotalCommande(commande: CommandeDTO): number {
    let total = 0;
     let poidsKg = 0 ; 
    // Sécurité : convertir en nombre si défini
    const longueur = Number(commande.longueur) || 0;
    const largeur = Number(commande.largeur) || 0;
    const grammage = Number(commande.grammage) || 0; // ou commande.grammage si renommé
  
    if (longueur > 0 && largeur > 0 && grammage > 0) {
      total += longueur * largeur * grammage;
    }
  
    if (commande.poidsPoigner && commande.poidsPoigner > 0) {
      total += Number(commande.poidsPoigner);
    }
    poidsKg =(total * this.commande.quantite)/1000; 
    return poidsKg;
  }
  formatDimension(c?: CommandeDTO): string {
    const L = c?.longueur ?? '—';
    const l = c?.largeur  ?? '—';
    const e = c?.grammage?? '—';
    return `${L}×${l}×${e}`;
  }

  async copyNumero() {
    if (!this.commande?.numeroCommande) return;
    try { await navigator.clipboard.writeText(this.commande.numeroCommande); } catch {}
  }
}
