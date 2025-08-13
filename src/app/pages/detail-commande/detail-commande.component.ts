import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';

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
  styleUrls: ['./detail-commande.component.scss']
})
export class DetailCommandeComponent implements OnInit {
  loading = true;
  notFound = false;
  commande?: CommandeDTO;

  qrValue = '';
  allocations: Allocation[] = [];
  grammage = 80; // g/m²

  // UI only
  pieces: PieceJointe[] = [];

  // --- petit formulaire "ajouter rouleau utilisé"
  formAlloc = { rouleauId: '', poids: 0 };

  // allocations locales (quand il n'y a pas d'API)
  private localAllocs: Allocation[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CommandeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.notFound = true; this.loading = false; return; }

    this.svc.getById(id).subscribe({
      next: (cmd) => {
        this.commande = cmd;
        this.qrValue = `${location.origin}/pages/detail-commande/${id}`;

        // charge les allocations serveur + locales
        this.localAllocs = this.loadLocalAllocations(id);
        this.reloadAllocations();

        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
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

  reserver() {
    if (!this.commande?.id) return;
    this.svc.reserver(this.commande.id).subscribe({
      next: () => this.reloadAllocations(),
      error: () => {}
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

  formatDimension(c?: CommandeDTO): string {
    const L = c?.longueur ?? '—';
    const l = c?.largeur  ?? '—';
    const e = c?.epaisseur?? '—';
    return `${L}×${l}×${e} mm`;
  }

  async copyNumero() {
    if (!this.commande?.numeroCommande) return;
    try { await navigator.clipboard.writeText(this.commande.numeroCommande); } catch {}
  }
}
