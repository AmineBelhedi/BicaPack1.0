import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommandeDTO } from 'src/app/models/CommandeDTO';
import { CommandeService } from 'src/app/services/commande.service';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
  providers: [MessageService]
})
export class CommandeComponent implements OnInit {
  rows: CommandeDTO[] = [];
  selected: CommandeDTO[] = [];
  rowsPerPageOptions = [10, 20, 30];

  // Dialogs
  dialogVisible = false;
  deleteDialog = false;
  deleteManyDialog = false;

  // Form (adapté à CommandeDTO)
  form: CommandeDTO = {
    numeroCommande: '',
    quantite: 0,
    largeur: 0,
    longueur: 0,
    epaisseur: 0,
    modeleName: ''
  };

  // Pour confirmation Delete 1
  current!: CommandeDTO;

  constructor(
    private svc: CommandeService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.svc.getAll().subscribe({
      next: data => (this.rows = data),
      error: err => console.error('Erreur chargement commandes:', err)
    });
  }

  /* ——— Toolbar ——— */
  openNew() {
    this.form = {
      numeroCommande: '',
      quantite: 0,
      largeur: 0,
      longueur: 0,
      epaisseur: 0,
      modeleName: ''
    };
    this.dialogVisible = true;
  }

  deleteSelected() {
    if (!this.selected?.length) return;
    this.deleteManyDialog = true;
  }

  confirmDeleteSelected() {
    const ids = this.selected.map(x => x.id!).filter(Boolean);
    this.svc.deleteMany(ids).subscribe({
      next: () => {
        const set = new Set(ids);
        this.rows = this.rows.filter(r => !set.has(r.id!));
        this.selected = [];
        this.toast.add({ severity: 'success', summary: 'Supprimées', detail: 'Commandes supprimées', life: 3000 });
        this.deleteManyDialog = false;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression multiple échouée', life: 3000 })
    });
  }

  /* ——— Table ——— */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  edit(item: CommandeDTO) {
    this.form = { ...item };
    this.dialogVisible = true;
  }

  askDelete(_: Event, item: CommandeDTO) {
    this.current = { ...item };
    this.deleteDialog = true;
  }

  confirmDelete() {
    if (!this.current?.id) return;
    this.svc.delete(this.current.id).subscribe({
      next: () => {
        this.rows = this.rows.filter(r => r.id !== this.current.id);
        this.toast.add({ severity: 'success', summary: 'Supprimée', detail: 'Commande supprimée', life: 3000 });
        this.deleteDialog = false;
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 })
    });
  }

  /* ——— CRUD ——— */
  save() {
    if (!this.form.numeroCommande?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande obligatoire', life: 2500 });
      return;
    }
    if (this.form.quantite <= 0 || this.form.largeur <= 0 || this.form.longueur <= 0 || this.form.epaisseur < 0) {
      this.toast.add({ severity: 'warn', summary: 'Vérifier les valeurs', detail: 'Quantité et dimensions', life: 2500 });
      return;
    }

    if (this.form.id) {
      this.svc.update(this.form).subscribe({
        next: updated => {
          const idx = this.rows.findIndex(r => r.id === updated.id);
          if (idx >= 0) this.rows[idx] = updated;
          this.rows = [...this.rows];
          this.toast.add({ severity: 'success', summary: 'Mis à jour', detail: 'Commande modifiée', life: 2500 });
          this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Mise à jour échouée', life: 3000 })
      });
    } else {
      this.svc.create(this.form).subscribe({
        next: created => {
          this.rows = [created, ...this.rows];
          this.toast.add({ severity: 'success', summary: 'Créée', detail: 'Nouvelle commande ajoutée', life: 2500 });
          this.dialogVisible = false;
        },
        error: () => this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Création échouée', life: 3000 })
      });
    }
  }
}
