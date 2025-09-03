import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturesVenteRoutingModule } from './factures-vente-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoFocusModule } from 'primeng/autofocus';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { FocusTrapModule } from 'primeng/focustrap';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { FacturesVenteComponent } from './factures-vente.component';
import { SharedModule } from 'primeng/api';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FacturesVenteRoutingModule, 
     SelectButtonModule,
                TimelineModule, 
               
                TooltipModule, 
                SpeedDialModule, 
                TabMenuModule, 
                CalendarModule,
                TableModule,
                SplitButtonModule,
                DialogModule,
              SharedModule,
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
                ProgressBarModule,ToastModule,
                MultiSelectModule,ConfirmDialogModule,
                InputTextModule,
                FormsModule,ChipsModule,
                InputNumberModule,
                ConfirmPopupModule,
  ]
})
export class FacturesVenteModule { }
