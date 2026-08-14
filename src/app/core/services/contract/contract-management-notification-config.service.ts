import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ContractManagementNotificationConfig,
  CreateContractManagementNotificationConfigDto,
  UpdateContractManagementNotificationConfigDto,
} from "../../models/contract/contract-management-plan.model";

@Injectable({ providedIn: "root" })
export class ContractManagementNotificationConfigService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-management/notification-config`;

  findAll(): Observable<ApiResponse<ContractManagementNotificationConfig[]>> {
    return this.http.get<ApiResponse<ContractManagementNotificationConfig[]>>(
      this.base,
    );
  }

  create(
    dto: CreateContractManagementNotificationConfigDto,
  ): Observable<ApiResponse<ContractManagementNotificationConfig>> {
    return this.http.post<ApiResponse<ContractManagementNotificationConfig>>(
      this.base,
      dto,
    );
  }

  update(
    id: string,
    dto: UpdateContractManagementNotificationConfigDto,
  ): Observable<ApiResponse<ContractManagementNotificationConfig>> {
    return this.http.put<ApiResponse<ContractManagementNotificationConfig>>(
      `${this.base}/${id}`,
      dto,
    );
  }

  deleteById(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
