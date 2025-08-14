import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotfoundComponent } from './notfound.component';
import { NotfoundRoutingModule } from './notfound-routing.module';
import { RouterModule } from '@angular/router'; // ✅ nécessaire pour [routerLink]

@NgModule({
  declarations: [NotfoundComponent],
  imports: [
    CommonModule,
    NotfoundRoutingModule,
    RouterModule // important pour les directives comme [routerLink]
  ]
})
export class NotfoundModule {}
