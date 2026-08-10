import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityTaskBenefitExecution,
  PatActivityTaskBenefitMonthlyPlan,
} from '../../models/pat/pat-models';

export interface UpsertPatActivityTaskBenefitMonthlyPlanDto {
  benefitId: number;
  month: number;
  plannedValue: number;
}

export interface UpsertPatActivityTaskBenefitExecutionDto {
  benefitId: number;
  month: number;
  executedValue: number;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskBenefitMonthlyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findPlan(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskBenefitMonthlyPlan[]>> {
    return this.http.get<ApiResponse<PatActivityTaskBenefitMonthlyPlan[]>>(
      `${this.baseUrl}/${taskId}/benefit-plan`,
    );
  }

  upsertPlan(
    taskId: number,
    dto: UpsertPatActivityTaskBenefitMonthlyPlanDto,
  ): Observable<ApiResponse<PatActivityTaskBenefitMonthlyPlan>> {
    return this.http.put<ApiResponse<PatActivityTaskBenefitMonthlyPlan>>(
      `${this.baseUrl}/${taskId}/benefit-plan`,
      dto,
    );
  }

  findExecution(
    taskId: number,
  ): Observable<ApiResponse<PatActivityTaskBenefitExecution[]>> {
    return this.http.get<ApiResponse<PatActivityTaskBenefitExecution[]>>(
      `${this.baseUrl}/${taskId}/benefit-execution`,
    );
  }

  upsertExecution(
    taskId: number,
    dto: UpsertPatActivityTaskBenefitExecutionDto,
  ): Observable<ApiResponse<PatActivityTaskBenefitExecution>> {
    return this.http.put<ApiResponse<PatActivityTaskBenefitExecution>>(
      `${this.baseUrl}/${taskId}/benefit-execution`,
      dto,
    );
  }
}
