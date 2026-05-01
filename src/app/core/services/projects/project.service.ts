import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  GanttData,
  Project,
  ProjectActivity,
} from "../../models/projects/project.model";

@Injectable({ providedIn: "root" })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(
    params: {
      status?: string;
      areaId?: number;
      page?: number;
      size?: number;
    } = {},
  ): Observable<ApiResponse<APIPage<Project>>> {
    const p: Record<string, any> = {};
    if (params.status) p["status"] = params.status;
    if (params.areaId != null) p["areaId"] = params.areaId;
    if (params.page != null) p["page"] = params.page;
    if (params.size != null) p["size"] = params.size;
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

  findActivities(
    projectId: number,
  ): Observable<ApiResponse<ProjectActivity[]>> {
    return this.http.get<ApiResponse<ProjectActivity[]>>(
      `${this.base}/project-activities`,
      {
        params: { projectId },
      },
    );
  }
}
