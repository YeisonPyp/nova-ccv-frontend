import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { APIPage } from '../../models/api-page.model';
import { Assessment } from '../../models/assessment/assessment.model';
import { ApiResponse } from '../../models/api-response.model';
import { Observable } from 'rxjs';
import {
  PageableQuery,
  PageableQueryParams,
} from '../../../shared/pageable-query';
import { EditAssesmentDto } from '../../../features/assessment/pages/edit-assessment-modal/edit-assessment-modal.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AreaAssessmentStats,
  AssessmentsAnnualStats,
} from '../../models/assessment/assessment-metrics.model';

export interface AssessmentPageableQuery extends PageableQuery {
  status?: string | null;
  periodId?: number;
}

export interface AssessmentStatus {
  periodId: number;
  status: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment`;

  findById(id: number) {
    return this.http.get<ApiResponse<Assessment>>(`${this.API_URL}/${id}`);
  }

  findAssessments(
    query: AssessmentPageableQuery,
  ): Observable<ApiResponse<APIPage<Assessment>>> {
    return this.http.get<ApiResponse<APIPage<Assessment>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  updateAssessment(
    data: EditAssesmentDto,
  ): Observable<ApiResponse<Assessment>> {
    return this.http.patch<ApiResponse<Assessment>>(
      `${this.API_URL}/${data.id}`,
      data,
    );
  }

  findAssessmentStatuses(
    periodId: number,
  ): Observable<ApiResponse<AssessmentStatus[]>> {
    return this.http.get<ApiResponse<AssessmentStatus[]>>(
      `${this.API_URL}/period-status/${periodId}`,
    );
  }

  findAssessmentYearMetrics(
    status: string | null,
  ): Observable<ApiResponse<AssessmentsAnnualStats>> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    return this.http.get<ApiResponse<AssessmentsAnnualStats>>(
      `${this.API_URL}/metrics`,
      { params },
    );
  }

  findAssessmentAreaMetrics(
    year: number,
    status?: string,
  ): Observable<ApiResponse<Array<AreaAssessmentStats>>> {
    const params: Record<string, any> = {};
    if (status) params['status'] = status;
    params['year'] = year.toString();

    return this.http.get<ApiResponse<Array<AreaAssessmentStats>>>(
      `${this.API_URL}/area-stats`,
      { params },
    );
  }
}
