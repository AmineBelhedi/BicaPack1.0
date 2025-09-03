import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductionComponent } from './production.component';
import { RouterModule, Routes } from '@angular/router';

/* PrimeNG */
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,

    /* PrimeNG */
    TableModule,
    InputNumberModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    DividerModule,
    TooltipModule,
    DialogModule
  ]
})
export class ProductionModule {}
