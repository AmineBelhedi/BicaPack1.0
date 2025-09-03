import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';
import { environment } from 'src/environments/environment.prod';

export interface Absence {
  id?: number;
  employee: Employee;
  date: string;            // YYYY-MM-DD
  reason?: string;
  note?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface AbsenceRequest {
  employeeId: number;
  date: string;            // YYYY-MM-DD
  reason?: string;
  note?: string;
}

export interface BulkAbsenceRequest {
  employeeIds: number[];
  date: string;            // YYYY-MM-DD
  reason?: string;
  note?: string;
}

export interface BulkUnmarkRequest {
  employeeIds: number[];
  date: string;            // YYYY-MM-DD
}

export interface AttendanceSummaryDTO {
  sousTraitantId: number;
  sousTraitantCodeUsine : string; 
  sousTraitantName : string ; 
  date: string;
  effectifActif: number;
  absents: number;
  presents: number;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private baseUrl = `${environment.apiUrl}attendance`;

  constructor(private http: HttpClient) {}

  getDailySummary(sousTraitantId: number, date: string): Observable<AttendanceSummaryDTO> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AttendanceSummaryDTO>(`${this.baseUrl}/summary/${sousTraitantId}`, { params });
  }

  listAbsences(sousTraitantId: number, date: string): Observable<Absence[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Absence[]>(`${this.baseUrl}/absences/${sousTraitantId}`, { params });
  }

  listPresents(sousTraitantId: number, date: string): Observable<Employee[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Employee[]>(`${this.baseUrl}/presents/${sousTraitantId}`, { params });
  }

  markAbsent(payload: AbsenceRequest, xUser?: string) {
    const headers = xUser ? new HttpHeaders({ 'X-User': xUser }) : undefined;
    return this.http.post<Absence>(`${this.baseUrl}/absences`, payload, { headers });
  }

  unmarkAbsent(employeeId: number, date: string) {
    const params = new HttpParams().set('date', date);
    return this.http.delete<void>(`${this.baseUrl}/absences/${employeeId}`, { params });
  }

  markAbsentBulk(payload: BulkAbsenceRequest, xUser?: string) {
    const headers = xUser ? new HttpHeaders({ 'X-User': xUser }) : undefined;
    return this.http.post<Absence[]>(`${this.baseUrl}/absences/bulk`, payload, { headers });
  }
  listAbsencesBySousTraitant(sousTraitantId: number, date: string): Observable<Absence[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<Absence[]>(`${this.baseUrl}/sous-traitant/${sousTraitantId}`, { params });
  }
  
  unmarkAbsentBulk(payload: BulkUnmarkRequest) {
    return this.http.delete<void>(`${this.baseUrl}/absences/bulk`, { body: payload });
  }
}
