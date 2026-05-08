import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  ContractStatus,
  EpsAffiliationType,
  EpsEntity,
  CotizationType,
  PensionType,
  CompensationEntity,
  RangeRetention,
  SalaryParameter,
  ContractCancellationType,
  ContractAssignmentStatus,
} from "../../models/contract/contract-params.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

type NameDescDto = { name: string; description?: string };
type AssignmentStatusDto = { name: string; color: string };

export interface CreateRangeRetentionDto {
  year: number;
  minUvt?: number;
  maxUvt?: number;
  tax?: number;
  subtraction?: number;
  addition?: number;
}

export interface CreateSalaryParameterDto {
  year: number;
  smmlv: number;
  transportAllowance: number;
  integralSalaryFactor: number;
  employeeHealthPct: number;
  employeePensionPct: number;
  employerHealthPct: number;
  employerPensionPct: number;
  arlPct?: number;
  senaPct: number;
  icbfPct: number;
  compensationBoxPct: number;
  uvt?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

function page<T>(
  http: HttpClient,
  url: string,
  p: PageableQuery,
): Observable<ApiResponse<APIPage<T>>> {
  return http.get<ApiResponse<APIPage<T>>>(url, {
    params: new PageableQueryParams(p).getParams(),
  });
}

@Injectable({ providedIn: "root" })
export class ContractParamsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // ── ContractStatus ──────────────────────────────────────────────────────────
  findContractStatuses(p: PageableQuery = {}) {
    return page<ContractStatus>(this.http, `${this.base}/contract-statuses`, p);
  }
  createContractStatus(dto: NameDescDto) {
    return this.http.post<ApiResponse<ContractStatus>>(
      `${this.base}/contract-statuses`,
      dto,
    );
  }
  updateContractStatus(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<ContractStatus>>(
      `${this.base}/contract-statuses/${id}`,
      dto,
    );
  }
  deleteContractStatus(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/contract-statuses/${id}`,
    );
  }

  // ── EpsAffiliationType ──────────────────────────────────────────────────────
  findEpsAffiliationTypes(p: PageableQuery = {}) {
    return page<EpsAffiliationType>(
      this.http,
      `${this.base}/eps-affiliation-types`,
      p,
    );
  }
  createEpsAffiliationType(dto: NameDescDto) {
    return this.http.post<ApiResponse<EpsAffiliationType>>(
      `${this.base}/eps-affiliation-types`,
      dto,
    );
  }
  updateEpsAffiliationType(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<EpsAffiliationType>>(
      `${this.base}/eps-affiliation-types/${id}`,
      dto,
    );
  }
  deleteEpsAffiliationType(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/eps-affiliation-types/${id}`,
    );
  }

  // ── EpsEntity ───────────────────────────────────────────────────────────────
  findEpsEntities(p: PageableQuery = {}) {
    return page<EpsEntity>(this.http, `${this.base}/eps-entities`, p);
  }
  createEpsEntity(dto: NameDescDto) {
    return this.http.post<ApiResponse<EpsEntity>>(
      `${this.base}/eps-entities`,
      dto,
    );
  }
  updateEpsEntity(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<EpsEntity>>(
      `${this.base}/eps-entities/${id}`,
      dto,
    );
  }
  deleteEpsEntity(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/eps-entities/${id}`,
    );
  }

  // ── CotizationType ──────────────────────────────────────────────────────────
  findCotizationTypes(p: PageableQuery = {}) {
    return page<CotizationType>(this.http, `${this.base}/cotization-types`, p);
  }
  createCotizationType(dto: NameDescDto) {
    return this.http.post<ApiResponse<CotizationType>>(
      `${this.base}/cotization-types`,
      dto,
    );
  }
  updateCotizationType(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<CotizationType>>(
      `${this.base}/cotization-types/${id}`,
      dto,
    );
  }
  deleteCotizationType(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/cotization-types/${id}`,
    );
  }

  // ── PensionType ─────────────────────────────────────────────────────────────
  findPensionTypes(p: PageableQuery = {}) {
    return page<PensionType>(this.http, `${this.base}/pension-types`, p);
  }
  createPensionType(dto: NameDescDto) {
    return this.http.post<ApiResponse<PensionType>>(
      `${this.base}/pension-types`,
      dto,
    );
  }
  updatePensionType(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<PensionType>>(
      `${this.base}/pension-types/${id}`,
      dto,
    );
  }
  deletePensionType(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/pension-types/${id}`,
    );
  }

  // ── CompensationEntity ──────────────────────────────────────────────────────
  findCompensationEntities(p: PageableQuery = {}) {
    return page<CompensationEntity>(
      this.http,
      `${this.base}/compensation-entities`,
      p,
    );
  }
  createCompensationEntity(dto: NameDescDto) {
    return this.http.post<ApiResponse<CompensationEntity>>(
      `${this.base}/compensation-entities`,
      dto,
    );
  }
  updateCompensationEntity(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<CompensationEntity>>(
      `${this.base}/compensation-entities/${id}`,
      dto,
    );
  }
  deleteCompensationEntity(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/compensation-entities/${id}`,
    );
  }

  // ── RangeRetention ──────────────────────────────────────────────────────────
  findRangeRetentions(p: PageableQuery = {}) {
    return page<RangeRetention>(this.http, `${this.base}/range-retentions`, p);
  }
  createRangeRetention(dto: CreateRangeRetentionDto) {
    return this.http.post<ApiResponse<RangeRetention>>(
      `${this.base}/range-retentions`,
      dto,
    );
  }
  updateRangeRetention(id: number, dto: CreateRangeRetentionDto) {
    return this.http.put<ApiResponse<RangeRetention>>(
      `${this.base}/range-retentions/${id}`,
      dto,
    );
  }
  deleteRangeRetention(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/range-retentions/${id}`,
    );
  }

  // ── SalaryParameter ─────────────────────────────────────────────────────────
  findSalaryParameters(p: PageableQuery = {}) {
    return page<SalaryParameter>(
      this.http,
      `${this.base}/salary-parameters`,
      p,
    );
  }
  createSalaryParameter(dto: CreateSalaryParameterDto) {
    return this.http.post<ApiResponse<SalaryParameter>>(
      `${this.base}/salary-parameters`,
      dto,
    );
  }
  updateSalaryParameter(id: number, dto: CreateSalaryParameterDto) {
    return this.http.put<ApiResponse<SalaryParameter>>(
      `${this.base}/salary-parameters/${id}`,
      dto,
    );
  }
  deleteSalaryParameter(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/salary-parameters/${id}`,
    );
  }

  // ── ContractCancellationType ────────────────────────────────────────────────
  findCancellationTypes(p: PageableQuery = {}) {
    return page<ContractCancellationType>(
      this.http,
      `${this.base}/contract-cancellation-types`,
      p,
    );
  }
  createCancellationType(dto: NameDescDto) {
    return this.http.post<ApiResponse<ContractCancellationType>>(
      `${this.base}/contract-cancellation-types`,
      dto,
    );
  }
  updateCancellationType(id: number, dto: NameDescDto) {
    return this.http.put<ApiResponse<ContractCancellationType>>(
      `${this.base}/contract-cancellation-types/${id}`,
      dto,
    );
  }
  deleteCancellationType(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/contract-cancellation-types/${id}`,
    );
  }

  // ── ContractAssignmentStatus ────────────────────────────────────────────────
  findAssignmentStatuses(p: PageableQuery = {}) {
    return page<ContractAssignmentStatus>(
      this.http,
      `${this.base}/contract-assignment-statuses`,
      p,
    );
  }
  createAssignmentStatus(dto: AssignmentStatusDto) {
    return this.http.post<ApiResponse<ContractAssignmentStatus>>(
      `${this.base}/contract-assignment-statuses`,
      dto,
    );
  }
  updateAssignmentStatus(id: number, dto: AssignmentStatusDto) {
    return this.http.put<ApiResponse<ContractAssignmentStatus>>(
      `${this.base}/contract-assignment-statuses/${id}`,
      dto,
    );
  }
  deleteAssignmentStatus(id: number) {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/contract-assignment-statuses/${id}`,
    );
  }
}
