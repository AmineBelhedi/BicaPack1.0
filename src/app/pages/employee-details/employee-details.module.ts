import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeDetailsRoutingModule } from './employee-details-routing.module';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { EmployeeDetailsComponent } from './employee-details.component';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EmployeeDetailsRoutingModule,
    FormsModule,
		AutoCompleteModule,
		CalendarModule,
		ChipsModule,
		DropdownModule,
		InputMaskModule,
		InputNumberModule,
		CascadeSelectModule,
		MultiSelectModule,
    ToastModule, 
    ToolbarModule,
		InputTextareaModule,
    ToggleButtonModule,
    CalendarModule,
    CheckboxModule,
    MessagesModule,
		InputTextModule,
    TableModule,
    FileUploadModule
  ]
})
export class EmployeeDetailsModule { }
