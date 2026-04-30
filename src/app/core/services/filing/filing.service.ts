import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Filing, CreateFilingDto } from "../../models/filing/filing.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class FilingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/filings`;

  findAll(
    p: PageableQuery = {},
    parentId?: number,
  ): Observable<ApiResponse<APIPage<Filing>>> {
    const params = new PageableQueryParams(p).getParams();
    if (parentId != null) params["parentId"] = parentId;
    return this.http.get<ApiResponse<APIPage<Filing>>>(this.apiUrl, { params });
  }

  findRoots(p: PageableQuery = {}): Observable<ApiResponse<APIPage<Filing>>> {
    return this.http.get<ApiResponse<APIPage<Filing>>>(`${this.apiUrl}/roots`, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  findById(id: number): Observable<ApiResponse<Filing>> {
    return this.http.get<ApiResponse<Filing>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateFilingDto): Observable<ApiResponse<Filing>> {
    return this.http.post<ApiResponse<Filing>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: Partial<CreateFilingDto>,
  ): Observable<ApiResponse<Filing>> {
    return this.http.put<ApiResponse<Filing>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
