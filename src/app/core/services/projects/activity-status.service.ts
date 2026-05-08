import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { ActivityStatus } from "../../models/projects/project-params.model";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class ActivityStatusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/activity-statuses`;

  findAll(p: PageableQuery = {}): Observable<ApiResponse<APIPage<ActivityStatus>>> {
    return this.http.get<ApiResponse<APIPage<ActivityStatus>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  create(name: string): Observable<ApiResponse<ActivityStatus>> {
    return this.http.post<ApiResponse<ActivityStatus>>(this.apiUrl, { name });
  }

  update(id: number, name: string): Observable<ApiResponse<ActivityStatus>> {
    return this.http.put<ApiResponse<ActivityStatus>>(`${this.apiUrl}/${id}`, { name });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
