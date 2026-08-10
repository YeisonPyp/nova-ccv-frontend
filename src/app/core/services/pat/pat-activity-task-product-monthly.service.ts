import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityTaskProductExecution,
  PatActivityTaskProductMonthlyPlan,
} from '../../models/pat/pat-models';

export interface UpsertPatActivityTaskProductMonthlyPlanDto {
  productId: number;
  month: number;
  plannedQuantity: number;
}

export interface UpsertPatActivityTaskProductExecutionDto {
  productId: number;
  month: number;
  executedQuantity: number;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskProductMonthlyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findPlan(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskProductMonthlyPlan[]>> {
    return this.http.get<ApiResponse<PatActivityTaskProductMonthlyPlan[]>>(
      `${this.baseUrl}/${taskId}/product-plan`,
    );
  }

  upsertPlan(
    taskId: number,
    dto: UpsertPatActivityTaskProductMonthlyPlanDto,
  ): Observable<ApiResponse<PatActivityTaskProductMonthlyPlan>> {
    return this.http.put<ApiResponse<PatActivityTaskProductMonthlyPlan>>(
      `${this.baseUrl}/${taskId}/product-plan`,
      dto,
    );
  }

  findExecution(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskProductExecution[]>> {
    return this.http.get<ApiResponse<PatActivityTaskProductExecution[]>>(
      `${this.baseUrl}/${taskId}/product-execution`,
    );
  }

  upsertExecution(
    taskId: number,
    dto: UpsertPatActivityTaskProductExecutionDto,
  ): Observable<ApiResponse<PatActivityTaskProductExecution>> {
    return this.http.put<ApiResponse<PatActivityTaskProductExecution>>(
      `${this.baseUrl}/${taskId}/product-execution`,
      dto,
    );
  }
}
