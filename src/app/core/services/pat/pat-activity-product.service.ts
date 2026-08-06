import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatActivityProduct,
  PatActivityProductExecution,
  PatActivityProductMonthlyPlan,
} from '../../models/pat/pat-models';

export interface CreatePatActivityProductDto {
  productId: number;
  targetQuantity: number;
  unitMeasureId?: number | null;
}

export interface UpdatePatActivityProductDto {
  productId?: number;
  targetQuantity?: number;
  unitMeasureId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2`;

  findByActivity(
    activityId: number,
  ): Observable<ApiResponse<PatActivityProduct[]>> {
    return this.http.get<ApiResponse<PatActivityProduct[]>>(
      `${this.baseUrl}/activities/${activityId}/products`,
    );
  }

  create(
    activityId: number,
    dto: CreatePatActivityProductDto,
  ): Observable<ApiResponse<PatActivityProduct>> {
    return this.http.post<ApiResponse<PatActivityProduct>>(
      `${this.baseUrl}/activities/${activityId}/products`,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdatePatActivityProductDto,
  ): Observable<ApiResponse<PatActivityProduct>> {
    return this.http.put<ApiResponse<PatActivityProduct>>(
      `${this.baseUrl}/products/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/products/${id}`,
    );
  }

  findMonthlyPlan(
    id: number,
  ): Observable<ApiResponse<PatActivityProductMonthlyPlan[]>> {
    return this.http.get<ApiResponse<PatActivityProductMonthlyPlan[]>>(
      `${this.baseUrl}/products/${id}/monthly-plan`,
    );
  }

  upsertMonthlyPlan(
    id: number,
    month: number,
    plannedQuantity: number,
  ): Observable<ApiResponse<PatActivityProductMonthlyPlan>> {
    return this.http.put<ApiResponse<PatActivityProductMonthlyPlan>>(
      `${this.baseUrl}/products/${id}/monthly-plan`,
      { month, plannedQuantity },
    );
  }

  findExecution(
    id: number,
  ): Observable<ApiResponse<PatActivityProductExecution[]>> {
    return this.http.get<ApiResponse<PatActivityProductExecution[]>>(
      `${this.baseUrl}/products/${id}/execution`,
    );
  }

  upsertExecution(
    id: number,
    month: number,
    executedQuantity: number,
    description?: string,
  ): Observable<ApiResponse<PatActivityProductExecution>> {
    return this.http.put<ApiResponse<PatActivityProductExecution>>(
      `${this.baseUrl}/products/${id}/execution`,
      { month, executedQuantity, description },
    );
  }
}
