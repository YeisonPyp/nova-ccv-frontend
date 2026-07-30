import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  CreateImprovementActionDto,
  ImprovementActionDto,
  UpdateImprovementActionDto,
} from "../../models/improvement-plan/improvement-action.model";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";

export const improvementActionStatus = {
  COMPLETED: "COMPLETADO",
  PENDING: "PENDIENTE",
  RUNNING: "EN EJECUCIÓN",
  CANCELLED: "CANCELADA",
  OVERDUE: "RETRASADA",
} as const;

export type ImprovementActionStatus = keyof typeof improvementActionStatus;

@Injectable({
  providedIn: "root",
})
export class ImprovementActionService {
  private apiUrl = `${environment.apiUrl}/improvement-action`;

  constructor(private http: HttpClient) {}

  findByFindingId(
    findingId: number,
  ): Observable<ApiResponse<ImprovementActionDto[]>> {
    return this.http.get<ApiResponse<ImprovementActionDto[]>>(
      `${this.apiUrl}/finding/${findingId}`,
    );
  }

  findElements(
    page: number,
    size: number,
  ): Observable<ApiResponse<APIPage<ImprovementActionDto>>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<ApiResponse<APIPage<ImprovementActionDto>>>(
      this.apiUrl,
      {
        params,
      },
    );
  }

  findById(id: number): Observable<ApiResponse<ImprovementActionDto>> {
    return this.http.get<ApiResponse<ImprovementActionDto>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateImprovementActionDto,
  ): Observable<ApiResponse<ImprovementActionDto>> {
    return this.http.post<ApiResponse<ImprovementActionDto>>(
      this.apiUrl,
      dto,
    );
  }

  update(
    id: number,
    dto: UpdateImprovementActionDto,
  ): Observable<ApiResponse<ImprovementActionDto>> {
    return this.http.put<ApiResponse<ImprovementActionDto>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  deleteById(id: number): Observable<ApiResponse<ImprovementActionDto>> {
    return this.http.delete<ApiResponse<ImprovementActionDto>>(
      `${this.apiUrl}/${id}`,
    );
  }
}
