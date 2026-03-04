import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Area } from "../../models/assessment/area.model";

export interface CreateAreaDto {
  name: string;
}

@Injectable({
  providedIn: "root",
})
export class AreaService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/area`;

  findAreas(query: PageableQuery): Observable<ApiResponse<APIPage<Area>>> {
    return this.http.get<ApiResponse<APIPage<Area>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  createArea(dto: CreateAreaDto): Observable<ApiResponse<Area>> {
    return this.http.post<ApiResponse<Area>>(this.API_URL, dto);
  }
}
