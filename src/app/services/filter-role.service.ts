import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FilterRoleService {

  userRole : string ; 
  userFullname : string ; 
  constructor() { 
   
  }
}
