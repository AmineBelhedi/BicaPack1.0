import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportDetailsComponent } from './import-details.component';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  declarations: [ImportDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ImportDetailsComponent
      }
    ]),
    TableModule,
    ButtonModule,
    ToastModule, 
    CardModule,
    CalendarModule, 
    InputTextModule,
    InputNumberModule, 
    DropdownModule,
    TagModule,
    InputTextareaModule,
    MultiSelectModule,
    DialogModule,
    FileUploadModule
  ]
})
export class ImportDetailsModule {}
