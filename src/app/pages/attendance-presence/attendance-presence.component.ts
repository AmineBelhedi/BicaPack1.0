import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { Employee } from 'src/app/models/employee';
import { AttendanceSummaryDTO, AttendanceService, Absence } from 'src/app/services/attendance.service';
import { ApiService } from 'src/app/services/api.service';
import { Table } from 'primeng/table';
import { interval } from 'rxjs';
import { EffectifSousTraitant } from 'src/app/models/effectifSousTraitant';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { SousTraitant } from 'src/app/models/sousTraitant';


type RowVM = {
  employeeId: number;
  name: string;
  matricule?: string;
  jobTitle?: string;
  phoneNumber?: string;
  status: 'PRESENT' | 'ABSENT';
  reason?: string;
  note?: string;
  selected?: boolean;
};
type AbsenceReason = 'MALADIE' | 'MATERNITE' | 'CONGE' | 'AUTRE' | 'UNJUSTIFIED' | string;



@Component({
  selector: 'app-attendance-presence',
  templateUrl: './attendance-presence.component.html',
  styleUrls: ['./attendance-presence.component.scss'],
  providers: [MessageService],
})
export class AttendancePresenceComponent implements OnInit, OnDestroy {
  sousTraitantId!: number;
  loading = false;
  sousTraitant: SousTraitant | null = null;
  summary?: AttendanceSummaryDTO;
  rows: RowVM[] = [];
  selectedRows: RowVM[] = [];
  private sub = new Subscription();
  now: Date = new Date();
  session1Start: Date | null = null;
  session1End: Date | null = null;
  session2Start: Date | null = null;
  session2End: Date | null = null;
  pauseDurationMin: number = 60;  // durée cible de la pause (modifiable)
  pauseStart: Date | null = null; // quand on démarre la pause
  showAbsencesEmployee : boolean = false ; 


 authorizedReasons = [
    { label: 'Maladie', value: 'MALADIE' as AbsenceReason },
    { label: 'Congé maternité', value: 'MATERNITE' as AbsenceReason },
    { label: 'Congé', value: 'CONGE' as AbsenceReason },
    { label: 'Autre', value: 'AUTRE' as AbsenceReason },
  ];

  private AUTHORIZED_SET = new Set<AbsenceReason>(['MALADIE', 'MATERNITE', 'CONGE', 'AUTRE']);
  constructor(private svc: AttendanceService, private api: ApiService,private auth : AuthService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef,
    private toast: MessageService) { }

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(p => {
        const id = p.get('id');
        if (id) {
          this.sousTraitantId = +id;
          Promise.resolve().then(() => this.refresh()); // <-- différé
        } else {
          this.toast.add({ severity: 'warn', summary: 'Paramètre manquant', detail: 'sousTraitantId absent dans l’URL' });
        }
      })
    );
    this.getSt();
    this.updateDonut();
      this.sub.add(interval(1000).subscribe(() => {
    this.now = new Date();
    
   
  }));
  this.loadEffectifs(); 
  this.getAbsencesDuJour(); 
  this.getUser();
  }
  user : User = new User(); 

  getUser(){
      this.auth.getProfile().subscribe(res=>{
        this.user=res ; 
      })
  }


  isAuthorizedReason(r?: string | null): boolean {
    return !!r && this.AUTHORIZED_SET.has(r as AbsenceReason);
  }

  formatReason(r?: string | null): string {
    switch (r) {
      case 'MALADIE': return 'Maladie';
      case 'MATERNITE': return 'Congé maternité';
      case 'CONGE': return 'Congé';
      case 'AUTRE': return 'Autre';
      default: return r || '';
    }
  }

  absDialog = {
    visible: false,
    saving: false,
    bulk: false,
    targetRow: null as RowVM | null,
    model: {
      type: 'AUTORISEE' as 'AUTORISEE' | 'NON_AUTORISEE',
      reason: null as AbsenceReason | null,
      note: ''
    }
  };

   openAbsDialogForRow(row: RowVM) {
    this.absDialog.bulk = false;
    this.absDialog.targetRow = row;
    this.absDialog.model = { type: 'AUTORISEE', reason: null, note: '' };
    this.absDialog.visible = true;
  }

  openAbsDialogForBulk() {
    if (!(this.selectedRows || []).some(r => r.status === 'PRESENT')) return;
    this.absDialog.bulk = true;
    this.absDialog.targetRow = null;
    this.absDialog.model = { type: 'AUTORISEE', reason: null, note: '' };
    this.absDialog.visible = true;
  }

  closeAbsDialog() {
    if (this.absDialog.saving) return;
    this.absDialog.visible = false;
  }

  canSaveAbsDialog(): boolean {
    // autorisée => raison obligatoire ; non autorisée => ok sans raison
    return this.absDialog.model.type === 'AUTORISEE' ? !!this.absDialog.model.reason : true;
  }

  toggle(row: RowVM): void {
    if (!this.sousTraitantId) return;
    if (row.status === 'PRESENT') {
      this.openAbsDialogForRow(row); // demande type + (éventuelle) raison
    } else {
      // annulation standard existante
      this.loading = true;
      this.cdr.detectChanges();
      this.sub.add(this.svc.unmarkAbsent(row.employeeId, this.dateStr).subscribe({
        next: _ => {
          row.status = 'PRESENT';
          row.reason = undefined; // => redeviendra “—”
          row.note = undefined;
          this.toast.add({ severity: 'success', summary: 'Présence', detail: `${row.name} redevient présent` });
          this.refreshSummaryOnly(); this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Annulation absence échouée' });
          console.error(err);
        }
      }));
    }
  }

  markSelectedAbsent(): void {
    const hasPresent = (this.selectedRows || []).some(r => r.status === 'PRESENT');
    if (!hasPresent) return;
    this.openAbsDialogForBulk();
  }
  // toggle propre de l’overlay du p-calendar
toggleCalendarOverlay(cal: any): void {
  if (!cal) return;
  cal.overlayVisible ? cal.hideOverlay() : cal.showOverlay();
}
openAbsencesEmployees(){
  this.showAbsencesEmployee =true ; 
}
hideAbsencesEmployees(){
  this.showAbsencesEmployee = false; 
}
totalLivraison =0;
// getProductionReel(){
//   this.api.getTotalLivraisonParDate(this.sousTraitantId, this.dateStr).subscribe({
//     next: (total) => {
//       console.log('Total livré = ', total);
//       this.totalLivraison = total;
//       console.log(this.dateModel,this.dateStr)
//     },
//     error: (err) => {
//       console.error('Erreur lors de la récupération du total', err);
//     }
//   });
  
// }
getDernierEffectifDuJour(): EffectifSousTraitant | undefined {
  if (!this.effectifs || this.effectifs.length === 0) return undefined;

  // Transformer en string YYYY-MM-DD pour comparer les dates (ignorer heures)
  const targetDate = this.toISODate(this.dateModel);

  const effectifsJour = this.effectifs.filter(e => {
    return this.toISODate(e.dateJour) === targetDate;
  });

  // Trier du plus récent au plus ancien (au cas où il y en a plusieurs ce jour-là)
  effectifsJour.sort((a, b) => {
    return new Date(b.dateJour).getTime() - new Date(a.dateJour).getTime();
  });

  // Retourner le dernier trouvé (le plus récent dans la journée)
  return effectifsJour.length > 0 ? effectifsJour[0] : undefined;
}





  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal(
      (event.target as HTMLInputElement).value,
      'contains'
    );
  }

  getSt() {
    this.api.getSousTraitantById(this.sousTraitantId).subscribe(res => {
      this.sousTraitant = res;
    })
  }
  dateModel: Date = new Date();
  dateStr: string = this.toISODate(this.dateModel);

  onDateChange(value: Date): void {
    this.dateModel = value instanceof Date ? value : new Date(value);
    this.dateStr = this.toISODate(this.dateModel);
  
    // récupérer l'effectif du jour
    this.effectifSt = this.getDernierEffectifDuJour();
  
    if (this.effectifSt) {
      // hydrater les champs avec les valeurs existantes
      this.session1Start = this.effectifSt.dateDebutSeanceMatin ? new Date(this.effectifSt.dateDebutSeanceMatin) : null;
      this.session1End   = this.effectifSt.dateFinSeanceMatin   ? new Date(this.effectifSt.dateFinSeanceMatin)   : null;
      this.session2Start = this.effectifSt.dateDebutSeanceMidi  ? new Date(this.effectifSt.dateDebutSeanceMidi)  : null;
      this.session2End   = this.effectifSt.dateFinSeanceMidi    ? new Date(this.effectifSt.dateFinSeanceMidi)    : null;
      this.pauseDurationMin = this.effectifSt.pause ?? 60; // valeur par défaut si null
    } else {
      // si aucun effectif trouvé ce jour-là, reset valeurs
      this.session1Start = null;
      this.session1End   = null;
      this.session2Start = null;
      this.session2End   = null;
      this.pauseDurationMin = 60;
    }
  
    console.log("Effectif trouvé:", this.effectifSt);

    Promise.resolve().then(() => this.refresh()); // <-- différé
    this.getAbsencesDuJour();
   // this.getProductionReel(); 
  }
  absences : Absence[]=[ ]; 
  getAbsencesDuJour(){
    this.svc.listAbsencesBySousTraitant(this.sousTraitantId, this.dateStr)
  .subscribe(absences => {
    console.log("Absents du jour:", absences);
    this.absences = absences;
  });

  }
  
  ngOnDestroy(): void { this.sub.unsubscribe(); }
  get hasPresentSelected(): boolean { return this.selectedRows?.some(r => r.status === 'PRESENT') ?? false; }
  get hasAbsentSelected(): boolean { return this.selectedRows?.some(r => r.status === 'ABSENT') ?? false; }

  refresh(): void {
    if (!this.sousTraitantId) return;
    this.loading = true;
    this.rows = [];
    this.selectedRows = [];

    const employees$ = this.api.getEmployeesBySousTraitant(this.sousTraitantId);
    const absences$ = this.svc.listAbsences(this.sousTraitantId, this.dateStr);
    const summary$ = this.svc.getDailySummary(this.sousTraitantId, this.dateStr);
   //   this.getEffectif();
    this.sub.add(
      forkJoin([employees$, absences$, summary$]).subscribe({
        next: ([employees, absences, summary]) => {
          this.summary = summary;

          // 1) Tous les employés -> PRESENT par défaut
          const map = new Map<number, RowVM>();
          for (const e of employees) {
            map.set(e.id, {
              employeeId: e.id,
              name: this.fullName(e),
              matricule: e.matricule,
              jobTitle: e.jobTitle,
              phoneNumber: e.phoneNumber,
              status: 'PRESENT'
            });
          }

          // 2) Appliquer les absences -> basculer en ABSENT
          for (const a of absences) {
            const id = a.employee.id;
            const existing = map.get(id);
            if (existing) {
              existing.status = 'ABSENT';
              existing.reason = a.reason;
              existing.note = a.note;
            } else {
              map.set(id, {
                employeeId: id,
                name: this.fullName(a.employee),
                matricule: a.employee.matricule,
                jobTitle: a.employee.jobTitle,
                phoneNumber: a.employee.phoneNumber,
                status: 'ABSENT',
                reason: a.reason,
                note: a.note
              });
            }
          }

          this.rows = Array.from(map.values())
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'fr', { sensitivity: 'base' }));

          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible' });
          console.error(err);
        }
      })
    );
  }

  effectifs :EffectifSousTraitant[]=[]; 
  effectifSt :EffectifSousTraitant  = new EffectifSousTraitant();
  // getEffectif(){
  //   console.log(this.dateStr)
  //   this.api
  // .getEffectifByDate(this.sousTraitantId, this.dateModel.toISOString()) // ID = 5, Date = 16 août 2025
  // .subscribe({
  //   next: (effectif) => {
  //     this.effectifSt=effectif; 
  //     console.log('Effectif présent :', effectif);
  //   },
  //   error: (err) => {
  //     console.error('Erreur lors de la récupération de l’effectif', err);
  //   }
  // });

  // }
  updatePresence() { 
    this.api.updateEffectifSousTraitant(this.effectifSt,this.effectifSt.id).subscribe(saved => {
     
      this.loadEffectifs(); // recharger la liste après ajout
    },err=>{
        
    });
  }
  dialogProduction: boolean = false;
  effectifStToEdit: EffectifSousTraitant = {} as EffectifSousTraitant;

  openProductionDialog() {
    this.effectifStToEdit = { ...this.effectifSt }; // clone pour éviter de modifier direct
    this.dialogProduction = true;
  }
  
saveProduction() {
  if (this.effectifStToEdit) {
    this.api.updateEffectifSousTraitant(this.effectifStToEdit, this.effectifStToEdit.id)
      .subscribe(saved => {
        this.dialogProduction = false;
        this.loadEffectifs(); // recharge la liste
      }, err => {
        console.error("Erreur lors de la mise à jour de la production", err);
      });
  }
}
  effecttif : EffectifSousTraitant ; 
  loadEffectifs() {
    this.api.getSousTraitantById(this.sousTraitantId).subscribe(res => {
      res.effectifs.map(item=>{
        item.dateJour = new Date(item.dateJour)
      })
      this.effectifs = res.effectifs.sort((a, b) => {
        return new Date(b.dateJour).getTime() - new Date(a.dateJour).getTime();
      });
      this.effectifSt = this.getDernierEffectifDuJour(); 
      if (this.effectifSt) {
        // hydrater les champs avec les valeurs existantes
        this.session1Start = this.effectifSt.dateDebutSeanceMatin ? new Date(this.effectifSt.dateDebutSeanceMatin) : null;
        this.session1End   = this.effectifSt.dateFinSeanceMatin   ? new Date(this.effectifSt.dateFinSeanceMatin)   : null;
        this.session2Start = this.effectifSt.dateDebutSeanceMidi  ? new Date(this.effectifSt.dateDebutSeanceMidi)  : null;
        this.session2End   = this.effectifSt.dateFinSeanceMidi    ? new Date(this.effectifSt.dateFinSeanceMidi)    : null;
        this.pauseDurationMin = this.effectifSt.pause ?? 60; // valeur par défaut si null
       
      } else {
        // si aucun effectif trouvé ce jour-là, reset valeurs
        this.session1Start = null;
        this.session1End   = null;
        this.session2Start = null;
        this.session2End   = null;
        this.pauseDurationMin = 60;
      }
      // /console.log(this.effectifs) ; 
    });
  }
  refreshSummaryOnly(): void {
    if (!this.sousTraitantId) return;
    this.sub.add(this.svc.getDailySummary(this.sousTraitantId, this.dateStr).subscribe(s => this.summary = s));
    this.getAbsencesDuJour();

  }



  confirmAbsence() {
  const isAuthorized = this.absDialog.model.type === 'AUTORISEE';
  const reasonToSend: AbsenceReason = isAuthorized
    ? (this.absDialog.model.reason as AbsenceReason)
    : 'UNJUSTIFIED'; // même code que le back pour absence non autorisée

  const noteToSend = this.absDialog.model.note || '';
  this.absDialog.saving = true;

  // ----- INDIVIDUEL -----
  if (!this.absDialog.bulk && this.absDialog.targetRow) {
    const row = this.absDialog.targetRow;

    this.sub.add(
      this.svc.markAbsent({
        employeeId: row.employeeId,
        date: this.dateStr,
        reason: reasonToSend,
        note: noteToSend
      }).subscribe({
        next: _ => {
          row.status = 'ABSENT';
          // Affichage: si non autorisée -> on laisse reason undefined pour montrer "—"
          row.reason = isAuthorized ? reasonToSend : undefined;
          row.note = noteToSend;

          this.toast.add({ severity: 'success', summary: 'Absence', detail: `${row.name} marqué absent` });
          this.absDialog.saving = false;
          this.absDialog.visible = false;
          this.refreshSummaryOnly();
        },
        error: err => {
          this.absDialog.saving = false;
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Marquage absent échoué' });
          console.error(err);
        }
      })
    );

    return; // on sort ici uniquement pour le cas individuel
  }

  // ----- BULK -----
  if (this.absDialog.bulk) {
    // 1) snapshot pour éviter que la sélection ne bouge pendant l'appel
    const snapshot = [...(this.selectedRows || [])];
    // 2) ne prendre que les "PRESENT" et dédupliquer
    const ids = Array.from(
      new Set(snapshot.filter(r => r.status === 'PRESENT').map(r => r.employeeId))
    );

    if (!ids.length) {
      this.absDialog.saving = false;
      this.absDialog.visible = false;
      return;
    }

    // ⚠️ Ton unmark bulk envoie { employeeIds, date }, donc on reste cohérent ici
    const payload = {
      employeeIds: ids,
      date: this.dateStr,
      reason: reasonToSend,
      note: noteToSend
    };

    this.sub.add(
      this.svc.markAbsentBulk(payload).subscribe({
        next: _ => {
          this.toast.add({
            severity: 'success',
            summary: 'Absences',
            detail: `${ids.length} employés marqués absents`
          });

          this.absDialog.saving = false;
          this.absDialog.visible = false;

          // Optionnel: mise à jour optimiste (sinon refresh())
          // snapshot.forEach(r => {
          //   if (r.status === 'PRESENT') {
          //     r.status = 'ABSENT';
          //     r.reason = isAuthorized ? reasonToSend : undefined;
          //     r.note = noteToSend;
          //   }
          // });

          this.refresh(); // sûr et simple
        },
        error: err => {
          this.absDialog.saving = false;
          this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Bulk absent échoué' });
          console.error(err);
        }
      })
    );
  }
}


  // toggle(row: RowVM): void {
  //   if (!this.sousTraitantId) return;
  //   this.loading = true;
  //   if (row.status === 'PRESENT') {
  //     this.cdr.detectChanges();
  //     this.sub.add(this.svc.markAbsent({ employeeId: row.employeeId, date: this.dateStr, reason: 'UNJUSTIFIED', note: '' })
  //       .subscribe({
  //         next: _ => { row.status = 'ABSENT'; this.toast.add({ severity: 'success', summary: 'Absence', detail: `${row.name} marqué absent` }); this.refreshSummaryOnly(); this.loading = false; },
  //         error: err => { this.loading = false; this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Marquage absent échoué' }); console.error(err); }
  //       })
  //     );
  //   } else {
  //     this.cdr.detectChanges();
  //     this.sub.add(this.svc.unmarkAbsent(row.employeeId, this.dateStr)
  //       .subscribe({
  //         next: _ => { row.status = 'PRESENT'; row.reason = ''; row.note = ''; this.toast.add({ severity: 'success', summary: 'Présence', detail: `${row.name} redevient présent` }); this.refreshSummaryOnly(); this.loading = false; },
  //         error: err => { this.loading = false; this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Annulation absence échouée' }); console.error(err); }
  //       })
  //     );
  //   }
  // }
  presenceDonut = {
    labels: ['Présents', 'Absents'],
    datasets: [
      {
        data: [], // rempli au ngOnInit / ngOnChanges
      }
    ]
  };

  donutOptions = {
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.parsed} (${this.effectif > 0 ? Math.round((ctx.parsed / this.effectif) * 100) : 0}%)` } }
    }
  };

  get effectif(): number {
    return this.summary?.effectifActif ?? 0;
  }
  get presenceRate(): number {
    const eff = this.effectif;
    const p = this.summary?.presents ?? 0;
    return eff > 0 ? Math.round((p / eff) * 100) : 0;
  }
  get absenceRate(): number {
    const eff = this.effectif;
    const a = this.summary?.absents ?? 0;
    return eff > 0 ? Math.round((a / eff) * 100) : 0;
  }

  ngOnChanges() {
    this.updateDonut();
  }
  private updateDonut() {
    const p = this.summary?.presents ?? 0;
    const a = this.summary?.absents ?? 0;
    this.presenceDonut = {
      ...this.presenceDonut,
      datasets: [{ data: [p, a] }]
    };
  }
  // markSelectedAbsent(): void {
  //   const ids = (this.selectedRows || []).filter(r => r.status === 'PRESENT').map(r => r.employeeId);
  //   if (!ids.length) return;
  //   this.loading = true;
  //   this.sub.add(this.svc.markAbsentBulk({ employeeIds: ids, date: this.dateStr, reason: 'UNJUSTIFIED', note: 'bulk' })
  //     .subscribe({
  //       next: _ => { this.toast.add({ severity: 'success', summary: 'Bulk', detail: `${ids.length} employés marqués absents` }); this.refresh(); },
  //       error: err => { this.loading = false; this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Bulk absent échoué' }); console.error(err); }
  //     })
  //   );
  // }

  unmarkSelected(): void {
    const ids = (this.selectedRows || []).filter(r => r.status === 'ABSENT').map(r => r.employeeId);
    if (!ids.length) return;
    this.loading = true;
    this.sub.add(this.svc.unmarkAbsentBulk({ employeeIds: ids, date: this.dateStr })
      .subscribe({
        next: _ => { this.toast.add({ severity: 'success', summary: 'Bulk', detail: `${ids.length} absences annulées` }); this.refresh(); },
        error: err => { this.loading = false; this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Bulk annulation échouée' }); console.error(err); }
      })
    );
  }


  fullName(e: Partial<Employee>): string {
    const f = (e.firstname || '').trim(), l = (e.lastname || '').trim();
    return (f || l) ? `${f} ${l}`.trim() : `#${e.id}`;
  }

  private toISODate(d: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }


  /** Taux d’absentéisme du jour en % */
get absenteeismRate(): number {
  const eff = this.summary?.effectifActif ?? 0;
  const a = this.summary?.absents ?? 0;
  return eff > 0 ? Math.round((a / eff) * 100) : 0;
}

/** Badge de sévérité selon un seuil simple (ajuste librement) */
get absenteeismSeverity(): 'success' | 'warning' | 'danger' {
  const r = this.absenteeismRate;
  if (r <= 3) return 'success';   // faible absentéisme
  if (r <= 7) return 'warning';   // moyen
  return 'danger';                // élevé
}

              ///////////

private diffMinutes(start?: Date | null, end?: Date | null): number {
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? Math.round(ms / 60000) : 0;
}
private msToHMS(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
get session1DurationMin(): number {
  return this.diffMinutes(this.session1Start, this.session1End);
}
get session1Status(): 'not-set' | 'invalid' | 'upcoming' | 'active' | 'done' {
  const st = this.session1Start?.getTime();
  const en = this.session1End?.getTime();
  if (!st || !en) return 'not-set';
  if (en <= st) return 'invalid';
  const now = this.now.getTime();
  if (now < st) return 'upcoming';
  if (now > en) return 'done';
  return 'active';
}

get session1Countdown(): string {
  switch (this.session1Status) {
    case 'active':   return `Restant ${this.msToHMS(this.session1End!.getTime() - this.now.getTime())}`;
    case 'upcoming': return `Débute dans ${this.msToHMS(this.session1Start!.getTime() - this.now.getTime())}`;
    case 'done':     return 'Terminé';
    case 'invalid':  return 'Intervalle invalide';
    default:         return '—';
  }
}
get session2DurationMin(): number {
  return this.diffMinutes(this.session2Start, this.session2End);
}
get session2Status(): 'not-set' | 'invalid' | 'upcoming' | 'active' | 'done' {
  const st = this.session2Start?.getTime();
  const en = this.session2End?.getTime();
  if (!st || !en) return 'not-set';
  if (en <= st) return 'invalid';
  const now = this.now.getTime();
  if (now < st) return 'upcoming';
  if (now > en) return 'done';
  return 'active';
}

get session2Countdown(): string {
  switch (this.session2Status) {
    case 'active':   return `Restant ${this.msToHMS(this.session2End!.getTime() - this.now.getTime())}`;
    case 'upcoming': return `Débute dans ${this.msToHMS(this.session2Start!.getTime() - this.now.getTime())}`;
    case 'done':     return 'Terminé';
    case 'invalid':  return 'Intervalle invalide';
    default:         return '—';
  }
}
startPause(): void { this.pauseStart = new Date(); }
resetPause(): void { this.pauseStart = null; }

get pauseRemainingMs(): number {
  const total = this.pauseDurationMin * 60000;
  if (!this.pauseStart) return total; // pas démarrée → reste total
  const elapsed = this.now.getTime() - this.pauseStart.getTime();
  return Math.max(0, total - elapsed);
}
get pauseElapsedPct(): number {
  const total = Math.max(1, this.pauseDurationMin * 60000); // éviter /0
  const elapsed = this.pauseStart ? Math.min(total, this.now.getTime() - this.pauseStart.getTime()) : 0;
  return Math.round((elapsed / total) * 100);
}
get pauseCountdown(): string {
  return this.msToHMS(this.pauseRemainingMs);
}



}
