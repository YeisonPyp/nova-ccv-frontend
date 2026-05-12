import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  Contract,
  ContractMutation,
  ContractAdditions,
  ContractCessions,
  ContractSuspension,
  ContractCancellation,
  ContractOthersi,
} from "../../models/contract/contract.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Contracts
  findAll(
    p: PageableQuery = {},
    filters: { status?: string; agencyId?: number; employeeId?: number } = {},
  ): Observable<ApiResponse<APIPage<Contract>>> {
    const params: Record<string, any> = new PageableQueryParams(p).getParams();
    if (filters.status) params["status"] = filters.status;
    if (filters.agencyId != null) params["agencyId"] = filters.agencyId;
    if (filters.employeeId != null) params["employeeId"] = filters.employeeId;
    return this.http.get<ApiResponse<APIPage<Contract>>>(
      `${this.base}/contracts`,
      { params },
    );
  }

  findById(id: number): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.base}/contracts/${id}`);
  }

  // Mutations
  findMutations(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractMutation>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractMutation>>>(
      `${this.base}/contract-mutations`,
      { params },
    );
  }

  // Additions
  findAdditions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractAdditions>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractAdditions>>>(
      `${this.base}/contract-additions`,
      { params },
    );
  }

  // Cessions
  findCessions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractCessions>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractCessions>>>(
      `${this.base}/contract-cessions`,
      { params },
    );
  }

  // Suspensions
  findSuspensions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractSuspension>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractSuspension>>>(
      `${this.base}/contract-suspensions`,
      { params },
    );
  }

  // Cancellations
  findCancellations(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractCancellation>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractCancellation>>>(
      `${this.base}/contract-cancellations`,
      { params },
    );
  }

  // Othersi
  findOthersi(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractOthersi>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    return this.http.get<ApiResponse<APIPage<ContractOthersi>>>(
      `${this.base}/contract-othersi`,
      { params },
    );
  }

  createAddition(dto: {
    contractId: number;
    actId: number;
    newBasePeriodAmount: number;
    description?: string;
  }): Observable<ApiResponse<ContractAdditions>> {
    return this.http.post<ApiResponse<ContractAdditions>>(
      `${this.base}/contract-additions`,
      dto,
    );
  }

  createCancellation(dto: {
    contractId: number;
    actId: number;
    cancelationTypeName: string;
    cancellationReason?: string;
    cancellationDate: string;
    indemnityAmount?: number;
    penaltyAmount?: number;
  }): Observable<ApiResponse<ContractCancellation>> {
    return this.http.post<ApiResponse<ContractCancellation>>(
      `${this.base}/contract-cancellations`,
      dto,
    );
  }

  createCession(dto: {
    contractId: number;
    actId: number;
    previousEmployeeId?: number;
    newEmployeeId?: number;
    previousAgencyId?: number;
    newAgencyId?: number;
    executedAmount: number;
    pendingAmount: number;
    description?: string;
  }): Observable<ApiResponse<ContractCessions>> {
    return this.http.post<ApiResponse<ContractCessions>>(
      `${this.base}/contract-cessions`,
      dto,
    );
  }

  createOthersi(dto: {
    contractId: number;
    actId: number;
    index: number;
    description: string;
    executionDate?: string;
  }): Observable<ApiResponse<ContractOthersi>> {
    return this.http.post<ApiResponse<ContractOthersi>>(
      `${this.base}/contract-othersi`,
      dto,
    );
  }

  createSuspension(dto: {
    contractId: number;
    actId: number;
    suspensionStatusName: string;
    suspensionReason: string;
    suspensionDate: string;
    expectedTerminationDate?: string;
    expectedResumeDate?: string;
    affectsSocialSecurity: boolean;
    standbyCostAmount: number;
  }): Observable<ApiResponse<ContractSuspension>> {
    return this.http.post<ApiResponse<ContractSuspension>>(
      `${this.base}/contract-suspensions`,
      dto,
    );
  }

  createForEmployee(
    dto: Record<string, unknown>,
    files: Record<string, File> = {},
  ): Observable<ApiResponse<Contract>> {
    const formData = new FormData();
    formData.append(
      "contract",
      new Blob([JSON.stringify(dto)], { type: "application/json" }),
    );
    Object.entries(files).forEach(([name, file]) =>
      formData.append(name, file),
    );
    return this.http.post<ApiResponse<Contract>>(
      `${this.base}/contracts/employee`,
      formData,
    );
  }

  createForAgency(
    dto: Record<string, unknown>,
    files: Record<string, File> = {},
  ): Observable<ApiResponse<Contract>> {
    const formData = new FormData();
    formData.append(
      "contract",
      new Blob([JSON.stringify(dto)], { type: "application/json" }),
    );
    Object.entries(files).forEach(([name, file]) =>
      formData.append(name, file),
    );
    return this.http.post<ApiResponse<Contract>>(
      `${this.base}/contracts/agency`,
      formData,
    );
  }
}
