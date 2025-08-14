import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './layout/app.layout.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { authGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'pages/import',
        loadChildren: () =>
          import('./pages/import/import.module').then(m => m.ImportModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'pages/empty',
        loadChildren: () =>
          import('./pages/empty/emptydemo-routing.module').then(m => m.EmptyDemoRoutingModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'pages/import-details/:id',
        loadChildren: () =>
          import('./pages/import-details/import-details.module').then(m => m.ImportDetailsModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'model',
        loadChildren: () =>
          import('./pages/model/model.module').then(m => m.ModelModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },

      // ✅ Détail commande
      {
        path: 'pages/detail-commande',
        loadChildren: () =>
          import('./pages/detail-commande/detail-commande.module')
            .then(m => m.DetailCommandeModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'pages/users',
        loadChildren: () =>
          import('./pages/list-users/list-users.module')
            .then(m => m.ListUsersModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },

      // Liste commandes (si tu l’utilises toujours)
      {
        path: 'pages/commandes',
        loadChildren: () =>
          import('./pages/commandes/commandes.module').then(m => m.CommandesModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      }
    ]
  },

  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
    data: { roles: ['OWNER'] }
  },

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
