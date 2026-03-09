import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Position } from "../../models/assessment/position.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

export interface CreatePositionDto {
  name: string;
  description: string;
  areaId: number;
  competencies: Array<number>;
}

export interface UpdatePositionDto {
  name?: string;
  description?: string;
  areaId?: number;
  competencies?: Array<number>;
}

export interface PositionPageableQuery extends PageableQuery {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class PositionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/position`;

  findPositions(
    query: PositionPageableQuery,
  ): Observable<ApiResponse<APIPage<Position>>> {
    return this.http.get<ApiResponse<APIPage<Position>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  createPosition(
    position: CreatePositionDto,
  ): Observable<ApiResponse<Position>> {
    return this.http.post<ApiResponse<Position>>(this.API_URL, position);
  }

  updatePosition(
    id: number,
    position: UpdatePositionDto,
  ): Observable<ApiResponse<Position>> {
    return this.http.put<ApiResponse<Position>>(
      `${this.API_URL}/${id}`,
      position,
    );
  }

  deletePosition(id: number): Observable<ApiResponse<Position>> {
    return this.http.delete<ApiResponse<Position>>(`${this.API_URL}/${id}`);
  }
}
