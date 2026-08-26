import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { ContractAssignment } from "../../models/contract/contract.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class ContractAssignmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-assignments`;

  findByContractId(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractAssignment>>> {
    const params = {
      ...new PageableQueryParams(p).getParams(),
      contractId: String(contractId),
    };
    return this.http.get<ApiResponse<APIPage<ContractAssignment>>>(this.base, {
      params,
    });
  }

  findById(id: number): Observable<ApiResponse<ContractAssignment>> {
    return this.http.get<ApiResponse<ContractAssignment>>(
      `${this.base}/${id}`,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
