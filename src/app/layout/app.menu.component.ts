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
                    { label: 'Commandes', icon: 'pi pi-shopping-bag', routerLink: ['/pages/commandes'] }

                ]
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
