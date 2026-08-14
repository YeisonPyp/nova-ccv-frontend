import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ContractManagementExecutionPlan,
  CreateContractManagementExecutionPlanDto,
} from "../../models/contract/contract-management-plan.model";

@Injectable({ providedIn: "root" })
export class ContractManagementExecutionPlanService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-management`;

  findByPlanId(
    planId: string,
  ): Observable<ApiResponse<ContractManagementExecutionPlan[]>> {
    return this.http.get<ApiResponse<ContractManagementExecutionPlan[]>>(
      `${this.base}/plans/${planId}/executions`,
    );
  }

  create(
    planId: string,
    dto: CreateContractManagementExecutionPlanDto,
  ): Observable<ApiResponse<ContractManagementExecutionPlan>> {
    return this.http.post<ApiResponse<ContractManagementExecutionPlan>>(
      `${this.base}/plans/${planId}/executions`,
      dto,
    );
  }

  deleteById(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/executions/${id}`,
    );
  }
}
