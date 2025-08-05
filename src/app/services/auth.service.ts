import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment.prod';
import { FilterRoleService } from './filter-role.service';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
 // private baseUrl = 'https://localhost:8443/api/auth';
 //  private baseUrl = 'http://44.199.105.225:8080/SIPCONFECTION-API-0.0.1/api/auth';
//private baseUrl = 'http://44.223.230.217:8080/SIPCONFECTION-API-0.0.1/api/auth';

private baseUrl = environment.apiUrl+'auth' ; 

    constructor(private http: HttpClient,private service:FilterRoleService) {}

    login(username: string, password: string): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http
            .post<any>(
                `${this.baseUrl}/login`,
                { username, password },
                { headers }
            )
            .pipe(
                map((response) => {
                    // Store the JWT token in local storage to keep the user logged in between page refreshes
                    if (response && response.jwt) {
                        // this.cleanExpiredToken();
                        localStorage.setItem('token', response.jwt);
                        this.getProfile().subscribe(res=>{
                            this.setProfile(res);
                            this.service.userFullname = res.firstname+' '+res.lastname;  
                            this.service.userRole=res.role; 
                        })
                    }
                    return response;
                }),
                catchError((error) => {
            
                    console.error('Login error', error);
                    return throwError(error);
                })
            );
    }
    isTokenExpired(token: string): boolean {
        if (!token) {
            return true; // No token means it's effectively "expired"
        }

        try {
            // Split the token to get the payload
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Get the current time in seconds
            const currentTime = Math.floor(Date.now() / 1000);

            // Check if the token has expired
            return payload.exp && payload.exp < currentTime;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true; // Assume expired if there's an error
        }
    }

    // Dans ton service d'authentification par exemple
getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };
  }
  
    logout(): void {
        // Remove user from local storage to log user out
        localStorage.removeItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
    removeExpiredToken() {
        const token = localStorage.getItem('token');
        if (this.isTokenExpired(token)) {
            console.warn('Token is expired. Logging out the user.');
           
            localStorage.removeItem('token');
        } else {
            console.log('Token is valid.');
        }
    }
    // cleanExpiredToken(): void {
    //   const token = localStorage.getItem('token');
    //   if (token) {
    //     try {
    //       const decodedToken: any = jwtDecode(token);
    //       const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    //       if (decodedToken.exp && decodedToken.exp < currentTime) {
    //         console.warn('Token expired, removing it from storage.');
    //         localStorage.removeItem('token');
    //       }
    //     } catch (error) {
    //       console.error('Error decoding token:', error);
    //       // Optionally remove the token if decoding fails
    //       localStorage.removeItem('token');
    //     }
    //   }
    // }
    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }
    getProfile(): Observable<any> {
        const token = this.getToken();
        if (!token) {
            return throwError('User is not logged in');
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });

        return this.http.get<any>(`${this.baseUrl}/profile`, { headers }).pipe(
            map((response) => {
                return response; // return the user's profile details
            }),
            catchError((error) => {
                console.error('Profile retrieval error', error);
                return throwError(error);
            })
        );
    }

    getRole(): Observable<string> {
        return this.getProfile().pipe(
            map((profile) => profile.role), // Extract the role from the profile
            catchError((error) => {
                console.error('Error retrieving role', error);
                return throwError(error);
            })
        );
    }


    // AuthService.ts
    private currentUser: User | null = null;

    setProfile(user: User) {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    getCurrentUser(): User | null {
      if (this.currentUser) {
        return this.currentUser;
      }
  
      const userData = localStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
  
      return null;
    }

}
