import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ContractFilingFileName } from "../../models/contract/contract.models";

@Injectable({ providedIn: "root" })
export class ContractFilingFileNameService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(): Observable<ApiResponse<ContractFilingFileName[]>> {
    return this.http.get<ApiResponse<ContractFilingFileName[]>>(
      `${this.base}/contract-filing-names`,
    );
  }
}
