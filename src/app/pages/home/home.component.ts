import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AvatarModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router , private authService : AuthService) {}
  ngOnInit(): void {
   this.getUserProfile(); 
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
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
