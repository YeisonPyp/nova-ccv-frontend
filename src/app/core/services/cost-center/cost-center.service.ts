import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  CostCenter,
  CreateCostCenterDto,
} from "../../models/cost-center/cost-center.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class CostCenterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cost-centers`;

  findAll(
    p: PageableQuery = {},
    parentId?: number,
  ): Observable<ApiResponse<APIPage<CostCenter>>> {
    const params = new PageableQueryParams(p).getParams();
    if (parentId != null) params["parentId"] = parentId;
    return this.http.get<ApiResponse<APIPage<CostCenter>>>(this.apiUrl, {
      params,
    });
  }

  findRoots(
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<CostCenter>>> {
    return this.http.get<ApiResponse<APIPage<CostCenter>>>(
      `${this.apiUrl}/roots`,
      { params: new PageableQueryParams(p).getParams() },
    );
  }

  findById(id: number): Observable<ApiResponse<CostCenter>> {
    return this.http.get<ApiResponse<CostCenter>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCostCenterDto): Observable<ApiResponse<CostCenter>> {
    return this.http.post<ApiResponse<CostCenter>>(this.apiUrl, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
