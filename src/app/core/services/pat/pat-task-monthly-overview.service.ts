import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  ExecutionOrPlaning,
  RegisterMonthlyOverview,
  RegisterMonthlyOverviewPage,
} from '../../models/pat/pat-models';

@Injectable({ providedIn: 'root' })
export class PatTaskMonthlyOverviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findOverview(
    taskId: number,
  ): Observable<ApiResponse<ExecutionOrPlaning[]>> {
    return this.http.get<ApiResponse<ExecutionOrPlaning[]>>(
      `${this.baseUrl}/${taskId}/monthly-overview`,
    );
  }

  findRegisterPage(
    taskId: number,
    month: number,
  ): Observable<ApiResponse<RegisterMonthlyOverviewPage>> {
    return this.http.get<ApiResponse<RegisterMonthlyOverviewPage>>(
      `${this.baseUrl}/${taskId}/register/${month}`,
    );
  }

  registerMonth(
    taskId: number,
    dto: RegisterMonthlyOverview,
  ): Observable<ApiResponse<ExecutionOrPlaning>> {
    return this.http.put<ApiResponse<ExecutionOrPlaning>>(
      `${this.baseUrl}/${taskId}/register`,
      dto,
    );
  }
}
