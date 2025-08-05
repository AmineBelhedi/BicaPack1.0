import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers :[MessageService],
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {

    currentYear = new Date().getFullYear();

    valCheck: string[] = ['remember'];
    username: string = '';
  password: string = '';
  message: string = '';
  loading : boolean = false ; 


    constructor(public layoutService: LayoutService , private authService : AuthService , private router : Router , private messageService : MessageService) { 
     
    }
 


    login(): void {
      this.loading = true ; 
     
        this.authService.login(this.username.toLowerCase(), this.password).subscribe(
          response => {
        
            this.message = 'Login successful';
            this.router.navigateByUrl('/home');            // Redirect to home or another route
          },
          error => {
            this.message = 'Login failed';
            this.loading=false;
            this.messageService.add({ severity: 'error', summary: 'Login failed', detail: 'Username or Password Incorrect', life: 4000 });
            //console.error(error);
           this.authService.removeExpiredToken();
          }
        );
      }
    
      logout(): void {
        this.authService.logout();
        this.message = 'Logged out';
        // Redirect to login or another route
      }
}
