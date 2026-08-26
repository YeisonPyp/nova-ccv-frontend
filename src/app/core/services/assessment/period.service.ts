import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  PageableQuery,
  PageableQueryParams,
} from '../../../shared/pageable-query';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';
import { EvaluationPeriod } from '../../models/assessment/period.model';
import { HttpClient } from '@angular/common/http';

export interface EvaluationPeriodPageableQuery extends PageableQuery {
  name?: string;
}

type EditPeriodDto = Partial<EvaluationPeriod>;

@Injectable({
  providedIn: 'root',
})
export class PeriodService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment-period/`;

  findById(id: number): Observable<ApiResponse<EvaluationPeriod>> {
    return this.http.get<ApiResponse<EvaluationPeriod>>(this.API_URL + id);
  }

  findPeriods(
    query: EvaluationPeriodPageableQuery,
  ): Observable<ApiResponse<APIPage<EvaluationPeriod>>> {
    return this.http.get<ApiResponse<APIPage<EvaluationPeriod>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  findPeriodsWithMetrics(
    query: EvaluationPeriodPageableQuery,
  ): Observable<ApiResponse<APIPage<EvaluationPeriod>>> {
    const url = `${environment.apiUrl}/assessment-period-with-metrics`;
    return this.http.get<ApiResponse<APIPage<EvaluationPeriod>>>(url, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  createPeriod(dto: EditPeriodDto): Observable<ApiResponse<EvaluationPeriod>> {
    return this.http.post<ApiResponse<EvaluationPeriod>>(this.API_URL, dto);
  }

  updatePeriod(
    id: number,
    dto: EditPeriodDto,
  ): Observable<ApiResponse<EvaluationPeriod>> {
    return this.http.put<ApiResponse<EvaluationPeriod>>(
      `${this.API_URL}/${id}`,
      dto,
    );
  }

  deletePeriod(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
