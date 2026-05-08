import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  FilingWorkflow,
  FilingStepApproval,
  StepStatus,
} from "../../models/filing/filing-workflow.model";

export interface CreateFilingWorkflowDto {
  workflowId: number;
  alertTimeInterval?: string;
}

export interface UpdateFilingStepDto {
  status?: StepStatus;
  review?: string;
}

@Injectable({ providedIn: "root" })
export class FilingWorkflowService {
  private readonly http = inject(HttpClient);

  private url(filingId: number) {
    return `${environment.apiUrl}/filings/${filingId}/workflows`;
  }

  getWorkflows(filingId: number): Observable<ApiResponse<FilingWorkflow[]>> {
    return this.http.get<ApiResponse<FilingWorkflow[]>>(this.url(filingId));
  }

  create(
    filingId: number,
    dto: CreateFilingWorkflowDto,
  ): Observable<ApiResponse<FilingWorkflow>> {
    return this.http.post<ApiResponse<FilingWorkflow>>(this.url(filingId), dto);
  }

  updateStep(
    filingId: number,
    workflowId: number,
    stepId: number,
    dto: UpdateFilingStepDto,
  ): Observable<ApiResponse<FilingStepApproval>> {
    return this.http.patch<ApiResponse<FilingStepApproval>>(
      `${this.url(filingId)}/${workflowId}/step/${stepId}`,
      dto,
    );
  }
}
