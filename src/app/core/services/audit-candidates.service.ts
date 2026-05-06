import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api-response.model";
import { APIPage, Pageable } from "../models/api-page.model";
import { AuditCandidate } from "../models/audit/audit-candidate.model";
import { AuditLog } from "../models/audit/audit-log.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../shared/pageable-query";

export interface LogsParams extends PageableQuery {
  op?: string;
  userId?: number;
  entityName?: string;
}

@Injectable({ providedIn: "root" })
export class AuditCandidatesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/audit`;

  getCandidates(page = 0, size = 20): Observable<APIPage<AuditCandidate>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<APIPage<AuditCandidate>>(`${this.base}/candidates`, {
      params,
    });
  }

  updateCandidate(
    id: number,
    isEnabled: boolean,
  ): Observable<ApiResponse<AuditCandidate>> {
    return this.http.patch<ApiResponse<AuditCandidate>>(
      `${this.base}/candidates/${id}`,
      { isEnabled },
    );
  }

  findLogs(p: LogsParams): Observable<APIPage<AuditLog>> {
    return this.http.get<APIPage<AuditLog>>(this.base, {
      params: new PageableQueryParams(p).getParams(),
    });
  }
}
