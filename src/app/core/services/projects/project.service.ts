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

export interface ProjectQueryParams extends PageableQuery {
  status?: string | null;
  year?: number;
  areaId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(
    params: ProjectQueryParams,
  ): Observable<ApiResponse<APIPage<Project>>> {
    const p = new PageableQueryParams(params).getParams();
    return this.http.get<ApiResponse<APIPage<Project>>>(
      `${this.base}/projects`,
      { params: p },
    );
  }

  findById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.base}/projects/${id}`);
  }

  getGanttData(id: number): Observable<ApiResponse<GanttData>> {
    return this.http.get<ApiResponse<GanttData>>(
      `${this.base}/projects/${id}/gantt`,
    );
  }

  create(dto: CreateProjectDto): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${this.base}/projects`, dto);
  }

  findActivities(
    projectId: number,
  ): Observable<ApiResponse<ProjectActivity[]>> {
    return this.http.get<ApiResponse<ProjectActivity[]>>(
      `${this.base}/project-activities`,
      { params: { projectId } },
    );
  }

  deleteActivity(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/project-activities/${id}`,
    );
  }

  findRisks(projectId: number): Observable<ApiResponse<ProjectRisk[]>> {
    return this.http.get<ApiResponse<ProjectRisk[]>>(
      `${this.base}/project-risks`,
      { params: { projectId } },
    );
  }

  createRisk(dto: CreateRiskDto): Observable<ApiResponse<ProjectRisk>> {
    return this.http.post<ApiResponse<ProjectRisk>>(
      `${this.base}/project-risks`,
      dto,
    );
  }

  updateRisk(
    id: number,
    dto: CreateRiskDto,
  ): Observable<ApiResponse<ProjectRisk>> {
    return this.http.put<ApiResponse<ProjectRisk>>(
      `${this.base}/project-risks/${id}`,
      dto,
    );
  }

  deleteRisk(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/project-risks/${id}`,
    );
  }
}
