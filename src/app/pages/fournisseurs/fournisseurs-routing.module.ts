import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FournisseursComponent } from './fournisseurs.component';

const routes: Routes = [
  {
    path :'', 
    component :FournisseursComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FournisseursRoutingModule { }
