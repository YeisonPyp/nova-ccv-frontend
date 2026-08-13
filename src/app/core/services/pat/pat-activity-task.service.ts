import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { PatActivityTask } from '../../models/pat/pat-models';

export interface CreatePatActivityTaskDto {
  name: string;
  areaId: number;
  costCenterId: number;
  pillarId?: number | null;
  programId?: number | null;
  policyId?: number | null;
  description?: string | null;
}

export interface UpdatePatActivityTaskDto {
  name?: string;
  areaId?: number;
  costCenterId?: number;
  pillarId?: number | null;
  programId?: number | null;
  policyId?: number | null;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PatActivityTaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2`;

  findByActivity(
    activityId: number,
  ): Observable<ApiResponse<PatActivityTask[]>> {
    return this.http.get<ApiResponse<PatActivityTask[]>>(
      `${this.baseUrl}/activities/${activityId}/tasks`,
    );
  }

  findById(id: number): Observable<ApiResponse<PatActivityTask>> {
    return this.http.get<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/tasks/${id}`,
    );
  }

  create(
    activityId: number,
    dto: CreatePatActivityTaskDto,
  ): Observable<ApiResponse<PatActivityTask>> {
    return this.http.post<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/activities/${activityId}/tasks`,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdatePatActivityTaskDto,
  ): Observable<ApiResponse<PatActivityTask>> {
    return this.http.put<ApiResponse<PatActivityTask>>(
      `${this.baseUrl}/tasks/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/tasks/${id}`);
  }
}
