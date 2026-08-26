import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { PermissionResponse } from "../../models/user/permission.model";
import { APIPage } from "../../models/api-page.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "@/app/shared/pageable-query";

/** Filters of the paginated permission listing. */
export interface PermissionSearchQuery extends PageableQuery {
  /** Leaves out the permissions this role already holds. */
  excludeRoleId?: number | null;
  /** Leaves out the permissions granted to this user directly. */
  excludeUserId?: number | null;
}

@Injectable({ providedIn: "root" })
export class PermissionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/permissions`;

  findAll(): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(this.API_URL);
  }

  search(
    query: PermissionSearchQuery,
  ): Observable<ApiResponse<APIPage<PermissionResponse>>> {
    return this.http.get<ApiResponse<APIPage<PermissionResponse>>>(
      `${this.API_URL}/search`,
      { params: new PageableQueryParams(query).getParams() },
    );
  }
}
