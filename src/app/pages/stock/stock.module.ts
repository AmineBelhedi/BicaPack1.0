import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StockRoutingModule } from './stock-routing.module';
import { StockComponent } from './stock.component';

/* PrimeNG */
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';   // <-- AJOUT
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';             // <-- AJOUT

@NgModule({
  declarations: [StockComponent],
  imports: [
    CommonModule,
    FormsModule,
    StockRoutingModule,

    /* PrimeNG */
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    MultiSelectModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ConfirmPopupModule,  // <-- AJOUT
    TooltipModule,
    ImageModule,
    ProgressSpinnerModule,
    ToolbarModule        // <-- AJOUT
  ]
})
export class StockModule {}
