import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  CorrectiveActionDto,
  CreateCorrectiveActionDto,
  UpdateCorrectiveActionDto,
} from "../../models/improvement-plan/corrective-action.model";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";


export const correctiveActionStatus = {
  COMPLETED: 'COMPLETADO',
  PENDING: 'PENDIENTE',
  RUNNING: 'EN EJECUCIÓN',
  CANCELLED: 'CANCELADA',
  OVERDUE: 'RETRASADA'
} as const;

export type CorrectiveActionStatus = keyof (typeof correctiveActionStatus);

@Injectable({
  providedIn: "root",
})
export class CorrectiveActionService {
  private apiUrl = `${environment.apiUrl}/corrective-action`;

  constructor(private http: HttpClient) { }

  findByParentId(planId: number, parentId?: number) {
    return this.http.get<ApiResponse<Array<CorrectiveActionDto>>>(`${this.apiUrl}/plan/${planId}/children/${parentId ?? ''}`);
  }

  findElements(
    page: number,
    size: number,
  ): Observable<ApiResponse<APIPage<CorrectiveActionDto>>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<ApiResponse<APIPage<CorrectiveActionDto>>>(
      this.apiUrl,
      {
        params,
      },
    );
  }

  findById(id: number): Observable<ApiResponse<CorrectiveActionDto>> {
    return this.http.get<ApiResponse<CorrectiveActionDto>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateCorrectiveActionDto,
  ): Observable<ApiResponse<CorrectiveActionDto>> {
    return this.http.post<ApiResponse<CorrectiveActionDto>>(this.apiUrl, dto);
  }

  createMultiple(
    dtos: CreateCorrectiveActionDto[],
  ): Observable<ApiResponse<CorrectiveActionDto[]>> {
    return this.http.post<ApiResponse<CorrectiveActionDto[]>>(
      `${this.apiUrl}/batch`,
      dtos,
    );
  }

  update(
    id: number,
    dto: UpdateCorrectiveActionDto,
  ): Observable<ApiResponse<CorrectiveActionDto>> {
    return this.http.put<ApiResponse<CorrectiveActionDto>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  deleteById(id: number): Observable<ApiResponse<CorrectiveActionDto>> {
    return this.http.delete<ApiResponse<CorrectiveActionDto>>(
      `${this.apiUrl}/${id}`,
    );
  }
}
