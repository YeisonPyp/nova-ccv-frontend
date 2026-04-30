import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  CostCenterMovement,
  CreateCostCenterMovementDto,
} from "../../models/cost-center/cost-center.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class CostCenterMovementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cost-center-movements`;

  findByCostCenterId(
    costCenterId: number,
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<CostCenterMovement>>> {
    const params = new PageableQueryParams(p).getParams();
    params["costCenterId"] = costCenterId;
    return this.http.get<ApiResponse<APIPage<CostCenterMovement>>>(
      this.apiUrl,
      { params },
    );
  }

  findById(id: number): Observable<ApiResponse<CostCenterMovement>> {
    return this.http.get<ApiResponse<CostCenterMovement>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateCostCenterMovementDto,
  ): Observable<ApiResponse<CostCenterMovement>> {
    return this.http.post<ApiResponse<CostCenterMovement>>(this.apiUrl, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
