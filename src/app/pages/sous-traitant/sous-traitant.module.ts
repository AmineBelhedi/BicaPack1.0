import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SousTraitantRoutingModule } from './sous-traitant-routing.module';
import { SousTraitantComponent } from './sous-traitant.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SousTraitantRoutingModule,
    TableModule,
    DataViewModule,
    FileUploadModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    CalendarModule,
    DropdownModule, 
    InputTextModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule
  ]
})
export class SousTraitantModule { }
