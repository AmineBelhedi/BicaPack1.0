import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { RouleauImport } from 'src/app/models/import';
import { CommandeService } from 'src/app/services/commande.service';
import { ImportService } from 'src/app/services/import.service';

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
  styleUrls: ['./detail-commande.component.scss'],
  providers: [MessageService]
})
export class DetailCommandeComponent implements OnInit {
  loading = true;
  notFound = false;
  commande?: CommandeDTO;
  qrValue = '';

  // Image & upload
  uploading = false;
  cacheBust: number | null = null;

  // Flags UI (ne touchent pas l'objet commande directement)
  hasPoigner = false;
  hasSoufflet = false;

  // 👉 NEW: variables temporaires pour l’édition “sans sauvegarder”
  // ces valeurs ne seront appliquées à `commande` que dans saveCommande()
  poidsPoignerTmp: number | null = 0;
  souffletTmp: number | null = 0;
  largeurPliTmp: number = 2;//valeur par défaut
  pliError: string | null = null;//message d'erreur pour le pli
  // Stats/Calculs
  grammage = 80; // g/m²
  pieces: PieceJointe[] = [];

  // Rouleaux / réservations
  rouleaux: RouleauImport[] = [];
  allocations: Allocation[] = [];
  formAlloc: { rouleauId: number | null; poids: number | null } = { rouleauId: null, poids: null };

  private localAllocs: Allocation[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CommandeService,
    private importService: ImportService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.notFound = true; this.loading = false; return; }

    this.svc.getById(id).subscribe({
      next: (cmd) => {
        this.commande = cmd;
        this.qrValue = `${location.origin}/pages/detail-commande/${id}`;

        // 👉 on initialise les switches à partir des valeurs serveur
        this.hasPoigner = !!(cmd.poidsPoigner && cmd.poidsPoigner > 0);
        this.hasSoufflet = !!(cmd.soufflet && cmd.soufflet > 0);

        // 👉 et on prend des copies temporaires (pour ne pas modifier `commande` tant que non sauvegardé)
        this.poidsPoignerTmp = Number(cmd.poidsPoigner) || 0;
        this.souffletTmp     = Number(cmd.soufflet)     || 0;

        // Rouleaux compatibles
        this.getRouleaux();

        // Allocations (serveur + locales)
        this.localAllocs = this.loadLocalAllocations(id);
        this.reloadAllocations();

        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  // =================== Image (upload + cache-bust) ===================
  onPickImage(evt: Event, commandeId: number): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      this.toast.add({ severity: 'warn', summary: 'Fichier trop volumineux', detail: `Max ${maxMb} Mo` });
      input.value = '';
      return;
    }

    this.uploading = true;
    this.svc.uploadImage(commandeId, file).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Image', detail: 'Image téléversée' });
        this.cacheBust = Date.now();
        this.uploading = false;
        this.reload(); // récupérer l’URL si mise à jour
        input.value = '';
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Échec', detail: 'Upload échoué' });
        this.uploading = false;
        input.value = '';
      }
    });
  }

  // =================== Options (Poignée / Soufflet) ===================
  // 👉 CHANGEMENT: ne plus toucher `commande` ici (pas de save, pas de mutation du modèle)
  togglePoigner(): void {
 // reset visuel si on décoche (optionnel)
  }
  toggleSoufflet(): void {
 // reset visuel si on décoche (optionnel)
  }
  // Appelé à chaque changement du checkbox Poignée.
// On reçoit la nouvelle valeur (true/false) de façon fiable.
onPoignerChange(checked: boolean): void {
  this.hasPoigner = checked;
  
}
validateLargeurPli(val: number | null | undefined, largeurCm?: number | null): void {
  const v = val ?? 0;
  const largeur = Number(largeurCm ?? 0);
  this.pliError = null;

  if (v < 0) {
    this.largeurPliTmp = 0;
    this.pliError = 'Le pli ne peut pas être négatif.';
    return;
  }
  if (largeur > 0 && v > largeur / 2) {
    const max = +(largeur / 2).toFixed(2);
    this.largeurPliTmp = max;
    this.pliError = `Le pli ne doit pas dépasser ${max.toFixed(2)} cm (½ de la largeur).`;
  }
}



// Idem pour Soufflet
onSouffletChange(checked: boolean): void {
  this.hasSoufflet = checked;
  
}

  // =================== Sauvegardes ===================
  private toNum(v: any, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private viewToApiPayload(view: CommandeDTO): CommandeDTO {
    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      quantite: this.toNum(view.quantite, 0),
      largeur: this.toNum(view.largeur, 0),
      longueur: this.toNum(view.longueur, 0),
      grammage: this.toNum(view.grammage, 0),
      soufflet: this.toNum(view.soufflet, 0),
      poidsPoigner: this.toNum(view.poidsPoigner, 0),
      description: (view.description ?? '').trim(),
      poidsNecessaire: view.poidsNecessaire,
      poidsReserve: view.poidsReserve,
      poidsConsomme: view.poidsConsomme,
      imageSac: view.imageSac
    };
  }

  saveDimensions(): void {
    if (!this.commande?.id) return;
    const payload = this.viewToApiPayload(this.commande);
    this.svc.update(payload).subscribe({
      next: () => this.toast.add({ severity: 'success', summary: 'Enregistré', detail: 'Dimensions mises à jour' }),
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour' })
    });
  }

  // 👉 CHANGEMENT PRINCIPAL: “Enregistrer” applique les flags + temporaires au modèle avant d’appeler l’API
  saveCommande(): void {
    if (!this.commande?.id) return;

    if (!this.commande.numeroCommande?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande obligatoire' });
      return;
    }
    if ((this.commande.quantite ?? 0) <= 0 ||
        (this.commande.largeur  ?? 0) <= 0 ||
        (this.commande.longueur ?? 0) <= 0 ||
        (this.commande.grammage ?? 0) <= 0) {
      this.toast.add({ severity: 'warn', summary: 'Vérifier', detail: 'Quantité et dimensions' });
      return;
    }

    // 👉 appliquer les saisies UI au modèle
    const commandeAEnvoyer: CommandeDTO = {
      ...this.commande,
      poidsPoigner: this.hasPoigner ? this.toNum(this.poidsPoignerTmp, 0) : 0,
      soufflet:     this.hasSoufflet ? this.toNum(this.souffletTmp, 0)     : 0,
    };

    const payload = this.viewToApiPayload(commandeAEnvoyer);

    this.svc.update(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée' });
        // 👉 si succès, on synchronise l’état local pour que l’UI affiche la valeur réellement sauvegardée
        this.commande.poidsPoigner = commandeAEnvoyer.poidsPoigner;
        this.commande.soufflet     = commandeAEnvoyer.soufflet;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée' })
    });
  }

  // =================== Calculs poids ===================
  // 👉 CHANGEMENT: l’aperçu de poids utilise les valeurs temporaires + switches
  calculPoidsTotal(c?: CommandeDTO): number {
    if (!c) return 0;
    const surfaceCm2 = this.surfaceUnitaire(c); // cm²
    const grammage   = Number(c.grammage ?? 0);             // g/m²
    const poidsPoigner = Math.max(Number(this.poidsPoignerTmp ?? c?.poidsPoigner ?? 0) || 0, 0);

    if (!(surfaceCm2 > 0) || !(grammage > 0)) return poidsPoigner;

    const unitG = (surfaceCm2 * grammage) / 10_000;         // g
    return unitG + poidsPoigner;  
    }

  calculPoidsTotalCommande(c?: CommandeDTO): number {
    if (!c) return 0;
    const unitG = this.calculPoidsTotal(c);   // g
    const qty   = Number(c.quantite ?? 0);
    if (!(unitG >= 0) || !(qty > 0)) return 0;
    return (unitG * qty) / 1000;              // Kg
  }

  formatDimension(c?: CommandeDTO): string {
    const L = c?.longueur ?? '—';
    const l = c?.largeur  ?? '—';
    const g = c?.grammage ?? '—';
    return `${L}×${l}×${g}`;
  }
  //======calcul de surface ==========
  // Surface par unité (en cm²)
surfaceUnitaire(c: any): number {
  const L  = Number(c?.longueur ?? 0);
  const W  = Number(c?.largeur ?? 0);
  const v  = Math.max(Number(this.souffletTmp ?? c?.soufflet ?? 0), 0);   // soufflet actuel
  const pli = Number(this.largeurPliTmp ?? 0);                        // pli (toujours visible)

  // Formule : (L + v/2 + pli) * ( (W + v) * 2 )
  return (L + v / 2 + pli) * ((W + v) * 2);
}

// Surface totale de la commande (en cm²)
surfaceCommande(c: any): number {
  const qte = Number(c?.quantite ?? 0);
  return this.surfaceUnitaire(c) * qte;
}


  // =================== Rouleaux : recherche + réservation ===================
  private getRouleaux(): void {
    if (!this.commande) return;
    const laize = this.commande.largeur;
    const besoinKg = this.calculPoidsTotalCommande(this.commande);

    this.importService.searchRouleauxByLaizeAndPoidsMin(laize, besoinKg).subscribe({
      next: (rows) => {
        this.rouleaux = (rows || []).map(r => ({
          ...r,
          reference: `${r.numero} | ${r.laize} | Poids Dispo : ${r.poidsRestant}Kg`
        }));
      },
      error: (err) => console.error('Erreur de recherche rouleaux', err)
    });
  }

  reserver(rouleauId: number | null, poids: number | null): void {
    if (!this.commande?.id) return;
    if (!rouleauId || !poids || poids <= 0) {
      this.toast.add({ severity: 'warn', summary: 'Info', detail: 'Sélectionne un rouleau et un poids > 0' });
      return;
    }

    this.svc.reserver(this.commande.id, rouleauId, poids).subscribe({
      next: () => {
        this.reloadAllocations();
        this.toast.add({ severity: 'success', summary: 'Réservé', detail: `Rouleau réservé (${poids} kg)` });
        this.formAlloc = { rouleauId: null, poids: null };
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de réserver' })
    });
  }

  // =================== Allocations (tableau & actions) ===================
  get displayedAllocations(): Allocation[] {
    return (this.allocations || []).filter(a => a.etat !== 'CANCELED');
  }

  formatAllocDate(a: Allocation): string {
    const v = a.dateConsommation || a.dateAllocation;
    return v ? new Date(v).toLocaleString() : '—';
  }

  addRouleauUtilise(): void {
    if (!this.commande?.id) return;

    const ridRaw = (this.formAlloc.rouleauId ?? '').toString().trim();
    const poids = Number(this.formAlloc.poids);
    if (!ridRaw || poids <= 0) return;

    const svcAny = this.svc as any;
    if (svcAny.addAllocation && svcAny.consumeAllocation) {
      svcAny.addAllocation(this.commande.id, { rouleauId: ridRaw, poidsReserve: poids }).subscribe({
        next: (alloc: Allocation) => {
          svcAny.consumeAllocation(this.commande!.id!, alloc.id).subscribe({
            next: () => { this.formAlloc = { rouleauId: null, poids: null }; this.reloadAllocations(); }
          });
        }
      });
      return;
    }

    // Fallback local
    const alloc: Allocation = {
      id: -Date.now(),
      rouleauId: /^\d+$/.test(ridRaw) ? Number(ridRaw) : ridRaw,
      poidsReserve: poids,
      etat: 'CONSUMED',
      dateAllocation: new Date().toISOString(),
      dateConsommation: new Date().toISOString()
    };
    this.localAllocs.push(alloc);
    this.allocations = [...this.allocations, alloc];
    this.saveLocalAllocations(this.commande.id);
    this.formAlloc = { rouleauId: null, poids: null };
  }

  removeAllocation(a: Allocation): void {
    if (!this.commande?.id) return;

    const svcAny = this.svc as any;

    if (a.id < 0) {
      this.localAllocs = this.localAllocs.filter(x => x.id !== a.id);
      this.allocations = this.allocations.filter(x => x.id !== a.id);
      this.saveLocalAllocations(this.commande.id);
      return;
    }

    if (svcAny.deleteAllocation) {
      svcAny.deleteAllocation(this.commande.id, a.id).subscribe({
        next: () => {
          this.reloadAllocations();
          this.toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Allocation supprimée' });
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée' })
      });
    }
  }

  // =================== Pièces jointes (UI only) ===================
  onUploadPieces(event: any): void {
    const files: File[] = event.files || [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      this.pieces.push({ name: f.name, size: f.size, type: f.type, url });
    }
    if (event.options?.clear) event.options.clear();
  }

  downloadPiece(p: PieceJointe): void {
    const a = document.createElement('a');
    a.href = p.url;
    a.download = p.name;
    a.click();
  }

  removePiece(i: number): void {
    URL.revokeObjectURL(this.pieces[i].url);
    this.pieces.splice(i, 1);
  }

  // =================== Helpers ===================
  backToList(): void { this.router.navigate(['/pages/commandes']); }

  async copyNumero(): Promise<void> {
    if (!this.commande?.numeroCommande) return;
    try { await navigator.clipboard.writeText(this.commande.numeroCommande); } catch {}
  }

  private reload(): void {
    if (!this.commande?.id) return;
    this.svc.getById(this.commande.id).subscribe({
      next: (cmd) => {
        this.commande = cmd;

        // 👉 on ré-aligne les temporaires avec ce qui vient du serveur
        this.poidsPoignerTmp = Number(cmd.poidsPoigner) || 0;
        this.souffletTmp     = Number(cmd.soufflet)     || 0;
        this.hasPoigner = !!(cmd.poidsPoigner && cmd.poidsPoigner > 0);
        this.hasSoufflet = !!(cmd.soufflet && cmd.soufflet > 0);
      }
    });
  }

  private reloadAllocations(): void {
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

  private saveLocalAllocations(id: number): void {
    try { localStorage.setItem(this.localKey(id), JSON.stringify(this.localAllocs)); } catch {}
  }





  saveAll(): void {
  if (!this.commande?.id) return;

  // validations simples
  if (!this.commande.numeroCommande?.trim()) {
    this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande obligatoire' });
    return;
  }
  if ((this.commande.quantite ?? 0) <= 0 ||
      (this.commande.largeur  ?? 0) <= 0 ||
      (this.commande.longueur ?? 0) <= 0 ||
      (this.commande.grammage ?? 0) <= 0) {
    this.toast.add({ severity: 'warn', summary: 'Vérifier', detail: 'Quantité et dimensions' });
    return;
  }

  // 👉 appliquer les valeurs UI (switches + temporaires) au modèle avant envoi
  const commandeAEnvoyer: CommandeDTO = {
    ...this.commande,
    poidsPoigner: this.hasPoigner ? this.toNum(this.poidsPoignerTmp, 0) : 0,
    soufflet:     this.hasSoufflet ? this.toNum(this.souffletTmp, 0)     : 0,
  };

  const payload = this.viewToApiPayload(commandeAEnvoyer);

  this.svc.update(payload).subscribe({
    next: () => {
      this.toast.add({ severity: 'success', summary: 'Enregistré', detail: 'Commande mise à jour' });
      // synchroniser l’UI : refléter ce qui a été sauvegardé
      this.commande = { ...commandeAEnvoyer };
      // (optionnel) relancer une recherche de rouleaux si les dimensions ont changé
      this.getRouleaux();
    },
    error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée' })
  });
}
  // Affiche sans séparateur de milliers, avec 2 décimales et unité
  formatNoGroup(value: number | null | undefined, unit: string): string {
    const v = value ?? 0;
    return v.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 10
    }) + ' ' + unit;
  }
    // tronque sans arrondir
  private trunc(v: number, d: number) {
    const f = Math.pow(10, d);
    return Math.trunc(v * f) / f;
  }

  // g si < 1 Kg, sinon Kg. Précis, sans séparateur de milliers.
  formatWeightSmart(kg: number | null | undefined, decG = 6, decKg = 6): string {
    const v = kg ?? 0;
    if (v < 1) {
      const g = this.trunc(v * 1000, decG);
      return g.toFixed(decG) + ' g';
    }
    const k = this.trunc(v, decKg);
    return k.toFixed(decKg) + ' Kg';
  }
  formatQtyNoGroup(value: number | null | undefined): string {
    const v = value ?? 0;
    return v.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }


}
