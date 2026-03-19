import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ImprovementPlan,
  CreateImprovementPlanDto,
  UpdateImprovementPlanDto,
} from "../../models/improvement-plan/improvement-plan.model";
import { APIPage } from "../../models/api-page.model";

@Injectable({
  providedIn: "root",
})
export class ImprovementPlanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/improvement-plan`;

  findElements(
    page: number = 0,
    size: number = 10,
    employeeId?: number,
  ): Observable<ApiResponse<APIPage<ImprovementPlan>>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (employeeId) {
      params = params.set("employeeId", employeeId.toString());
    }

    return this.http.get<ApiResponse<APIPage<ImprovementPlan>>>(this.apiUrl, {
      params,
    });
  }

  findById(id: number): Observable<ApiResponse<ImprovementPlan>> {
    return this.http.get<ApiResponse<ImprovementPlan>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateImprovementPlanDto,
  ): Observable<ApiResponse<ImprovementPlan>> {
    return this.http.post<ApiResponse<ImprovementPlan>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: UpdateImprovementPlanDto,
  ): Observable<ApiResponse<ImprovementPlan>> {
    return this.http.put<ApiResponse<ImprovementPlan>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  deleteById(id: number): Observable<ApiResponse<ImprovementPlan>> {
    return this.http.delete<ApiResponse<ImprovementPlan>>(
      `${this.apiUrl}/${id}`,
    );
  }
}
