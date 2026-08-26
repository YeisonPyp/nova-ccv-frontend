import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';
import {
  Project,
  ProjectActivity,
  ProjectFormulation,
  ProjectIndicator,
  ProjectIndicatorType,
  ProjectRisk,
} from '../../models/projects/project.model';
import { GanttData } from './project-activites.service';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';
import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { PageableQueryWithRsql } from '@/app/shared/components/pagination-table/pagination-table.component';
import builder from '@rsql/builder';
import { PatActivityBudgetMatrix } from '../../models/pat/pat-models';
import { environment } from '@/environments/environment';

export const RISK_SCALE_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'extreme', label: 'Extrema' },
] as const;

export interface CreateProjectObjectiveDto {
  name: string;
  description: string;
}

export interface CreateProjectDto {
  code: string;
  name: string;
  areaId: number;
  employeeId: number;
  costCenterId?: number | null;
  generalObjective: string;
  status: string;
  starts: string;
  ends: string;
  priorityId: number;
  totalBudget?: number | null;
  description?: string;
  objectives: CreateProjectObjectiveDto[];
}

export interface CreateProjectActivityDto {
  name: string;
  description?: string;
  parentId?: number | null;
  displayOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status: string;
  priority?: string | null;
  colorHex?: string;
  approvedBudget?: number | null;
}

export interface UpdateProjectActivityDto {
  name?: string;
  description?: string;
  parentId?: number | null;
  displayOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  progressPercentage?: number;
  status?: string;
  priority?: string | null;
  colorHex?: string;
  approvedBudget?: number | null;
  executedBudget?: number | null;
}

export interface CreateProjectIndicatorDto {
  type: ProjectIndicatorType;
  name: string;
  targetValue?: number | null;
}

export interface UpdateProjectIndicatorDto {
  type?: ProjectIndicatorType;
  name?: string;
  targetValue?: number | null;
  currentValue?: number | null;
}

export type UpdateProjectFormulationDto = Partial<
  Omit<ProjectFormulation, 'estimatedBeneficiaries' | 'updatedAt'>
>;

export interface CreateRiskDto {
  projectId: number;
  name: string;
  description?: string;
  displayOrder?: number;
  estimatedCostAmount?: number | null;
  estimatedHours?: number | null;
  probability?: string;
  priority?: string;
}

export interface ProjectQueryParams extends PageableQueryWithRsql {
  status?: string | null;
  areaId?: number;
}

export interface ProjectFile {
  id: number;
  fileName: string;
  bucketName: string;
  description: string;
}

export interface ActivityQueryParams extends PageableQuery {
  projectId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectService extends FilterServiceSpecImpl<
  Project,
  CreateProjectDto
> {
  constructor() {
    super('projects');
  }

  override findAll(
    q: ProjectQueryParams,
  ): Observable<ApiResponse<APIPage<Project>>> {
    q.nodes = [];
    if (q.status) {
      q.nodes.push(builder.comparison('status', '==', q.status));
      delete q.status;
    }
    if (q.areaId) {
      q.nodes.push(builder.comparison('area.id', '==', q.areaId));
      delete q.areaId;
    }

    return this.http.get<ApiResponse<APIPage<Project>>>(`${this.baseUrl}`, {
      params: new PageableQueryParams(q).getParams(),
    });
  }

  getGanttData(id: number): Observable<ApiResponse<GanttData>> {
    return this.http.get<ApiResponse<GanttData>>(`${this.baseUrl}/${id}/gantt`);
  }

  findActivities(
    projectId: number,
  ): Observable<ApiResponse<Array<ProjectActivity>>> {
    return this.http.get<ApiResponse<Array<ProjectActivity>>>(
      `${this.baseUrl}/${projectId}/activities`,
    );
  }

  createActivity(
    projectId: number,
    dto: CreateProjectActivityDto,
  ): Observable<ApiResponse<ProjectActivity>> {
    return this.http.post<ApiResponse<ProjectActivity>>(
      `${this.baseUrl}/${projectId}/activities`,
      dto,
    );
  }

  updateActivity(
    id: number,
    dto: UpdateProjectActivityDto,
  ): Observable<ApiResponse<ProjectActivity>> {
    return this.http.put<ApiResponse<ProjectActivity>>(
      `${this.baseUrl}/activities/${id}`,
      dto,
    );
  }

  deleteActivity(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/activities/${id}`,
    );
  }

  findFormulation(
    projectId: number,
  ): Observable<ApiResponse<ProjectFormulation>> {
    return this.http.get<ApiResponse<ProjectFormulation>>(
      `${this.baseUrl}/${projectId}/formulation`,
    );
  }

  updateFormulation(
    projectId: number,
    dto: UpdateProjectFormulationDto,
  ): Observable<ApiResponse<ProjectFormulation>> {
    return this.http.put<ApiResponse<ProjectFormulation>>(
      `${this.baseUrl}/${projectId}/formulation`,
      dto,
    );
  }

  findIndicators(
    projectId: number,
  ): Observable<ApiResponse<ProjectIndicator[]>> {
    return this.http.get<ApiResponse<ProjectIndicator[]>>(
      `${this.baseUrl}/${projectId}/indicators`,
    );
  }

  createIndicator(
    projectId: number,
    dto: CreateProjectIndicatorDto,
  ): Observable<ApiResponse<ProjectIndicator>> {
    return this.http.post<ApiResponse<ProjectIndicator>>(
      `${this.baseUrl}/${projectId}/indicators`,
      dto,
    );
  }

  updateIndicator(
    id: number,
    dto: UpdateProjectIndicatorDto,
  ): Observable<ApiResponse<ProjectIndicator>> {
    return this.http.put<ApiResponse<ProjectIndicator>>(
      `${this.baseUrl}/indicators/${id}`,
      dto,
    );
  }

  deleteIndicator(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/indicators/${id}`,
    );
  }

  private readonly riskBaseUrl = `${environment.apiUrl}/project-risks`;

  findRisks(projectId: number): Observable<ApiResponse<ProjectRisk[]>> {
    return this.http.get<ApiResponse<ProjectRisk[]>>(this.riskBaseUrl, {
      params: { projectId },
    });
  }

  createRisk(dto: CreateRiskDto): Observable<ApiResponse<ProjectRisk>> {
    return this.http.post<ApiResponse<ProjectRisk>>(this.riskBaseUrl, dto);
  }

  updateRisk(
    id: number,
    dto: CreateRiskDto,
  ): Observable<ApiResponse<ProjectRisk>> {
    return this.http.put<ApiResponse<ProjectRisk>>(
      `${this.riskBaseUrl}/${id}`,
      dto,
    );
  }

  deleteRisk(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.riskBaseUrl}/${id}`);
  }

  findBudgetMatrix(
    projectId: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix[]>> {
    return this.http.get<ApiResponse<PatActivityBudgetMatrix[]>>(
      `${this.baseUrl}/${projectId}/budget-matrix`,
    );
  }

  saveBudgetMatrix(
    projectId: number,
    budgetCategoryId: number,
    amount: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix>> {
    return this.http.post<ApiResponse<PatActivityBudgetMatrix>>(
      `${this.baseUrl}/${projectId}/budget-matrix`,
      { budgetCategoryId, amount },
    );
  }

  findProjectFiles(
    projectId: number,
  ): Observable<ApiResponse<Array<ProjectFile>>> {
    return this.http.get<ApiResponse<Array<ProjectFile>>>(
      `${this.baseUrl}/${projectId}/files`,
    );
  }

  updateProjectFile(
    id: number,
    file: File,
  ): Observable<ApiResponse<ProjectFile>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<ApiResponse<ProjectFile>>(
      `${this.baseUrl}/files/${id}`,
      formData,
    );
  }

  uploadProjectFile(
    projectId: number,
    file: File,
    description?: string,
  ): Observable<ApiResponse<ProjectFile>> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return this.http.post<ApiResponse<ProjectFile>>(
      `${this.baseUrl}/${projectId}/files`,
      formData,
    );
  }

  deleteProjectFile(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/files/${id}`);
  }
}
