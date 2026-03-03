import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { APIPage } from "../../models/api-page.model";
import { Assessment } from "../../models/assessment/assessment.model";
import { ApiResponse } from "../../models/api-response.model";
import { Observable } from "rxjs";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({
  providedIn: "root",
})
export class AssessmentService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment`;

  findAssessmentsInPeriod(
    periodId: number,
    query: PageableQuery,
  ): Observable<ApiResponse<APIPage<Assessment>>> {
    return this.http.get<ApiResponse<APIPage<Assessment>>>(
      `${this.API_URL}/period/${periodId}`,
      {
        params: new PageableQueryParams(query).getParams(),
      },
    );
  }
}
