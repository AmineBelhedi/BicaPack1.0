import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent  implements OnInit{

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService , private authService : AuthService) { }
    ngOnInit(): void {
        this.getUserProfile(); 
    }
    toggleSidebar() {
        this.layoutService.toggleSidebar();
    }
    user: User = new User();

    getUserProfile() {
      this.authService.getProfile().subscribe(res => {
  
        this.user = res;
      })
    }
    logout() {
        this.authService.logout();
        window.location.reload();
      }
}
