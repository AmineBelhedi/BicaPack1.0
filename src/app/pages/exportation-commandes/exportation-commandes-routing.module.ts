import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExportationCommandesComponent } from './exportation-commandes.component';

const routes: Routes = [
  {
    path : '' , component : ExportationCommandesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportationCommandesRoutingModule { }
