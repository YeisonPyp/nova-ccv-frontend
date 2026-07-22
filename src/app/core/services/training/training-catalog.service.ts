import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

/** Name-only training catalog item (topic, modality, priority, type, status…). */
export interface TrainingCatalog {
  id: number;
  name: string;
}

export interface TrainingCatalogDto {
  name: string;
}

/**
 * Generic client for every name-only training catalog. The concrete catalog is
 * selected via the `path` argument (e.g. "training-topics").
 */
@Injectable({ providedIn: 'root' })
export class TrainingCatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list(path: string): Observable<ApiResponse<TrainingCatalog[]>> {
    return this.http.get<ApiResponse<TrainingCatalog[]>>(`${this.base}/${path}`);
  }

  create(
    path: string,
    dto: TrainingCatalogDto,
  ): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.post<ApiResponse<TrainingCatalog>>(
      `${this.base}/${path}`,
      dto,
    );
  }

  update(
    path: string,
    id: number,
    dto: TrainingCatalogDto,
  ): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.put<ApiResponse<TrainingCatalog>>(
      `${this.base}/${path}/${id}`,
      dto,
    );
  }

  delete(path: string, id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${path}/${id}`);
  }
}
