    import { RouterModule } from '@angular/router';
    import { NgModule } from '@angular/core';
    import { AppLayoutComponent } from "./layout/app.layout.component";
    import { authGuard } from './guard/auth.guard';
    import { ErrorComponent } from './auth/error/error.component';
    @NgModule({
        imports: [
            RouterModule.forRoot([
                // Redirection de la racine vers /home
                { path: '', redirectTo: 'home', pathMatch: 'full' },
    
                {
                    path: '', component: AppLayoutComponent, canActivate:[authGuard],
                    children: [
                    
                        { 
                            path: 'pages', 
                            loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) 
                        },
                    ]
                },
    
                {
                    path: 'home',
                    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeBicapackModule),
                    canActivate: [authGuard],
                    data: { roles: ['OWNER', 'PERSONNEL', 'ADMIN', 'COUPE','ST', 'DELAVAGE','DELAVAGE_RH','GRH_BJ','MAG TISSU','COLLECTION','LMD','RMD',"PRODUCTION",'SUPERADMIN',"COMPTABILITE",'BJ_ADMIN'] }
                },
    
                { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
                // { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
                { path: 'notfound', component: ErrorComponent },
                { path: '**', redirectTo: '/notfound' },
            ], {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload'
            })
        ],
        exports: [RouterModule]
    })
    export class AppRoutingModule { }
    