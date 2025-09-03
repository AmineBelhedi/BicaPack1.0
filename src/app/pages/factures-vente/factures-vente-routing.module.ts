import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturesVenteComponent } from './factures-vente.component';

const routes: Routes = [
  {
    path : '' , component : FacturesVenteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturesVenteRoutingModule { }
