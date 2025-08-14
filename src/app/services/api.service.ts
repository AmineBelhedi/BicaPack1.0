import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUser: string;
  apiUrl: string;
  constructor(private http : HttpClient) { 

    this.apiUrl = environment.apiUrl ; 
    this.apiUser = this.apiUrl + 'users/';
  }


   /// Users Services
   getUserById(id: number): Observable<User> {
    return this.http.get<User>(this.apiUser + id);
}
addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUser, user);
}
deletUser(user: User): Observable<User> {
    return this.http.delete<User>(this.apiUser + user.id);
}
getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUser);
}
updateUser(user: User): Observable<User> {
    return this.http.put<User>(this.apiUser + user.id, user);
}
}
