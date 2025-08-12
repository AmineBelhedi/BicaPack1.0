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

import { QRCodeModule } from 'angularx-qrcode';

import { DetailCommandeRoutingModule } from './detail-commande-routing.module';
import { DetailCommandeComponent } from './detail-commande.component'; // adapte le chemin si besoin

@NgModule({
  declarations: [DetailCommandeComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    TagModule,
    ButtonModule,
    ImageModule,
    DropdownModule,
    FileUploadModule,
    ChipsModule,
    ChipModule,
    QRCodeModule,

    DetailCommandeRoutingModule
  ]
})
export class DetailCommandeModule {}
