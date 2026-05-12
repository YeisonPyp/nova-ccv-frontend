import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ContractAct } from "../../models/contract/contract.models";

export interface CreateContractActDto {
  contractId: number;
  filingId?: number;
  typeCode: string;
  actDate: string;
  signatories: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class ContractActService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  create(dto: CreateContractActDto): Observable<ApiResponse<ContractAct>> {
    return this.http.post<ApiResponse<ContractAct>>(
      `${this.base}/contract-acts`,
      dto,
    );
  }
}
