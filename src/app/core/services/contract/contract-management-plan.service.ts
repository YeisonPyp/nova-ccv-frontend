import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import {
  ContractManagementPlan,
  ContractManagementSeedResult,
  CreateContractManagementPlanDto,
  UpdateContractManagementPlanDto,
} from "../../models/contract/contract-management-plan.model";

@Injectable({ providedIn: "root" })
export class ContractManagementPlanService extends FilterServiceSpecImpl<
  ContractManagementPlan,
  Partial<ContractManagementPlan>
> {
  constructor() {
    super("contract-management/plans");
  }

  createPlan(
    dto: CreateContractManagementPlanDto,
  ): Observable<ApiResponse<ContractManagementPlan>> {
    return this.http.post<ApiResponse<ContractManagementPlan>>(
      this.baseUrl,
      dto,
    );
  }

  updatePlan(
    id: string,
    dto: UpdateContractManagementPlanDto,
  ): Observable<ApiResponse<ContractManagementPlan>> {
    return this.http.put<ApiResponse<ContractManagementPlan>>(
      `${this.baseUrl}/${id}`,
      dto,
    );
  }

  seedFromExcel(
    year: number,
    file: File,
  ): Observable<ApiResponse<ContractManagementSeedResult>> {
    const formData = new FormData();
    formData.append("year", String(year));
    formData.append("file", file);
    return this.http.post<ApiResponse<ContractManagementSeedResult>>(
      `${this.baseUrl}/seed`,
      formData,
    );
  }
}
