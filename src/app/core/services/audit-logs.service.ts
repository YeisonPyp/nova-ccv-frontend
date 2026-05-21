import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api-response.model";
import { APIPage } from "../models/api-page.model";
import { AuditCandidate } from "../models/audit/audit-candidate.model";
import { AuditLog } from "../models/audit/audit-log.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../shared/pageable-query";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";

export interface LogsParams extends PageableQuery {
  op?: string;
  userId?: number;
  entityName?: string;
}

@Injectable({ providedIn: "root" })
export class AuditLogsService implements FilterServiceSpec {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/audit`;

  updateCandidate(
    id: number,
    isEnabled: boolean,
  ): Observable<ApiResponse<AuditCandidate>> {
    return this.http.patch<ApiResponse<AuditCandidate>>(
      `${this.base}/candidates/${id}`,
      { isEnabled },
    );
  }

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<AuditLog>>> {
    return this.http.get<ApiResponse<APIPage<AuditLog>>>(this.base, {
      params: new PageableQueryParams(pageable).getParams(),
    });
  }
}
