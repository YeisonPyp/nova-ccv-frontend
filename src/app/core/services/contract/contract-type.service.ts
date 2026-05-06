import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface ContractType {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class ContractTypeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/contract-types`;

  getContractTypes() {
    return this.http.get<ApiResponse<ContractType[]>>(this.API_URL);
  }
}
