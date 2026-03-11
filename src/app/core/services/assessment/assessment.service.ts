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
import { CreateAssessmentDto } from "../../../features/assessment/pages/dashboard/create-assessment-modal/create-assessment-modal.component";
import { EditAssesmentDto } from "../../../features/assessment/pages/dashboard/edit-assessment-modal/edit-assessment-modal.component";
import { HttpClient } from "@angular/common/http";

export interface AssessmentPageableQuery extends PageableQuery {
  periodId?: number;
  evaluateeId?: number;
  evaluatorId?: number;
}

@Injectable({
  providedIn: "root",
})
export class AssessmentService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/assessment`;

  findAssessments(
    query: AssessmentPageableQuery,
  ): Observable<ApiResponse<APIPage<Assessment>>> {
    return this.http.get<ApiResponse<APIPage<Assessment>>>(
      this.API_URL,
      {
        params: new PageableQueryParams(query).getParams(),
      },
    );
  }

  createAssessment(
    data: CreateAssessmentDto,
  ): Observable<ApiResponse<Assessment>> {
    return this.http.post<ApiResponse<Assessment>>(`${this.API_URL}`, data);
  }

  updateAssessment(
    data: EditAssesmentDto,
  ): Observable<ApiResponse<Assessment>> {
    return this.http.patch<ApiResponse<Assessment>>(
      `${this.API_URL}/${data.id}`,
      data,
    );
  }
}
