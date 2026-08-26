import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityTaskIndicatorExecution,
  PatActivityTaskIndicatorMonthlyPlan,
} from '../../models/pat/pat-models';

export interface UpsertPatActivityTaskIndicatorMonthlyPlanDto {
  activityIndicatorId: number;
  month: number;
  plannedValue: number;
}

export interface UpsertPatActivityTaskIndicatorExecutionDto {
  activityIndicatorId: number;
  month: number;
  executedValue: number;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskIndicatorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findPlan(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskIndicatorMonthlyPlan[]>> {
    return this.http.get<ApiResponse<PatActivityTaskIndicatorMonthlyPlan[]>>(
      `${this.baseUrl}/${taskId}/indicator-plan`,
    );
  }

  upsertPlan(
    taskId: number,
    dto: UpsertPatActivityTaskIndicatorMonthlyPlanDto,
  ): Observable<ApiResponse<PatActivityTaskIndicatorMonthlyPlan>> {
    return this.http.put<ApiResponse<PatActivityTaskIndicatorMonthlyPlan>>(
      `${this.baseUrl}/${taskId}/indicator-plan`,
      dto,
    );
  }

  findExecution(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskIndicatorExecution[]>> {
    return this.http.get<ApiResponse<PatActivityTaskIndicatorExecution[]>>(
      `${this.baseUrl}/${taskId}/indicator-execution`,
    );
  }

  upsertExecution(
    taskId: number,
    dto: UpsertPatActivityTaskIndicatorExecutionDto,
  ): Observable<ApiResponse<PatActivityTaskIndicatorExecution>> {
    return this.http.put<ApiResponse<PatActivityTaskIndicatorExecution>>(
      `${this.baseUrl}/${taskId}/indicator-execution`,
      dto,
    );
  }
}
