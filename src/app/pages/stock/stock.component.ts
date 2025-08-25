import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ModeleSac, StatutModele } from 'src/app/models/modele-sac';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class StockComponent implements OnInit {
  // Etat de page
  loading = true;
  dialogVisible = false;
  deleteDialog = false;
  deleteManyDialog = false;

  // Données
  modeles: ModeleSac[] = [];
  selected: ModeleSac[] = [];
  current?: ModeleSac | null;

  // Filtres
  globalFilter = '';
  rowsPerPageOptions = [10, 20, 50];

  // Form CRUD
  form: Partial<ModeleSac> = {};
  editing = false;

  // Upload
  uploading = false;

  // Statuts
  statutOptions = [
    { label: 'Prototype', value: 'PROTOTYPE' as StatutModele },
    { label: 'En cours',  value: 'EN_COURS'  as StatutModele },
    { label: 'Validé',    value: 'VALIDE'    as StatutModele },
  ];

  constructor(
    private toast: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // TODO: remplace par service HTTP
    setTimeout(() => {
      this.modeles = [
        { id: 1, nom: 'Sac 30×20 80', longueur: 30, largeur: 20, grammage: 80,  statut: 'PROTOTYPE', stock: 35,  seuilCritique: 50, image: '', createdAt: new Date().toISOString() },
        { id: 2, nom: 'Sac 40×25 100', longueur: 40, largeur: 25, grammage: 100, statut: 'EN_COURS',  stock: 12,  seuilCritique: 40, image: '' },
        { id: 3, nom: 'Sac 50×30 90',  longueur: 50, largeur: 30, grammage: 90,  statut: 'VALIDE',    stock: 220, seuilCritique: 60, image: '' },
      ];
      this.current = this.modeles[0];
      this.loading = false;
    }, 200);
  }

  // ===== Présentation / helpers =====
  formatDimension(m?: ModeleSac | null): string {
    if (!m) return '—';
    return `${m.longueur || 0}×${m.largeur || 0}×${m.grammage || 0}`;
  }

  statutSeverity(s: StatutModele): 'warning'|'info'|'success' {
    if (s === 'PROTOTYPE') return 'warning';
    if (s === 'EN_COURS')  return 'info';
    return 'success';
  }

  isCritique(m: ModeleSac): boolean {
    return (m.stock ?? 0) < (m.seuilCritique ?? 50);
  }

  // ===== Table filters =====
  onGlobalFilter(table: any, e: Event) {
    this.globalFilter = (e.target as HTMLInputElement).value;
    table.filterGlobal(this.globalFilter, 'contains');
  }

  // ===== Sélection =====
  onRowClick(m: ModeleSac) {
    this.current = m;
  }

  // ===== CRUD =====
  openNew() {
    this.editing = false;
    this.form = { nom: '', longueur: 0, largeur: 0, grammage: 0, statut: 'PROTOTYPE', stock: 0, seuilCritique: 50 };
    this.dialogVisible = true;
  }

  edit(m: ModeleSac) {
    this.editing = true;
    this.form = { ...m };
    this.dialogVisible = true;
  }

  save() {
    if (!this.form.nom?.trim() || !this.form.longueur || !this.form.largeur || !this.form.grammage) {
      this.toast.add({ severity: 'warn', summary: 'Champs requis', detail: 'Nom, dimensions, grammage' });
      return;
    }

    if (this.editing && this.form.id) {
      const idx = this.modeles.findIndex(x => x.id === this.form.id);
      if (idx >= 0) this.modeles[idx] = { ...(this.modeles[idx]), ...(this.form as ModeleSac) };
      if (this.current?.id === this.form.id) this.current = this.modeles[idx];
      this.toast.add({ severity: 'success', summary: 'Modèle mis à jour' });
    } else {
      const nextId = (Math.max(0, ...this.modeles.map(x => x.id)) + 1) || 1;
      const nouveau: ModeleSac = {
        id: nextId,
        nom: this.form.nom!.trim(),
        longueur: Number(this.form.longueur),
        largeur: Number(this.form.largeur),
        grammage: Number(this.form.grammage),
        statut: (this.form.statut ?? 'PROTOTYPE') as StatutModele,
        stock: Number(this.form.stock ?? 0),
        seuilCritique: Number(this.form.seuilCritique ?? 50),
        image: this.form.image || '',
        createdAt: new Date().toISOString()
      };
      this.modeles.unshift(nouveau);
      this.current = nouveau;
      this.toast.add({ severity: 'success', summary: 'Modèle créé' });
    }

    this.dialogVisible = false;
  }

  askDelete(event: Event, m: ModeleSac) {
    this.confirm.confirm({
      target: event.currentTarget as HTMLElement,
      message: `Supprimer « ${m.nom} » ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteOne(m)
    });
  }

  deleteOne(m: ModeleSac) {
    this.modeles = this.modeles.filter(x => x.id !== m.id);
    if (this.current?.id === m.id) this.current = this.modeles[0] ?? null;
    this.toast.add({ severity: 'success', summary: 'Supprimé' });
  }

  deleteSelected() {
    if (!this.selected?.length) return;
    this.deleteManyDialog = true;
  }

  confirmDeleteSelected() {
    const ids = new Set(this.selected.map(x => x.id));
    this.modeles = this.modeles.filter(x => !ids.has(x.id));
    if (this.current && ids.has(this.current.id)) this.current = this.modeles[0] ?? null;
    this.selected = [];
    this.deleteManyDialog = false;
    this.toast.add({ severity: 'success', summary: 'Supprimés' });
  }

  // ===== Upload image (mock) =====
  onImageSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.toast.add({ severity: 'warn', summary: 'Image', detail: 'Max 5 Mo' });
      input.value = ''; return;
    }
    this.uploading = true;
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      this.form.image = url;
      this.uploading = false;
      input.value = '';
    }, 400);
  }
}
