import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ImportService } from 'src/app/services/import.service';
import { ImportModel, RouleauImport } from 'src/app/models/import';

@Component({
  selector: 'app-import-details',
  templateUrl: './import-details.component.html',
  styleUrls: ['./import-details.component.scss'],
  providers: [MessageService]
})
export class ImportDetailsComponent implements OnInit {

  importId!: number;

  importData: ImportModel = {
    numeroImport: '',
    fournisseur: '',
    nomProduit: '',
    dateImport: new Date(),
    totalMetrage: 0,
    totalRouleaux: 0,
    prix: 0,
    observations: '',
    fichierImport: ''
  };

  rouleaux: RouleauImport[] = [];

  // UI existante
  rouleauDialog = false;
  deleteRouleauDialog = false;
  rouleauData: Partial<RouleauImport> = {};
  rouleauToDelete: RouleauImport | null = null;

  colonnesOptions = [
    { label: 'Statut', value: 'status' },
    { label: 'Disponibilité', value: 'dispo' }
  ];
  colonnesAffichees = [...this.colonnesOptions];

  newRouleau: Partial<RouleauImport> = {};
  rouleauEnCours: RouleauImport | null = null;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private importService: ImportService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.importId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.importId) {
      this.message.add({ severity: 'error', summary: 'Erreur', detail: 'ID import invalide' });
      return;
    }
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;

    // 1) Charger l'entête
    this.importService.getImportById(this.importId).subscribe({
      next: (imp) => {
        // si back renvoie yyyy-MM-dd, adapter en Date pour p-calendar
        // APRES
      if (imp.dateImport) {
        const raw = String(imp.dateImport);           // ex: "2025-08-11" ou ISO
        this.importData = {
          ...imp,
          dateImport: raw.slice(0, 10)                // "YYYY-MM-DD"
        };
      } else {
        this.importData = imp;
      }

      },
      error: () => this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement entête' })
    });

    // 2) Charger les rouleaux
    this.importService.listRouleaux(this.importId).subscribe({
      next: (rows) => {
        this.rouleaux = rows || [];
        this.recalculateTotals();
        this.loading = false;
      },
      error: () => {
        this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement rouleaux' });
        this.loading = false;
      }
    });
  }

  // ====== ENTÊTE ======
saveImportHeader(): void {
  // Normaliser la date en string 'YYYY-MM-DD'
  const d = this.importData.dateImport;
  const yyyyMmDd =
    d instanceof Date
      ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      : String(d).slice(0, 10);

  const payload: ImportModel = {
    ...this.importData,
    id: this.importId,
    dateImport: yyyyMmDd // toujours 'YYYY-MM-DD'
  };

  // Ton backend fait create/update via saveImport
  this.importService.createImport(payload).subscribe({
    next: (saved) => {
      // Re-normaliser pour l'affichage dans <input type="date">
      this.importData = {
        ...saved,
        dateImport: String(saved.dateImport).slice(0, 10)
      };
      this.message.add({
        severity: 'success',
        summary: 'Enregistré',
        detail: 'Import mis à jour'
      });
    },
    error: () => {
      this.message.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec enregistrement'
      });
    }
  });
}


  onFileUpload(event: any) {
    const file: File = event.files?.[0];
    if (!file) return;
    // à brancher quand tu ajoutes l’endpoint upload côté back
    this.message.add({ severity: 'info', summary: 'Upload', detail: 'Endpoint upload à brancher côté back' });
  }

  // ====== ROULEAUX ======
  isColVisible(colKey: string): boolean {
    return this.colonnesAffichees.some(c => c.value === colKey);
  }

  recalculateTotals(): void {
    const totalMetrage = this.rouleaux.reduce((s, r) => s + (Number(r.metrage) || 0), 0);
    this.importData.totalMetrage = Math.round(totalMetrage * 100) / 100;
    this.importData.totalRouleaux = this.rouleaux.length;
  }

  // Ajout rapide (section "Ajouter Rouleau")
  addRouleau(): void {
    if (!this.newRouleau.numero) return;

    if (this.rouleauEnCours?.id) {
      // UPDATE (endpoint non imbriqué selon ton back)
      const body: RouleauImport = {
        ...this.rouleauEnCours,
        ...this.newRouleau as RouleauImport
      };
      this.importService.updateRouleau(body.id!, body).subscribe({
        next: (saved) => {
          const i = this.rouleaux.findIndex(x => x.id === body.id);
          if (i !== -1) this.rouleaux[i] = saved;
          this.resetNewRouleau();
          this.message.add({ severity: 'success', summary: 'OK', detail: 'Rouleau modifié' });
          this.recalculateTotals();
        },
        error: () => this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Échec modification' })
      });
    } else {
      // CREATE
      const body: RouleauImport = {
        numero: String(this.newRouleau.numero),
        metrage: Number(this.newRouleau.metrage) || 0,
        laize: Number(this.newRouleau.laize) || 0,
        poids: Number(this.newRouleau.poids) || 0,
        valide: false,
        disponible: true
      };
      this.importService.addRouleauToImport(this.importId, body).subscribe({
        next: (saved) => {
          this.rouleaux.unshift(saved);
          this.resetNewRouleau();
          this.message.add({ severity: 'success', summary: 'OK', detail: 'Rouleau ajouté' });
          this.recalculateTotals();
        },
        error: () => this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Échec ajout' })
      });
    }
  }

  openEditDialog(r?: RouleauImport) {
    this.rouleauData = r ? { ...r } : {};
    this.rouleauDialog = true;
  }

  saveRouleau(): void {
    const body: RouleauImport = {
      id: this.rouleauData.id,
      numero: String(this.rouleauData.numero || ''),
      metrage: Number(this.rouleauData.metrage) || 0,
      laize: Number(this.rouleauData.laize) || 0,
      poids: Number(this.rouleauData.poids) || 0,
      valide: this.rouleauData.valide ?? false,
      disponible: this.rouleauData.disponible ?? true
    };

    const obs = body.id
      ? this.importService.updateRouleau(body.id, body)
      : this.importService.addRouleauToImport(this.importId, body);

    obs.subscribe({
      next: (saved) => {
        if (body.id) {
          const i = this.rouleaux.findIndex(x => x.id === body.id);
          if (i !== -1) this.rouleaux[i] = saved;
        } else {
          this.rouleaux.push(saved);
        }
        this.rouleauDialog = false;
        this.rouleauData = {};
        this.recalculateTotals();
        this.message.add({ severity: 'success', summary: 'OK', detail: 'Rouleau enregistré' });
      },
      error: () => this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Échec enregistrement' })
    });
  }

  confirmDelete(r: RouleauImport) {
    this.rouleauToDelete = r;
    this.deleteRouleauDialog = true;
  }

  deleteConfirmed(): void {
    if (!this.rouleauToDelete?.id) return;
    this.importService.deleteRouleau(this.rouleauToDelete.id).subscribe({
      next: () => {
        this.rouleaux = this.rouleaux.filter(x => x.id !== this.rouleauToDelete!.id);
        this.deleteRouleauDialog = false;
        this.rouleauToDelete = null;
        this.recalculateTotals();
        this.message.add({ severity: 'success', summary: 'Supprimé', detail: 'Rouleau supprimé' });
      },
      error: () => this.message.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée' })
    });
  }

  private resetNewRouleau() {
    this.newRouleau = {};
    this.rouleauEnCours = null;
  }
}
