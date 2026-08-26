import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { PatActivityProduct, PatActivityProductSummary } from '../../models/pat/pat-models';

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
  ): Observable<ApiResponse<PatActivityProductSummary[]>> {
    return this.http.get<ApiResponse<PatActivityProductSummary[]>>(
      `${this.baseUrl}/activities/${activityId}/products`,
    );
  }

  findByTask(taskId: number): Observable<ApiResponse<PatActivityProduct[]>> {
    return this.http.get<ApiResponse<PatActivityProduct[]>>(
      `${this.baseUrl}/tasks/${taskId}/products`,
    );
  }

  create(
    taskId: number,
    dto: CreatePatActivityProductDto,
  ): Observable<ApiResponse<PatActivityProduct>> {
    return this.http.post<ApiResponse<PatActivityProduct>>(
      `${this.baseUrl}/tasks/${taskId}/products`,
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
}
