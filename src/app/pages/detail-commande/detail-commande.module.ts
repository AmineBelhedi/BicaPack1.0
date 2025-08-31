import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { QRCodeModule } from 'angularx-qrcode';
import { InputNumberModule } from 'primeng/inputnumber';
import { DetailCommandeRoutingModule } from './detail-commande-routing.module';
import { DetailCommandeComponent } from './detail-commande.component'; // adapte le chemin si besoin
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductionCardComponent } from './production-card/production-card.component';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
@NgModule({
  declarations: [DetailCommandeComponent,ProductionCardComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule , 
    CheckboxModule,
    ToastModule, 
    ImageModule,
    DropdownModule,
    FileUploadModule,
    ProgressBarModule, 
    ChipsModule,
    ChipModule,
    QRCodeModule,
    InputNumberModule,
    DetailCommandeRoutingModule,
    DividerModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers:[ConfirmationService]
})
export class DetailCommandeModule {}
