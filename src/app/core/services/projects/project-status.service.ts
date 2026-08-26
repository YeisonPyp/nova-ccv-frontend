import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { ProjectStatus } from '../../models/projects/project-params.model';

@Injectable({ providedIn: 'root' })
export class ProjectStatusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/project-statuses`;

  findAll(): Observable<ApiResponse<Array<ProjectStatus>>> {
    return this.http.get<ApiResponse<Array<ProjectStatus>>>(this.apiUrl);
  }

  create(name: string): Observable<ApiResponse<ProjectStatus>> {
    return this.http.post<ApiResponse<ProjectStatus>>(this.apiUrl, { name });
  }

  update(id: number, name: string): Observable<ApiResponse<ProjectStatus>> {
    return this.http.put<ApiResponse<ProjectStatus>>(`${this.apiUrl}/${id}`, {
      name,
    });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
