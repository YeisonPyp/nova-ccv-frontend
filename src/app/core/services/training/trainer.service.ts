import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface Trainer {
  id: number;
  name: string;
  lastname: string;
  employeeId?: number | null;
  employeeName?: string | null;
  employeeLastName?: string | null;
}

export interface CreateTrainerDto {
  name: string;
  lastname: string;
  employeeId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TrainerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/trainers`;

  list(): Observable<ApiResponse<Trainer[]>> {
    return this.http.get<ApiResponse<Trainer[]>>(this.apiUrl);
  }

  create(dto: CreateTrainerDto): Observable<ApiResponse<Trainer>> {
    return this.http.post<ApiResponse<Trainer>>(this.apiUrl, dto);
  }

  update(id: number, dto: CreateTrainerDto): Observable<ApiResponse<Trainer>> {
    return this.http.put<ApiResponse<Trainer>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
