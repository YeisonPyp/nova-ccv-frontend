import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  ContractPendingProcess,
  ContractPendingProcessType,
} from "../../models/contract/contract.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

export interface CreateContractPendingProcessDto {
  contractId: number;
  name: string;
  type: ContractPendingProcessType;
  filingId?: number;
}

@Injectable({ providedIn: "root" })
export class ContractPendingProcessService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findByContractId(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractPendingProcess>>> {
    const params = new PageableQueryParams(p).getParams();
    return this.http.get<ApiResponse<APIPage<ContractPendingProcess>>>(
      `${this.base}/contract-pending-process/${contractId}`,
      { params },
    );
  }

  create(
    dto: CreateContractPendingProcessDto,
  ): Observable<ApiResponse<ContractPendingProcess>> {
    return this.http.post<ApiResponse<ContractPendingProcess>>(
      `${this.base}/contract-pending-process`,
      dto,
    );
  }
}
