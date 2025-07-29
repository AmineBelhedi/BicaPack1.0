import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './layout/app.layout.component';
import { NotfoundComponent } from './pages/notfound/notfound.component'; // <-- à adapter selon ton emplacement réel


const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'pages/import', loadChildren: () => import('./pages/import/import.module').then(m => m.ImportModule) },
      {path: 'pages/empty', loadChildren: () => import('./pages/empty/emptydemo-routing.module').then(m => m.EmptyDemoRoutingModule) },
      { path: 'pages/import-details/:id', loadChildren: () => import('./pages/import-details/import-details.module').then(m => m.ImportDetailsModule) },
      { path: 'model', loadChildren: () => import('./pages/model/model.module').then(m => m.ModelModule) },

      // ajoute ici d'autres pages au besoin (clients, fournisseurs, produits...)
    ]
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
