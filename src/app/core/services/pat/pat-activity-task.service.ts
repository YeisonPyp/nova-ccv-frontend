import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityBudgetMatrix,
  PatActivityTask,
} from '../../models/pat/pat-models';
import { APIPage } from '../../models/api-page.model';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';

export interface CreatePatActivityTaskDto {
  name: string;
  areaId: number;
  costCenterId: number;
  unitMeasureId: number;
  unitMeasureGoal: number;
  pillarId?: number | null;
  adendaId?: number | null;
  policyId?: number | null;
  description?: string | null;
}

export interface UpdatePatActivityTaskDto {
  name?: string;
  areaId?: number;
  costCenterId?: number;
  unitMeasureId?: number | null;
  unitMeasureGoal?: number | null;
  pillarId?: number | null;
  programId?: number | null;
  policyId?: number | null;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2`;

  findByActivity(
    activityId: number,
  ): Observable<ApiResponse<PatActivityTask[]>> {
    return this.http.get<ApiResponse<PatActivityTask[]>>(
      `${this.baseUrl}/activities/${activityId}/tasks`,
    );
  }

  findById(id: number): Observable<ApiResponse<PatActivityTask>> {
    return this.http.get<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/tasks/${id}`,
    );
  }

  findByYearAndArea(
    year: number,
    areaId: number,
  ): Observable<ApiResponse<PatActivityTask[]>> {
    return this.http.get<ApiResponse<PatActivityTask[]>>(
      `${this.baseUrl}/tasks`,
      { params: { year, areaId } },
    );
  }

  search(
    query: PageableQuery,
    year: number,
    areaId?: number | null,
  ): Observable<ApiResponse<APIPage<PatActivityTask>>> {
    const params = new PageableQueryParams(query).getParams();
    params['year'] = year;
    if (areaId != null) params['areaId'] = areaId;
    return this.http.get<ApiResponse<APIPage<PatActivityTask>>>(
      `${this.baseUrl}/tasks/search`,
      { params },
    );
  }

  create(
    activityId: number,
    dto: CreatePatActivityTaskDto,
  ): Observable<ApiResponse<PatActivityTask>> {
    return this.http.post<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/activities/${activityId}/tasks`,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdatePatActivityTaskDto,
  ): Observable<ApiResponse<PatActivityTask>> {
    return this.http.put<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/tasks/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/tasks/${id}`);
  }

  findPresupuestalMatrix(
    taskId: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix[]>> {
    return this.http.get<ApiResponse<PatActivityBudgetMatrix[]>>(
      `${this.baseUrl}/tasks/${taskId}/presupuestal-matrix`,
    );
  }

  saveBudgetMatrix(
    taskId: number,
    budgetCategoryId: number,
    amount: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix>> {
    return this.http.post<ApiResponse<PatActivityBudgetMatrix>>(
      `${this.baseUrl}/tasks/${taskId}/presupuestal-matrix`,
      { budgetCategoryId, amount },
    );
  }
}
