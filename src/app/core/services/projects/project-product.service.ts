import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface ProjectProduct {
  id: number;
  projectId: number;
  projectName?: string;
  projectYear?: number;
  code: string;
  name: string;
  description?: string;
  targetQuantity: number;
  unitMeasure: string;
  createdAt: string;
}

export interface CreateProjectProductDto {
  projectId: number;
  code: string;
  name: string;
  description?: string;
  targetQuantity: number;
  unitMeasure: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/project-products`;

  findByProject(projectId: number): Observable<ApiResponse<ProjectProduct[]>> {
    return this.http.get<ApiResponse<ProjectProduct[]>>(this.apiUrl, {
      params: new HttpParams().set('projectId', projectId),
    });
  }

  findByYear(year: number): Observable<ApiResponse<ProjectProduct[]>> {
    return this.http.get<ApiResponse<ProjectProduct[]>>(this.apiUrl, {
      params: new HttpParams().set('year', year),
    });
  }

  create(
    dto: CreateProjectProductDto,
  ): Observable<ApiResponse<ProjectProduct>> {
    return this.http.post<ApiResponse<ProjectProduct>>(this.apiUrl, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
