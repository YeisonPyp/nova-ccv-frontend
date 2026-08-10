import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityTaskBudgetExecution,
  PatActivityTaskBudgetPlan,
} from '../../models/pat/pat-models';

export interface UpsertPatActivityTaskBudgetPlanDto {
  presupuestalCategoryId: number;
  month: number;
  plannedAmount: number;
}

export interface UpsertPatActivityTaskBudgetExecutionDto {
  presupuestalCategoryId: number;
  month: number;
  amount: number;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskBudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findPlan(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskBudgetPlan[]>> {
    return this.http.get<ApiResponse<PatActivityTaskBudgetPlan[]>>(
      `${this.baseUrl}/${taskId}/budget-plan`,
    );
  }

  upsertPlan(
    taskId: number,
    dto: UpsertPatActivityTaskBudgetPlanDto,
  ): Observable<ApiResponse<PatActivityTaskBudgetPlan>> {
    return this.http.put<ApiResponse<PatActivityTaskBudgetPlan>>(
      `${this.baseUrl}/${taskId}/budget-plan`,
      dto,
    );
  }

  findExecution(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskBudgetExecution[]>> {
    return this.http.get<ApiResponse<PatActivityTaskBudgetExecution[]>>(
      `${this.baseUrl}/${taskId}/budget-execution`,
    );
  }

  upsertExecution(
    taskId: number,
    dto: UpsertPatActivityTaskBudgetExecutionDto,
  ): Observable<ApiResponse<PatActivityTaskBudgetExecution>> {
    return this.http.put<ApiResponse<PatActivityTaskBudgetExecution>>(
      `${this.baseUrl}/${taskId}/budget-execution`,
      dto,
    );
  }
}
