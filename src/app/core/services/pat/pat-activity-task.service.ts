import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

export interface FindTasksPageableQuery extends PageableQuery {
  year: number;
  programId?: number | null;
  areaId?: number | null;
  /**
   * Cut-off dates (yyyy-MM-dd): keep only tasks holding budget planning in the
   * covered months.
   */
  since?: string | null;
  before?: string | null;
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

  findAll(
    query: FindTasksPageableQuery,
  ): Observable<ApiResponse<APIPage<PatActivityTask>>> {
    const params = new PageableQueryParams(query).getParams();
    return this.http.get<ApiResponse<APIPage<PatActivityTask>>>(
      `${this.baseUrl}/tasks`,
      { params },
    );
  }

  /**
   * Paginated + RSQL-searchable listing, optionally narrowed by year/area.
   * Thin wrapper over {@link findAll} for the dashboard tables.
   */
  search(
    query: PageableQuery,
    year: number,
    areaId?: number | null,
    since?: string | null,
    before?: string | null,
  ): Observable<ApiResponse<APIPage<PatActivityTask>>> {
    return this.findAll({ ...query, year, areaId, since, before });
  }

  /** Every task of an area for a year, unpaginated (used by task selectors). */
  findByYearAndArea(
    year: number,
    areaId: number,
  ): Observable<ApiResponse<PatActivityTask[]>> {
    return this.findAll({ year, areaId, page: 0, size: 500 }).pipe(
      map((res) => ({ ...res, data: res.data?.content ?? [] })),
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
