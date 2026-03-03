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
import { Period } from "../../models/assessment/period.model";
import { EditPeriodDto } from "../../../features/assessment/pages/periods/edit-period-modal/edit-period-modal.component";

@Injectable({
  providedIn: "root",
})
export class PeriodService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment-period/`;

  findCurrentPeriods(
    query: PageableQuery,
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
}
