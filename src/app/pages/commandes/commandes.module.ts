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
import { FieldsetModule } from 'primeng/fieldset';
import { CommandesRoutingModule } from './commandes-routing.module';
import { CommandeComponent } from './commande.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';

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
    FieldsetModule,
    ToolbarModule,
    InputTextModule,
    ProgressSpinnerModule, 
    InputTextareaModule,
    DropdownModule,
    InputNumberModule,
    DialogModule,
    CalendarModule,
    TagModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    ImageModule,
    TooltipModule,
    SelectButtonModule,
    DividerModule,
        SplitButtonModule,
    RouterModule,
    CardModule
  ],
  declarations: [],
  providers: [MessageService, ConfirmationService]
})
export class CommandesModule {}
