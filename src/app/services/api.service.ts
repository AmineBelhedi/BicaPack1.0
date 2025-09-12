import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { Fournisseur } from '../models/fournisseur';
import { Employee } from '../models/employee';
import { SousTraitant } from '../models/sousTraitant';
import { EffectifSousTraitant } from '../models/effectifSousTraitant';
import { Absence } from './attendance.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUser: string;
  apiSousTraitant: string;
   apiEmployee: string;
    apiFournisseur: string;
  apiUrl: string;
  constructor(private http : HttpClient) { 

    this.apiUrl = environment.apiUrl ; 
    this.apiUser = this.apiUrl + 'users/';
    this.apiFournisseur = this.apiUrl + 'fournisseurs/';
    this.apiSousTraitant = this.apiUrl + 'sous-traitants/';
    this.apiEmployee = this.apiUrl + 'employees/';

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


  /// Services for Fournisseur
    getFournisseurById(id: number): Observable<Fournisseur> {
        return this.http.get<Fournisseur>(this.apiFournisseur + id);
    }
    addFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
        return this.http.post<Fournisseur>(this.apiFournisseur, fournisseur);
    }
    deleteFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
        return this.http.delete<Fournisseur>(
            this.apiFournisseur + fournisseur.id
        );
    }
    getAllFournisseurs(): Observable<Fournisseur[]> {
        return this.http.get<Fournisseur[]>(this.apiFournisseur);
    }
    updateFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
        return this.http.put<Fournisseur>(
            this.apiFournisseur + fournisseur.id,
            fournisseur
        );
    }


      /// EMPLOYEES API
    getEmployeeById(id: number): Observable<Employee> {
        return this.http.get<Employee>(this.apiEmployee + id);
    }
    addEmployee(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.apiEmployee, employee);
    }
    deleteEmployee(employee: Employee): Observable<Employee> {
        return this.http.delete<Employee>(this.apiEmployee + employee.id);
    }
    getAllEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.apiEmployee);
    }
    updateEmployee(employee: Employee): Observable<Employee> {
        return this.http.put<Employee>(
            this.apiEmployee + employee.id,
            employee
        );
    }
     getAbsencesEmployee(employeeId : number): Observable<Absence[]> {
        return this.http.get<Absence[]>(this.apiEmployee+'absences/'+employeeId);
    }
    uploadEmployeePhoto(employeeId: number, file: File): Observable<void> {
        const formData = new FormData();
        formData.append('file', file);
    
        return this.http.post<void>(
            `${this.apiEmployee}${employeeId}/photo/upload`,
            formData
        );
    }
    addEmployeeForSousTraitant(sousTraitantId: number, employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(`${this.apiEmployee}sous-traitant/${sousTraitantId}`, employee);
    }
    getEmployeesBySousTraitant(sousTraitantId: number): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.apiEmployee}sous-traitant/${sousTraitantId}`);
    }
        
    getSuspendedEmployeesBySousTraitant(sousTraitantId: number): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.apiEmployee}sous-traitant/suspended/${sousTraitantId}`);
    }


        /// SousTraitant API
    getSousTraitantById(id: number): Observable<SousTraitant> {
        return this.http.get<SousTraitant>(this.apiSousTraitant + id);
    }
    getSousTraitantByCodeUsine(code: number): Observable<SousTraitant> {
        return this.http.get<SousTraitant>(this.apiSousTraitant +'code/'+code);
    }
    addSousTraitant(sousTraitant: SousTraitant): Observable<SousTraitant> {
        return this.http.post<SousTraitant>(this.apiSousTraitant, sousTraitant);
    }
    addEffectifSousTraitant(sousTraitant: EffectifSousTraitant , stId: number): Observable<EffectifSousTraitant> {
        return this.http.post<EffectifSousTraitant>(this.apiSousTraitant+'addEffectifPresent/'+stId, sousTraitant);
    }
    updateEffectifSousTraitant(sousTraitant: EffectifSousTraitant , effectifId: number): Observable<EffectifSousTraitant> {
        return this.http.put<EffectifSousTraitant>(this.apiSousTraitant+'updateEffectifPresent/'+effectifId, sousTraitant);
    }
    getEffectifByDate(sousTraitantId: number, dateJour: string): Observable<EffectifSousTraitant> {
        
        return this.http.get<EffectifSousTraitant>(`${this.apiSousTraitant}effectif/${sousTraitantId}/${dateJour}`);
      }
    deleteSousTraitant(sousTraitant: SousTraitant): Observable<SousTraitant> {
        return this.http.delete<SousTraitant>(
            this.apiSousTraitant + sousTraitant.id
        );
    }
    deleteEffectifPresent(effectifId : number): Observable<EffectifSousTraitant> {
        return this.http.delete<EffectifSousTraitant>(
            this.apiSousTraitant + effectifId+'/effectif'
        ); 
    }
    getAllSousTraitants(): Observable<SousTraitant[]> {
        return this.http.get<SousTraitant[]>(this.apiSousTraitant);
    }
    updateSousTraitant(sousTraitant: SousTraitant): Observable<SousTraitant> {
        return this.http.put<SousTraitant>(
            this.apiSousTraitant + sousTraitant.id,
            sousTraitant
        );
    }

}
