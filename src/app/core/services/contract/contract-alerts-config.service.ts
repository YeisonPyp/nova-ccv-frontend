import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ContractAlertsConfig,
  CreateContractAlertsConfigDto,
  UpdateContractAlertsConfigDto,
} from "../../models/contract/contract-alerts-config.model";

@Injectable({ providedIn: "root" })
export class ContractAlertsConfigService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-alerts-config`;

  findAll(): Observable<ApiResponse<ContractAlertsConfig[]>> {
    return this.http.get<ApiResponse<ContractAlertsConfig[]>>(this.base);
  }

  getTemplatesBucketName(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(
      `${this.base}/templates-bucket`,
    );
  }

  create(
    dto: CreateContractAlertsConfigDto,
  ): Observable<ApiResponse<ContractAlertsConfig>> {
    return this.http.post<ApiResponse<ContractAlertsConfig>>(this.base, dto);
  }

  update(
    id: string,
    dto: UpdateContractAlertsConfigDto,
  ): Observable<ApiResponse<ContractAlertsConfig>> {
    return this.http.put<ApiResponse<ContractAlertsConfig>>(
      `${this.base}/${id}`,
      dto,
    );
  }

  deleteById(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
