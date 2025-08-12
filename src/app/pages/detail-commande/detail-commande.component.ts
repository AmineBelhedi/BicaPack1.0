import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeModel, StatutCommande } from 'src/app/models/commande.model';
import { CommandeService } from 'src/app/services/commande.service';

type PieceJointe = { name: string; size: number; type: string; url: string };

@Component({
  selector: 'app-detail-commande',
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.scss']
})
export class DetailCommandeComponent implements OnInit {
  loading = true;
  notFound = false;
  commande?: CommandeModel;

  // QR
  qrValue = '';

  // Pièces jointes (local front)
  pieces: PieceJointe[] = [];

  // Rouleaux utilisés
  rouleaux: string[] = [];

  // options de statut (sans "Brouillon")
  statutOptions = [
    { label: 'Confirmée',     value: 'Confirmée'     as StatutCommande },
    { label: 'En production', value: 'En production' as StatutCommande },
    { label: 'Livrée',        value: 'Livrée'        as StatutCommande },
    { label: 'Annulée',       value: 'Annulée'       as StatutCommande }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CommandeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.notFound = true; this.loading = false; return; }

    this.svc.getAll().subscribe({
      next: list => {
        const found = list.find(c => c.id === id);
        if (found) {
          this.commande = { ...found, dateCommande: new Date(found.dateCommande) };

          // URL encodée dans le QR (scannable)
          this.qrValue = `${location.origin}/pages/detail-commande/${id}`;

          // Charger des données annexes si le modèle les contient déjà
          this.rouleaux = (found as any).rouleaux ?? [];
          this.pieces = (found as any).piecesJointes ?? [];
        } else {
          this.notFound = true;
        }
        this.loading = false;
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  backToList() { this.router.navigate(['/pages/commandes']); }

  // Statut
  changeStatut(newStatut: StatutCommande) {
    if (!this.commande) return;
    const updated: CommandeModel = { ...this.commande, statut: newStatut, rouleaux: this.rouleaux as any };
    this.svc.update(updated).subscribe(res => this.commande = res);
  }

  // Copie du N° commande
  async copyNumero() {
    if (!this.commande?.numeroCommande) return;
    try { await navigator.clipboard.writeText(this.commande.numeroCommande); } catch {}
  }

  // Pièces jointes (upload custom)
  onUploadPieces(event: any) {
    const files: File[] = event.files || [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      this.pieces.push({ name: f.name, size: f.size, type: f.type, url });
    }
    // Nettoie la file d'attente visuelle
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

  // Rouleaux: persiste côté commande
  saveRouleaux() {
    if (!this.commande) return;
    const updated: any = { ...this.commande, rouleaux: this.rouleaux, piecesJointes: this.pieces };
    this.svc.update(updated).subscribe(res => this.commande = res);
  }
  saveAll() {
  if (!this.commande) return;
  const updated: any = {
    ...this.commande,
    // assure un Date correct
    dateCommande: new Date(this.commande.dateCommande),
    rouleaux: this.rouleaux,
    piecesJointes: this.pieces
  };
  this.svc.update(updated).subscribe(res => this.commande = res);
}

  getSeverity(statut?: StatutCommande) {
    switch (statut) {
      case 'Livrée':        return 'success';
      case 'Confirmée':     return 'info';
      case 'En production': return 'warning';
      case 'Annulée':       return 'danger';
      default:              return 'secondary';
    }
  }
}
