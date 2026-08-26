import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, shareReplay } from "rxjs";
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
  ContractResume,
} from "../../models/contract/contract.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";

interface BaseCreateContractMutation {
  contractId: number;
  actId: number;
}

export interface CreateCessionDto extends BaseCreateContractMutation {
  newEmployeeId?: number;
  newAgencyId?: number;
  executedAmount: number;
  description?: string;
}

export interface CreateContractSuspensionDto extends BaseCreateContractMutation {
  suspensionStatusName: string;
  suspensionReason: string;
  suspensionDate: string;
  expectedTerminationDate?: string;
  expectedResumeDate?: string;
  affectsSocialSecurity: boolean;
  standbyCostAmount: number;
}

export interface CreateContractOthersiDto extends BaseCreateContractMutation {
  index: number;
  description: string;
  executionDate?: string;
}

export interface CreateContractCancellationDto extends BaseCreateContractMutation {
  cancelationTypeName: string;
  cancellationReason?: string;
  cancellationDate: string;
  indemnityAmount?: number;
  penaltyAmount?: number;
}

export interface CreateContractAdditionDto extends BaseCreateContractMutation {
  newBasePeriodAmount: number;
  description?: string;
}

export interface CreateContractResumeDto extends BaseCreateContractMutation {
  runningStatusName: string;
  resumeDate: string;
  observations?: string;
}

@Injectable({ providedIn: "root" })
export class ContractService implements FilterServiceSpec {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  $cached: Record<string, Observable<any>> = {};

  // Contracts
  findAll(
    p: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<Contract>>> {
    const params: Record<string, any> = new PageableQueryParams(p).getParams();
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
    if (!this.$cached[`mut-${contractId}`]) {
      this.$cached[`mut-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractMutation>>
        >(`${this.base}/contract-mutations`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`mut-${contractId}`];
  }

  // Additions
  findAdditions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractAdditions>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`add-${contractId}`]) {
      this.$cached[`add-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractAdditions>>
        >(`${this.base}/contract-additions`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`add-${contractId}`];
  }

  // Cessions
  findCessions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractCessions>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`ces-${contractId}`]) {
      this.$cached[`ces-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractCessions>>
        >(`${this.base}/contract-cessions`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`ces-${contractId}`];
  }

  // Suspensions
  findSuspensions(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractSuspension>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`sus-${contractId}`]) {
      this.$cached[`sus-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractSuspension>>
        >(`${this.base}/contract-suspensions`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`sus-${contractId}`];
  }

  // Cancellations
  findCancellations(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractCancellation>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`can-${contractId}`]) {
      this.$cached[`can-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractCancellation>>
        >(`${this.base}/contract-cancellations`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`can-${contractId}`];
  }

  // Othersi
  findOthersi(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractOthersi>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`oth-${contractId}`]) {
      this.$cached[`oth-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractOthersi>>
        >(`${this.base}/contract-othersi`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`oth-${contractId}`];
  }

  // Resume
  findResumes(
    contractId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<ContractResume>>> {
    const params = { ...new PageableQueryParams(p).getParams(), contractId };
    if (!this.$cached[`res-${contractId}`]) {
      this.$cached[`res-${contractId}`] = this.http
        .get<
          ApiResponse<APIPage<ContractResume>>
        >(`${this.base}/contract-resumes`, { params })
        .pipe(shareReplay(1));
    }
    return this.$cached[`res-${contractId}`];
  }

  createAddition(
    dto: CreateContractAdditionDto,
  ): Observable<ApiResponse<ContractAdditions>> {
    return this.http.post<ApiResponse<ContractAdditions>>(
      `${this.base}/contract-additions`,
      dto,
    );
  }

  createCancellation(
    dto: CreateContractCancellationDto,
  ): Observable<ApiResponse<ContractCancellation>> {
    return this.http.post<ApiResponse<ContractCancellation>>(
      `${this.base}/contract-cancellations`,
      dto,
    );
  }

  createCession(
    dto: CreateCessionDto,
  ): Observable<ApiResponse<ContractCessions>> {
    return this.http.post<ApiResponse<ContractCessions>>(
      `${this.base}/contract-cessions`,
      dto,
    );
  }

  createOthersi(
    dto: CreateContractOthersiDto,
  ): Observable<ApiResponse<ContractOthersi>> {
    return this.http.post<ApiResponse<ContractOthersi>>(
      `${this.base}/contract-othersi`,
      dto,
    );
  }

  createSuspension(
    dto: CreateContractSuspensionDto,
  ): Observable<ApiResponse<ContractSuspension>> {
    return this.http.post<ApiResponse<ContractSuspension>>(
      `${this.base}/contract-suspensions`,
      dto,
    );
  }

  createContractResume(
    dto: CreateContractResumeDto,
  ): Observable<ApiResponse<ContractResume>> {
    return this.http.post<ApiResponse<ContractResume>>(
      `${this.base}/contract-resumes`,
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
