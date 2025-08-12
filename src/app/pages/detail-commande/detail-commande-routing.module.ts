import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailCommandeComponent } from './detail-commande.component'; 
// Si ton fichier est dans un sous-dossier, utilise plutôt :
// import { DetailCommandeComponent } from './detail-commande/detail-commande.component';

const routes: Routes = [
  // URL finale: /pages/detail-commande/:id
  { path: ':id', component: DetailCommandeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailCommandeRoutingModule {}
