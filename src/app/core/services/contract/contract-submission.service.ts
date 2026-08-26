import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ContractSubmission } from "../../models/contract/contract.models";

@Injectable({ providedIn: "root" })
export class ContractSubmissionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-submissions`;

  create(
    assignmentId: number,
    files: File[],
  ): Observable<ApiResponse<ContractSubmission>> {
    const form = new FormData();
    form.append("assignmentId", String(assignmentId));
    files.forEach((f) => form.append("files", f));
    return this.http.post<ApiResponse<ContractSubmission>>(this.base, form);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
