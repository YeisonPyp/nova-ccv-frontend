import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Period } from "../../models/assessment/period.model";
import { HttpClient } from "@angular/common/http";

export interface EvaluationPeriodPageableQuery extends PageableQuery {
  name?: string;
}

type EditPeriodDto = Partial<Period>;

@Injectable({
  providedIn: "root",
})
export class PeriodService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment-period/`;

  findCurrentPeriods(
    query: EvaluationPeriodPageableQuery,
  ): Observable<ApiResponse<APIPage<Period>>> {
    return this.http.get<ApiResponse<APIPage<Period>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  createPeriod(dto: EditPeriodDto): Observable<ApiResponse<Period>> {
    return this.http.post<ApiResponse<Period>>(this.API_URL, dto);
  }

  updatePeriod(
    id: number,
    dto: EditPeriodDto,
  ): Observable<ApiResponse<Period>> {
    return this.http.put<ApiResponse<Period>>(`${this.API_URL}/${id}`, dto);
  }

  deletePeriod(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
