import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface AssessmentConfig {
  id: number;
  evaluationWindow: string;
  periodCreationInterval: string;
  updatedAt?: string;
}

export interface UpdateAssessmentConfigDto {
  evaluationWindow: string;
  periodCreationInterval: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentConfigService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/assessment-config`;

  get(): Observable<ApiResponse<AssessmentConfig>> {
    return this.http.get<ApiResponse<AssessmentConfig>>(this.apiUrl);
  }

  update(
    dto: UpdateAssessmentConfigDto,
  ): Observable<ApiResponse<AssessmentConfig>> {
    return this.http.put<ApiResponse<AssessmentConfig>>(this.apiUrl, dto);
  }
}
