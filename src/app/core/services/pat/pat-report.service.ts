import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  AreaBudgetSummary,
  MonthlyBudgetTotals,
  PatActivityReportResponse,
} from '../../models/pat/pat-report-models';

@Injectable({ providedIn: 'root' })
export class PatReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/reports`;

  findAreaBudgetSummary(
    areaId?: number | null,
    year?: number | null,
  ): Observable<ApiResponse<AreaBudgetSummary[]>> {
    const params: Record<string, number> = {};
    if (areaId != null) params['areaId'] = areaId;
    if (year != null) params['year'] = year;
    return this.http.get<ApiResponse<AreaBudgetSummary[]>>(
      `${this.baseUrl}/area-budget-summary`,
      { params },
    );
  }

  findMonthlyBudgetTotals(
    year?: number | null,
    areaId?: number | null,
  ): Observable<ApiResponse<MonthlyBudgetTotals[]>> {
    const params: Record<string, number> = {};
    if (areaId != null) params['areaId'] = areaId;
    if (year != null) params['year'] = year;
    return this.http.get<ApiResponse<MonthlyBudgetTotals[]>>(
      `${this.baseUrl}/monthly-budget-totals`,
      { params },
    );
  }

  findActivityReport(
    areaId?: number | null,
    year?: number | null,
  ): Observable<ApiResponse<PatActivityReportResponse>> {
    const params: Record<string, number> = {};
    if (areaId != null) params['areaId'] = areaId;
    if (year != null) params['year'] = year;
    return this.http.get<ApiResponse<PatActivityReportResponse>>(
      `${this.baseUrl}/activities`,
      { params },
    );
  }
}
