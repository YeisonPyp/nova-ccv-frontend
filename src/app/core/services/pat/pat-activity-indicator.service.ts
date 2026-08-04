import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityIndicator,
  PatActivityIndicatorExecution,
  PatActivityIndicatorMonthlyPlan,
} from '../../models/pat/pat-models';

export interface CreatePatActivityIndicatorDto {
  name: string;
  description?: string;
  unitMeasure?: string;
  targetValue?: number | null;
}

export interface UpdatePatActivityIndicatorDto {
  name?: string;
  description?: string;
  unitMeasure?: string;
  targetValue?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityIndicatorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2`;

  findByActivity(
    activityId: number,
  ): Observable<ApiResponse<PatActivityIndicator[]>> {
    return this.http.get<ApiResponse<PatActivityIndicator[]>>(
      `${this.baseUrl}/activities/${activityId}/indicators`,
    );
  }

  create(
    activityId: number,
    dto: CreatePatActivityIndicatorDto,
  ): Observable<ApiResponse<PatActivityIndicator>> {
    return this.http.post<ApiResponse<PatActivityIndicator>>(
      `${this.baseUrl}/activities/${activityId}/indicators`,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdatePatActivityIndicatorDto,
  ): Observable<ApiResponse<PatActivityIndicator>> {
    return this.http.put<ApiResponse<PatActivityIndicator>>(
      `${this.baseUrl}/indicators/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/indicators/${id}`,
    );
  }

  findMonthlyPlan(
    id: number,
  ): Observable<ApiResponse<PatActivityIndicatorMonthlyPlan[]>> {
    return this.http.get<ApiResponse<PatActivityIndicatorMonthlyPlan[]>>(
      `${this.baseUrl}/indicators/${id}/monthly-plan`,
    );
  }

  upsertMonthlyPlan(
    id: number,
    month: number,
    plannedValue: number,
  ): Observable<ApiResponse<PatActivityIndicatorMonthlyPlan>> {
    return this.http.put<ApiResponse<PatActivityIndicatorMonthlyPlan>>(
      `${this.baseUrl}/indicators/${id}/monthly-plan`,
      { month, plannedValue },
    );
  }

  findExecution(
    id: number,
  ): Observable<ApiResponse<PatActivityIndicatorExecution[]>> {
    return this.http.get<ApiResponse<PatActivityIndicatorExecution[]>>(
      `${this.baseUrl}/indicators/${id}/execution`,
    );
  }

  upsertExecution(
    id: number,
    month: number,
    executedValue: number,
    description?: string,
  ): Observable<ApiResponse<PatActivityIndicatorExecution>> {
    return this.http.put<ApiResponse<PatActivityIndicatorExecution>>(
      `${this.baseUrl}/indicators/${id}/execution`,
      { month, executedValue, description },
    );
  }
}
