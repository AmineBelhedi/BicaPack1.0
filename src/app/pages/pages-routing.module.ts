import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authGuard } from '../guard/auth.guard';

@NgModule({
    imports: [RouterModule.forChild([
       
     
        { path: 'factures-vente', loadChildren: () => import('../pages/factures-vente/factures-vente.module').then(m => m.FacturesVenteModule) ,  canActivate: [authGuard],data: { roles: ['OWNER','COMPTABILITE','ADMIN','SUPERADMIN'] } },
        { path: 'factures-achat', loadChildren: () => import('../pages/factures-achat/factures-achat.module').then(m => m.FacturesAchatModule) ,  canActivate: [authGuard],data: { roles: ['OWNER','COMPTABILITE','ADMIN','SUPERADMIN'] } },
        { path: 'dashboard', loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardModule) ,  canActivate: [authGuard],data: { roles: ['OWNER',"ADMIN" ,'SUPERADMIN'] } },
  {
        path: '',
        loadChildren: () =>
          import('../pages/commandes/commandes.module').then(m => m.CommandesModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'import',
        loadChildren: () =>
          import('../pages/import/import.module').then(m => m.ImportModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'empty',
        loadChildren: () =>
          import('../pages/empty/emptydemo-routing.module').then(m => m.EmptyDemoRoutingModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'import-details/:id',
        loadChildren: () =>
          import('../pages/import-details/import-details.module').then(m => m.ImportDetailsModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      // {
      //   path: 'model',
      //   loadChildren: () =>
      //     import('../pages/model/model.module').then(m => m.ModelModule),
      //   canActivate: [authGuard],
      //   data: { roles: ['OWNER'] }
      // },

      // ✅ Détail commande
      {
        path: 'detail-commande',
        loadChildren: () =>
          import('../pages/detail-commande/detail-commande.module')
            .then(m => m.DetailCommandeModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../pages/list-users/list-users.module')
            .then(m => m.ListUsersModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },

      // Liste commandes (si tu l’utilises toujours)
      {
        path: 'commandes',
        loadChildren: () =>
          import('../pages/commandes/commandes.module').then(m => m.CommandesModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
       {
        path: 'fournisseurs',
        loadChildren: () =>
          import('../pages/fournisseurs/fournisseurs.module').then(m => m.FournisseursModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
       {
        path: 'factures-achat',
        loadChildren: () =>
          import('../pages/factures-achat/factures-achat.module').then(m => m.FacturesAchatModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
        {
        path: 'factures-vente',
        loadChildren: () =>
          import('../pages/factures-vente/factures-vente.module').then(m => m.FacturesVenteModule),
        canActivate: [authGuard],
        data: { roles: ['OWNER'] }
      },
        {
    path: 'production',
    loadChildren: () =>
      import('../pages/production/production.module').then(m => m.ProductionModule)
  },
      {
    path: 'fournisseurs',
    loadChildren: () =>
      import('../pages/fournisseurs/fournisseurs.module').then(m => m.FournisseursModule)
  },
         { path: 'sous-traitants', loadChildren: () => import('../pages/sous-traitant/sous-traitant.module').then(m => m.SousTraitantModule) ,  canActivate: [authGuard],data: { roles: ['OWNER',"USER","COUPE",'SUPERADMIN'] } },
        
    { path: 'attendance-presence/:id', loadChildren: () => import('../pages/attendance-presence/attendance-presence.module').then(m => m.AttendancePresenceModule),  canActivate: [authGuard],data: { roles: ['OWNER',"ADMIN","ST",'SUPERADMIN','GRH_BJ','BJ_ADMIN'] }  },
        
       
        { path: 'employee/:id', loadChildren: () => import('../pages/employee-details/employee-details.module').then(m => m.EmployeeDetailsModule) ,  canActivate: [authGuard],data: { roles: ['OWNER',"ST","DELAVAGE_RH",'GRH_BJ','ADMIN','SUPERADMIN','BJ_ADMIN'] } },
      { path: 'employees', loadChildren: () => import('../pages/employees-st/employees-st.module').then(m => m.EmployeesStModule) ,  canActivate: [authGuard],data: { roles: ['OWNER',"ADMIN","ST","USER",'SUPERADMIN'] } },
        
        {
    path: 'stock',
    loadChildren: () =>
      import('../pages/stock/stock.module').then(m => m.StockModule)
  },
  
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
