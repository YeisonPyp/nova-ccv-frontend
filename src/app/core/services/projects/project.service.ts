import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';
import {
  Project,
  ProjectActivity,
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
import { emit } from '@rsql/emitter';
import { PatActivityBudgetMatrix } from '../../models/pat/pat-models';

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
  generalObjective: string;
  status: string;
  starts: string;
  ends: string;
  priorityId: number;
  employeeId: number;
  tacticalActivityCode: string;
  description?: string;
  programId?: number;
  objectives: CreateProjectObjectiveDto[];
}

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
  year?: number;
  areaId?: number;
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
    if (q.year) {
      q.nodes.push(builder.comparison('year', '==', q.year));
      delete q.year;
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

  deleteActivity(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/project-activities/${id}`,
    );
  }

  findRisks(projectId: number): Observable<ApiResponse<ProjectRisk[]>> {
    return this.http.get<ApiResponse<ProjectRisk[]>>(
      `${this.baseUrl}/project-risks`,
      { params: { projectId } },
    );
  }

  createRisk(dto: CreateRiskDto): Observable<ApiResponse<ProjectRisk>> {
    return this.http.post<ApiResponse<ProjectRisk>>(
      `${this.baseUrl}/project-risks`,
      dto,
    );
  }

  updateRisk(
    id: number,
    dto: CreateRiskDto,
  ): Observable<ApiResponse<ProjectRisk>> {
    return this.http.put<ApiResponse<ProjectRisk>>(
      `${this.baseUrl}/project-risks/${id}`,
      dto,
    );
  }

  deleteRisk(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/project-risks/${id}`,
    );
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
}
