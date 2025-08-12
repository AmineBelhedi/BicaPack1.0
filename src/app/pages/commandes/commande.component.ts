import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommandeModel, StatutCommande } from 'src/app/models/commande.model';
import { CommandeService } from 'src/app/services/commande.service';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
  providers: [MessageService]
})
export class CommandeComponent implements OnInit {
  rows: CommandeModel[] = [];
  selected: CommandeModel[] = [];
  rowsPerPageOptions = [10, 20, 30];

  // Dialogs
  dialogVisible = false;
  deleteDialog = false;
  deleteManyDialog = false;

  // Form
  form: CommandeModel = {
    numeroCommande: '',
    nomCommande: '',
    quantite: 0,
    client: '',
    dateCommande: new Date(),
    statut: 'Brouillon',
    imageUrl: ''
  };

  // Fichier sélectionné (nom)
  selectedFileName: string | null = null;

  // Pour confirmation Delete 1
  current!: CommandeModel;

  statutOptions = [
    { label: 'Brouillon',     value: 'Brouillon'     as StatutCommande },
    { label: 'Confirmée',     value: 'Confirmée'     as StatutCommande },
    { label: 'En production', value: 'En production' as StatutCommande },
    { label: 'Livrée',        value: 'Livrée'        as StatutCommande },
    { label: 'Annulée',       value: 'Annulée'       as StatutCommande }
  ];

  constructor(
    private svc: CommandeService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.svc.getAll().subscribe({
      next: data => this.rows = data,
      error: err => console.error('Erreur chargement commandes:', err)
    });
  }

  /* ——— Toolbar ——— */
  openNew() {
    this.form = {
      numeroCommande: '',
      nomCommande: '',
      quantite: 0,
      client: '',
      dateCommande: new Date(),
      statut: 'Brouillon',
      imageUrl: ''
    };
    this.selectedFileName = null;
    this.dialogVisible = true;
  }

  deleteSelected() {
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
      }
    });
  }

  /* ——— Table ——— */
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  edit(item: CommandeModel) {
    this.form = { ...item, dateCommande: new Date(item.dateCommande) };
    this.selectedFileName = null; // on ne connaît pas le nom d’origine
    this.dialogVisible = true;
  }

  askDelete(_: Event, item: CommandeModel) {
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
      }
    });
  }

  /* ——— CRUD ——— */
  save() {
    if (!this.form.numeroCommande?.trim() || !this.form.nomCommande?.trim()) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'N° commande et Nom commande', life: 2500 });
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
        }
      });
    } else {
      this.svc.create(this.form).subscribe({
        next: created => {
          this.rows = [created, ...this.rows];
          this.toast.add({ severity: 'success', summary: 'Créée', detail: 'Nouvelle commande ajoutée', life: 2500 });
          this.dialogVisible = false;
        }
      });
    }
  }

  /* ——— Image upload (base64) ——— */
  onImageSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => (this.form.imageUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  getSeverity(statut: StatutCommande) {
    switch (statut) {
      case 'Livrée':        return 'success';
      case 'Confirmée':     return 'info';
      case 'En production': return 'warning';
      case 'Annulée':       return 'danger';
      default:              return 'secondary';
    }
  }
}
