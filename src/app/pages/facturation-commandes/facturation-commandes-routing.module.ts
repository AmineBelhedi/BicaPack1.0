import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturationCommandesComponent } from './facturation-commandes.component';


const routes: Routes = [
  {
    path : '' , component : FacturationCommandesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturationCommandesRoutingModule { }
