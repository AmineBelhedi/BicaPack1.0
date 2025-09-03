import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturesAchatComponent } from './factures-achat.component';

const routes: Routes = [
  {
    path : '' , component : FacturesAchatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturesAchatRoutingModule { }
