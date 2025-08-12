import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG */
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';

import { CommandesRoutingModule } from './commandes-routing.module';
import { CommandeComponent } from './commande.component';
import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
  imports: [
    CommonModule,
    CommandesRoutingModule,
    FormsModule,
    TableModule,
    FileUploadModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    InputNumberModule,
    DialogModule,
    CalendarModule,
    TagModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ImageModule,
    TooltipModule
  ],
  declarations: [CommandeComponent],
  providers: [MessageService, ConfirmationService]
})
export class CommandesModule {}
