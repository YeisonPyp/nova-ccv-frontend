// src/app/services/pat/program.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Program, 
  ProgramWithMetrics, 
  CreateProgramRequest, 
  UpdateProgramRequest 
} from '../models/program.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/pat/programs`;

  getAllPrograms(anio?: number): Observable<ApiResponse<Program[]>> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    return this.http.get<ApiResponse<Program[]>>(this.apiUrl, { params });
  }

  getProgramsWithMetrics(anio?: number): Observable<ApiResponse<ProgramWithMetrics[]>> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    return this.http.get<ApiResponse<ProgramWithMetrics[]>>(
      `${this.apiUrl}/with-metrics`, 
      { params }
    );
  }

  getProgramById(id: number): Observable<ApiResponse<Program>> {
    return this.http.get<ApiResponse<Program>>(`${this.apiUrl}/${id}`);
  }

  getProgramWithMetrics(id: number): Observable<ApiResponse<ProgramWithMetrics>> {
    return this.http.get<ApiResponse<ProgramWithMetrics>>(
      `${this.apiUrl}/${id}/with-metrics`
    );
  }

  createProgram(request: CreateProgramRequest): Observable<ApiResponse<Program>> {
    return this.http.post<ApiResponse<Program>>(this.apiUrl, request);
  }

  updateProgram(id: number, request: UpdateProgramRequest): Observable<ApiResponse<Program>> {
    return this.http.put<ApiResponse<Program>>(`${this.apiUrl}/${id}`, request);
  }

  deleteProgram(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}