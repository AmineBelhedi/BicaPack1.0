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

  // Flags UI
  hasPoigner = false;
  hasSoufflet = false;
  viewMode: 'details' | 'production' = 'details';
  switch(mode: 'details' | 'production') { this.viewMode = mode; }

  // Vars temporaires (édition sans sauvegarder)
  poidsPoignerTmp: number | null = 0;
  souffletTmp: number | null = 0;
  pliLTmp: number = 1;
  pliWTmp: number = 0;
  pliError: string | null = null;

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

  /** Normalise tout ce que le back peut renvoyer en 'FOND_V' | 'FOND_CARRE' */
  private normalizeTypeSac(t: any): 'FOND_V' | 'FOND_CARRE' {
    const v = (t ?? '').toString().trim().toUpperCase();
    if (v === 'FOND_CARRE' || v.includes('CARR')) return 'FOND_CARRE';
    if (v === 'FOND V' || v === 'V') return 'FOND_V';
    return v === 'FOND_V' ? 'FOND_V' : 'FOND_V'; // défaut
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.notFound = true; this.loading = false; return; }

    const initialView = this.route.snapshot.queryParamMap.get('view');
    if (initialView === 'production') this.viewMode = 'production';
      
    this.svc.getById(id).subscribe({
      next: (cmd) => {
        this.commande = cmd;

        // ⬇️ normaliser le type venant du back
        (this.commande as any).typeSac = this.normalizeTypeSac((cmd as any).typeSac);

        this.qrValue = `${location.origin}/pages/detail-commande/${id}`;

        // init switches
        this.hasPoigner = !!(cmd.poidsPoigner && cmd.poidsPoigner > 0);
        this.hasSoufflet = !!(cmd.soufflet && cmd.soufflet > 0);

        // init plis (on lit directement les champs du back)
        this.pliLTmp = (cmd as any).plilongueur ?? 1;
        this.pliWTmp = (cmd as any).plilargeur  ?? 0;

        // copies temporaires
        this.poidsPoignerTmp = Number(cmd.poidsPoigner) || 0;
        this.souffletTmp     = Number(cmd.soufflet)     || 0;

        // Rouleaux compatibles
        this.getRouleaux();

        // Allocations (serveur + locales)
        this.localAllocs = this.loadLocalAllocations(id);
        this.reloadAllocations();

        this.loading = false;
        if (this.viewMode === 'production') {
          setTimeout(() => {
            document.getElementById('productionTop')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
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
        this.reload();
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
  togglePoigner(): void {}
  toggleSoufflet(): void {}

  onPoignerChange(checked: boolean): void { this.hasPoigner = checked; }

  validateLargeurPli(val: number | null | undefined): void {
    const v = val ?? 0;
    this.pliError = null;
    if (v < 0) { this.pliLTmp = 0; this.pliError = 'Le pli ne peut pas être négatif.'; return; }
    const max = 5;
    if (v > max) { this.pliLTmp = max; this.pliError = `Le pli ne doit pas dépasser ${max.toFixed(2)} cm.`; }
  }

  onSouffletChange(checked: boolean): void { this.hasSoufflet = checked; }

  // =================== Sauvegardes ===================
  private toNum(v: any, fallback = 0): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  private viewToApiPayload(view: CommandeDTO): CommandeDTO {
    // priorité à ce qu’on a en vue/état local
    const typeSac = this.normalizeTypeSac(((view as any)?.typeSac) || ((this.commande as any)?.typeSac));

    return {
      id: view.id,
      numeroCommande: (view.numeroCommande || '').trim(),
      quantite: this.toNum(view.quantite, 0),
      largeur: this.toNum(view.largeur, 0),
      longueur: this.toNum(view.longueur, 0),
      grammage: this.toNum(view.grammage, 0),
      soufflet: this.toNum(view.soufflet, 0),

      // champs attendus par le back
      typeSac,
      plilongueur: this.toNum(this.pliLTmp, 0),
      plilargeur : this.toNum(this.pliWTmp, 0),

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

    const commandeAEnvoyer: CommandeDTO = {
      ...this.commande,
      poidsPoigner: this.hasPoigner ? this.toNum(this.poidsPoignerTmp, 0) : 0,
      soufflet:     this.hasSoufflet ? this.toNum(this.souffletTmp, 0)     : 0,
    };

    const payload = this.viewToApiPayload(commandeAEnvoyer);

    this.svc.update(payload).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée' });
        this.commande = {
          ...this.commande!,
          poidsPoigner: payload.poidsPoigner,
          soufflet: payload.soufflet,
          typeSac: payload.typeSac
        } as CommandeDTO;

        (this.commande as any).plilongueur = payload.plilongueur;
        (this.commande as any).plilargeur  = payload.plilargeur;

        this.pliLTmp = payload.plilongueur ?? 0;
        this.pliWTmp = payload.plilargeur  ?? 0;

        this.getRouleaux();
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée' })
    });
  }

  // =================== Calculs poids / surface ===================
  calculPoidsTotal(c?: CommandeDTO): number {
    if (!c) return 0;
    const surfaceCm2 = this.surfaceUnitaire(c);
    const grammage   = Number(c.grammage ?? 0);
    const poidsPoigner = Math.max(Number(this.poidsPoignerTmp ?? c?.poidsPoigner ?? 0) || 0, 0);
    if (!(surfaceCm2 > 0) || !(grammage > 0)) return poidsPoigner;
    const unitG = (surfaceCm2 * grammage) / 10_000;
    return unitG + poidsPoigner;
  }

  calculPoidsTotalCommande(c?: CommandeDTO): number {
    if (!c) return 0;
    const unitG = this.calculPoidsTotal(c);
    const qty   = Number(c.quantite ?? 0);
    if (!(unitG >= 0) || !(qty > 0)) return 0;
    return (unitG * qty) / 1000;
  }

  // Surface par unité (en cm²)
  surfaceUnitaire(c: any): number {
    const L = Number(c?.longueur ?? 0);
    const W = Number(c?.largeur ?? 0);
    const v = Math.max(Number(this.souffletTmp ?? c?.soufflet ?? 0), 0);

    const typeSac = ((this.commande as any)?.typeSac) || 'FOND_V';
    const isCarre = typeSac === 'FOND_CARRE';

    const pliL = Number(this.pliLTmp ?? 0);
    const pliW = Number(this.pliWTmp ?? 0);

    // ⬇️ L_eff selon le type
    const L_eff = isCarre ? (L + v / 2 + pliL) : (L + pliL);
    // ⬇️ largeur effective (nouvelle formule, identique pour les deux types)
    const W_eff = (W + v) * 2 + pliW;

    return L_eff * W_eff;
  }
  // Laize effective (W_eff) en cm
  laizeEffective(c: any): number {
    const W = Number(c?.largeur ?? 0);
    const v = Math.max(Number(this.souffletTmp ?? c?.soufflet ?? 0), 0);
    const pliW = Number(this.pliWTmp ?? 0);
    // même formule que dans surfaceUnitaire()
    const W_eff = (W + v) * 2 + pliW;
    return W_eff; // cm
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

        // ⬇️ normaliser le type à chaque reload
        (this.commande as any).typeSac = this.normalizeTypeSac((cmd as any).typeSac);

        // lire les bons noms de champs depuis le back
        this.pliLTmp = (cmd as any).plilongueur ?? 1;
        this.pliWTmp = (cmd as any).plilargeur  ?? 0;

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

  formatNoGroup(value: number | null | undefined, unit: string): string {
    const v = value ?? 0;
    return v.toLocaleString('en-US', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 3 }) + ' ' + unit;
  }

  private trunc(v: number, d: number) {
    const f = Math.pow(10, d);
    return Math.trunc(v * f) / f;
  }

  formatWeightSmart(kg: number | null | undefined, decG = 3, decKg = 3): string {
    const v = kg ?? 0;
    if (v < 1) return (v * 1000).toFixed(decG) + ' g';
    return v.toFixed(decKg) + ' Kg';
  }

  formatQtyNoGroup(value: number | null | undefined): string {
    const v = value ?? 0;
    return v.toLocaleString('en-US', { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  isFondCarre(): boolean {
    return (((this.commande as any)?.typeSac) || 'FOND_V') === 'FOND_CARRE';
  }
}
