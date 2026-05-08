import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { ProjectPriority } from "../../models/projects/project-params.model";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class ProjectPriorityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/project-priorities`;

  findAll(p: PageableQuery = {}): Observable<ApiResponse<APIPage<ProjectPriority>>> {
    return this.http.get<ApiResponse<APIPage<ProjectPriority>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  create(name: string, scale: number): Observable<ApiResponse<ProjectPriority>> {
    return this.http.post<ApiResponse<ProjectPriority>>(this.apiUrl, { name, scale });
  }

  update(id: number, name: string, scale: number): Observable<ApiResponse<ProjectPriority>> {
    return this.http.put<ApiResponse<ProjectPriority>>(`${this.apiUrl}/${id}`, { name, scale });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
