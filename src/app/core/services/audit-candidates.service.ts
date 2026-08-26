import { Injectable } from "@angular/core";
import { AuditCandidate } from "../models/audit/audit-candidate.model";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";

@Injectable({ providedIn: "root" })
export class AuditCandidatesService extends FilterServiceSpecImpl<AuditCandidate> {
  constructor() {
    super("audit/candidates");
  }

  updateCandidate(
    id: number,
    isEnabled: boolean,
  ): Observable<ApiResponse<AuditCandidate>> {
    return this.http.patch<ApiResponse<AuditCandidate>>(
      `${this.baseUrl}/${id}`,
      { isEnabled },
    );
  }
}
