import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  Workflow,
  WorkflowStep,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  CreateWorkflowStepDto,
  UpdateWorkflowStepDto,
} from "../../models/filing/workflow.model";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class WorkflowService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/workflow`;
  private readonly stepApiUrl = `${environment.apiUrl}/workflow-step`;

  findAll(p: PageableQuery = {}): Observable<ApiResponse<APIPage<Workflow>>> {
    return this.http.get<ApiResponse<APIPage<Workflow>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  create(dto: CreateWorkflowDto): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateWorkflowDto): Observable<ApiResponse<Workflow>> {
    return this.http.put<ApiResponse<Workflow>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  findSteps(workflowId: number): Observable<ApiResponse<WorkflowStep[]>> {
    return this.http.get<ApiResponse<WorkflowStep[]>>(this.stepApiUrl, {
      params: { workflowId },
    });
  }

  createStep(dto: CreateWorkflowStepDto): Observable<ApiResponse<WorkflowStep>> {
    return this.http.post<ApiResponse<WorkflowStep>>(this.stepApiUrl, dto);
  }

  updateStep(id: number, dto: UpdateWorkflowStepDto): Observable<ApiResponse<WorkflowStep>> {
    return this.http.put<ApiResponse<WorkflowStep>>(`${this.stepApiUrl}/${id}`, dto);
  }

  deleteStep(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.stepApiUrl}/${id}`);
  }
}
