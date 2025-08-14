import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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

@NgModule({
  declarations: [DetailCommandeComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    TagModule,
    ButtonModule,
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
    DetailCommandeRoutingModule
  ]
})
export class DetailCommandeModule {}
