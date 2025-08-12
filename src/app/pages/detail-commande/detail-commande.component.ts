import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';

type Allocation = {
  id: number;
  rouleauId: number;
  poidsReserve: number;
  etat: 'RESERVED' | 'CONSUMED' | 'CANCELED';
  dateAllocation?: string;
  dateConsommation?: string;
  dateAnnulation?: string;
};

@Component({
  selector: 'app-detail-commande',
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.scss']
})
export class DetailCommandeComponent implements OnInit {
  loading = true;
  notFound = false;
  commande?: CommandeDTO;

  // QR (optionnel : si tu utilises un composant QR, la valeur à encoder)
  qrValue = '';

  // Allocations (si exposées par l’API)
  allocations: Allocation[] = [];

  // Paramètre métier (si tu déclenches le calcul poids depuis le front)
  grammage = 80; // g/m² (exemple)

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

        // Charger les allocations si endpoint dispo
        this.svc.getAllocations?.(id).subscribe({
          next: (rows) => (this.allocations = rows as any),
          error: () => {} // silencieux si pas d’allocations encore
        });

        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  backToList() { this.router.navigate(['/pages/commandes']); }

  /* --------- Actions métier optionnelles --------- */

  calculerPoids() {
    if (!this.commande?.id) return;
    this.svc.calculPoidsNecessaire?.(this.commande.id, this.grammage).subscribe({
      next: () => this.reload(),
      error: () => {}
    });
  }

  reserver() {
    if (!this.commande?.id) return;
    this.svc.reserver?.(this.commande.id).subscribe({
      next: () => { this.reloadAllocations(); },
      error: () => {}
    });
  }

  consommer() {
    if (!this.commande?.id) return;
    this.svc.consommer?.(this.commande.id).subscribe({
      next: () => { this.reloadAllocations(); this.reload(); },
      error: () => {}
    });
  }

  annulerReservations() {
    if (!this.commande?.id) return;
    this.svc.annulerReservation?.(this.commande.id).subscribe({
      next: () => { this.reloadAllocations(); this.reload(); },
      error: () => {}
    });
  }

  /* --------- Helpers --------- */

  private reload() {
    if (!this.commande?.id) return;
    this.svc.getById(this.commande.id).subscribe({
      next: (cmd) => (this.commande = cmd)
    });
  }

  private reloadAllocations() {
    if (!this.commande?.id || !this.svc.getAllocations) return;
    this.svc.getAllocations(this.commande.id).subscribe({
      next: (rows) => (this.allocations = rows as any)
    });
  }

  // petite utilité pour formater des nombres
  n(v?: number, d = 2) {
    return v == null ? '—' : v.toFixed(d);
  }
}
