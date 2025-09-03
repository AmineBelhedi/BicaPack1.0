import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SousTraitantComponent } from './sous-traitant.component';

const routes: Routes = [
  {
    path : '' , component : SousTraitantComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SousTraitantRoutingModule { }
