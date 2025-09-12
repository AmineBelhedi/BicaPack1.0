import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            // {
            //     label: 'Home',
            //     items: [
            //         { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
            //     ]
            // },
            {
                label: 'Production',
                items: [
                    // { label: 'Models', icon: 'pi pi-box', routerLink: ['/model'], badge: 'NEW' },
                    { label: 'Commandes', icon: 'pi pi-shopping-bag', routerLink: ['/pages/commandes'] }, 
                       {
                        label: 'Fournisseurs',
                        icon: 'pi pi-sitemap',
                        routerLink: ['/pages/fournisseurs']
                    },

                ]
            },
              {
                label: 'Facturation & Export',
                items: [
                          {
                                label: 'Facturation',
                                icon: 'pi pi-receipt',
                                routerLink: ['/pages/facturation-commandes'],
                            },
                            {
                                label: 'Exportées',
                                icon: 'pi pi-truck',
                                routerLink: ['/pages/exportation-commandes'],
                            },
                            //  {
                            //     label: 'Comptes',
                            //     icon: 'pi pi-fw pi-receipt',
                            //     routerLink: ['/pages/comptes-comptable'],
                            // },
                ],
                
            },
            {
                label: 'STOCK',
                items: [
                    {
                        label: 'Imports',
                        icon: 'pi pi-cloud-download',
                        routerLink: ['/pages/import']
                    },
                ]
            },
            //    {
            //     label: 'Fournisseurs',
            //     items: [
            //         {
            //             label: 'Imports',
            //             icon: 'pi pi-cloud-download',
            //             routerLink: ['/pages/import']
            //         },
            //     ]
            // },
            
                {
                label: 'GRH',
                items: [
                          {
                                label: 'Employées',
                                icon: 'pi pi-users',
                                routerLink: ['/pages/employees'],
                            },
                            {
                                label: 'Fiche Présence',
                                icon: 'pi  pi-address-book',
                                routerLink: ['/pages/attendance-presence/1'],
                            },
                            //  {
                            //     label: 'Comptes',
                            //     icon: 'pi pi-fw pi-receipt',
                            //     routerLink: ['/pages/comptes-comptable'],
                            // },
                ],
                
            },
              {
                label: 'Comptabilité',
                items: [
                          {
                                label: 'Achats',
                                icon: 'pi pi-receipt',
                                routerLink: ['/pages/factures-achat'],
                            },
                            {
                                label: 'Ventes',
                                icon: 'pi pi-receipt',
                                routerLink: ['/pages/factures-vente'],
                            },
                            //  {
                            //     label: 'Comptes',
                            //     icon: 'pi pi-fw pi-receipt',
                            //     routerLink: ['/pages/comptes-comptable'],
                            // },
                ],
                
            },
            // {
            //     label: 'Pages',
            //     icon: 'pi pi-fw pi-briefcase',
            //     items: [
                    
            //         {
            //             label: 'Empty',
            //             icon: 'pi pi-fw pi-circle-off',
            //             routerLink: ['/pages/empty']
            //         },
            //     ]
            // },
        ];
    }
}
