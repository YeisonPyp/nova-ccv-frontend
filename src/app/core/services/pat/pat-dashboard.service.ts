import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatDashboardBudget,
  PatDashboardFilters,
  PatDashboardIndicator,
} from '../../models/pat/pat-dashboard.models';
import {
  PatActivityTask,
  PatStrategicProgram,
} from '../../models/pat/pat-models';

@Injectable({ providedIn: 'root' })
export class PatDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/dashboard`;

  private toParams(f: PatDashboardFilters): HttpParams {
    let params = new HttpParams();
    if (f.year != null) params = params.set('year', f.year);
    if (f.areaId != null) params = params.set('areaId', f.areaId);
    if (f.programId != null) params = params.set('programId', f.programId);
    for (const id of f.taskIds ?? []) {
      params = params.append('taskIds', id);
    }
    return params;
  }

  findBudget(
    filters: PatDashboardFilters,
  ): Observable<ApiResponse<PatDashboardBudget>> {
    return this.http.get<ApiResponse<PatDashboardBudget>>(
      `${this.baseUrl}/budget`,
      { params: this.toParams(filters) },
    );
  }

  findIndicators(
    filters: PatDashboardFilters,
  ): Observable<ApiResponse<PatDashboardIndicator[]>> {
    return this.http.get<ApiResponse<PatDashboardIndicator[]>>(
      `${this.baseUrl}/indicators`,
      { params: this.toParams(filters) },
    );
  }

  findPrograms(
    filters: PatDashboardFilters,
  ): Observable<ApiResponse<PatStrategicProgram[]>> {
    return this.http.get<ApiResponse<PatStrategicProgram[]>>(
      `${this.baseUrl}/programs`,
      { params: this.toParams({ year: filters.year, areaId: filters.areaId }) },
    );
  }

  findTasks(
    filters: PatDashboardFilters,
  ): Observable<ApiResponse<PatActivityTask[]>> {
    return this.http.get<ApiResponse<PatActivityTask[]>>(
      `${this.baseUrl}/tasks`,
      {
        params: this.toParams({
          year: filters.year,
          areaId: filters.areaId,
          programId: filters.programId,
        }),
      },
    );
  }
}
