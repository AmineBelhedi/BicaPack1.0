import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FocusTrap, FocusTrapModule } from 'primeng/focustrap';
import { MenubarModule } from 'primeng/menubar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SafeUrlPipe } from 'src/app/safe-url.pipe';
import { ImageModule } from 'primeng/image';
import { DateFormatPipe } from '../utils/date-parser';
import { AutoFocusModule } from 'primeng/autofocus';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SplitButton, SplitButtonModule } from 'primeng/splitbutton';
import { CarouselModule } from 'primeng/carousel';
import { AccordionModule } from 'primeng/accordion';
import { GalleriaModule } from 'primeng/galleria';
import { DataViewModule } from 'primeng/dataview';
import { TabMenuModule } from 'primeng/tabmenu';
import { UtcPlusOnePipe } from '../utils/utcPlusOnePipe';
import { ChartModule } from 'primeng/chart';
import { UtcPlusPipe } from '../utils/utcPlusPipe';
import { ListUsersComponent } from './list-users/list-users.component';
import { PanelModule } from 'primeng/panel';
import { KeyFilterModule } from 'primeng/keyfilter';
import { BadgeModule } from 'primeng/badge';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChipsModule } from 'primeng/chips';
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FacturesVenteComponent } from './factures-vente/factures-vente.component';
import { FacturesAchatModule } from './factures-achat/factures-achat.module';
import { SpeedDialModule } from 'primeng/speeddial';
import { FacturesAchatComponent } from './factures-achat/factures-achat.component';
import { ChipModule } from 'primeng/chip';
import { FournisseursComponent } from './fournisseurs/fournisseurs.component';
import { CommandeComponent } from './commandes/commande.component';
import { ProductionComponent } from './production/production.component';
import { StockComponent } from './stock/stock.component';
import { ImportDetailsComponent } from './import-details/import-details.component';
import { ImportComponent } from './import/import.component';
import { DetailCommandeComponent } from './detail-commande/detail-commande.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductionCardComponent } from './production-card/production-card.component';
import { SousTraitantComponent } from './sous-traitant/sous-traitant.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeesStComponent } from './employees-st/employees-st.component';
import { AttendancePresenceComponent } from './attendance-presence/attendance-presence.component';
import { ExportationCommandesComponent } from './exportation-commandes/exportation-commandes.component';
import { FacturationCommandesComponent } from './facturation-commandes/facturation-commandes.component';
import { PaginatorModule } from 'primeng/paginator';
@NgModule({
    declarations: [SafeUrlPipe, DateFormatPipe, ListUsersComponent, FournisseursComponent,ListUsersComponent , CommandeComponent, ProductionComponent,
         ProductionCardComponent, SousTraitantComponent, EmployeeDetailsComponent, EmployeesStComponent, AttendancePresenceComponent, ExportationCommandesComponent, FacturationCommandesComponent,
        StockComponent, ImportDetailsComponent , ImportComponent , DetailCommandeComponent , DashboardComponent, FacturesVenteComponent, FacturesAchatComponent,],




    imports: [
        CommonModule,
        PagesRoutingModule,
        SelectButtonModule,
        TimelineModule,
        TooltipModule,
        SpeedDialModule,
        TabMenuModule,
        CalendarModule,
        TableModule,
        SplitButtonModule,
        DialogModule,
        KeyFilterModule,
        RippleModule,
        TabViewModule,
        CardModule,
        ButtonModule,
        ToastModule,
        DividerModule,
        ReactiveFormsModule,
        AccordionModule,
        ToolbarModule,
        GalleriaModule,
        CarouselModule,
        ConfirmDialogModule,
        InputSwitchModule,
        FormsModule,
        InputTextModule,
        InputTextareaModule,
        MenubarModule,
        CommonModule,
        CheckboxModule,
        OverlayPanelModule,
        ChipModule,
        PaginatorModule,
        InputTextareaModule,
        PanelModule,
        DataViewModule,
        FileUploadModule,
        AutoFocusModule,
        DropdownModule,
        FocusTrapModule,
        TagModule,
        ImageModule,
        ChartModule,
        BadgeModule,
        RadioButtonModule,
        AutoCompleteModule,
        RatingModule,
        ProgressSpinnerModule,
        ProgressBarModule, ToastModule,
        MultiSelectModule, ConfirmDialogModule,
        InputTextModule,
        FormsModule, ChipsModule,
        InputNumberModule,
        ConfirmPopupModule,


    ]
})
export class PagesModule { }
