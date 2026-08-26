import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ProjectPriority } from "../../models/projects/project-params.model";

@Injectable({ providedIn: "root" })
export class ProjectPriorityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/project-priorities`;

  findAll(): Observable<ApiResponse<ProjectPriority[]>> {
    return this.http.get<ApiResponse<ProjectPriority[]>>(this.apiUrl);
  }

  create(
    name: string,
    scale: number,
  ): Observable<ApiResponse<ProjectPriority>> {
    return this.http.post<ApiResponse<ProjectPriority>>(this.apiUrl, {
      name,
      scale,
    });
  }

  update(
    id: number,
    name: string,
    scale: number,
  ): Observable<ApiResponse<ProjectPriority>> {
    return this.http.put<ApiResponse<ProjectPriority>>(`${this.apiUrl}/${id}`, {
      name,
      scale,
    });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
