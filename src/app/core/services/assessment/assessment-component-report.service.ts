import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  AssessmentComponentReport,
  AssessmentComponentReportSupport,
  AssessmentComponentReportSupportFile,
} from '../../models/assessment/assessment.model';

export interface CreateAssessmentComponentReportSupportDto {
  reportId: number;
  requirementId: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentComponentReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/assessment/reports`;

  findMy(): Observable<ApiResponse<AssessmentComponentReport[]>> {
    return this.http.get<ApiResponse<AssessmentComponentReport[]>>(
      `${this.baseUrl}/my`,
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AssessmentComponentReportSupportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/assessment/report-supports`;

  create(
    dto: CreateAssessmentComponentReportSupportDto,
  ): Observable<ApiResponse<AssessmentComponentReportSupport>> {
    return this.http.post<ApiResponse<AssessmentComponentReportSupport>>(
      this.baseUrl,
      dto,
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AssessmentComponentReportSupportFileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/assessment/report-support-files`;

  create(
    supportId: number,
    file: File,
  ): Observable<ApiResponse<AssessmentComponentReportSupportFile>> {
    const formData = new FormData();
    formData.append('supportId', supportId.toString());
    formData.append('file', file);
    return this.http.post<ApiResponse<AssessmentComponentReportSupportFile>>(
      this.baseUrl,
      formData,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
