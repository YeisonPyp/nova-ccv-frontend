import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { PatActivityBenefit } from '../../models/pat/pat-models';

export interface CreatePatActivityBenefitDto {
  benefitTypeId: number;
  targetValue?: number | null;
}

export interface UpdatePatActivityBenefitDto {
  benefitTypeId?: number;
  targetValue?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityBenefitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2`;

  findByActivity(
    activityId: number,
  ): Observable<ApiResponse<PatActivityBenefit[]>> {
    return this.http.get<ApiResponse<PatActivityBenefit[]>>(
      `${this.baseUrl}/activities/${activityId}/benefits`,
    );
  }

  create(
    activityId: number,
    dto: CreatePatActivityBenefitDto,
  ): Observable<ApiResponse<PatActivityBenefit>> {
    return this.http.post<ApiResponse<PatActivityBenefit>>(
      `${this.baseUrl}/activities/${activityId}/benefits`,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdatePatActivityBenefitDto,
  ): Observable<ApiResponse<PatActivityBenefit>> {
    return this.http.put<ApiResponse<PatActivityBenefit>>(
      `${this.baseUrl}/benefits/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/benefits/${id}`,
    );
  }
}
