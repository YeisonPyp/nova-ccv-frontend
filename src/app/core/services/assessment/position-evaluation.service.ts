import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  EvaluationType,
  PositionEvaluation,
} from "../../models/assessment/survey.model";

export interface AddSurveyToPositionEvaluationDto {
  positionId: number;
  type: EvaluationType;
  surveyId: number;
  displayOrder?: number;
}

@Injectable({ providedIn: "root" })
export class PositionEvaluationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/position-evaluations`;

  findByPosition(
    positionId: number,
  ): Observable<ApiResponse<PositionEvaluation[]>> {
    return this.http.get<ApiResponse<PositionEvaluation[]>>(
      `${this.baseUrl}/by-position/${positionId}`,
    );
  }

  addSurvey(
    dto: AddSurveyToPositionEvaluationDto,
  ): Observable<ApiResponse<PositionEvaluation>> {
    return this.http.post<ApiResponse<PositionEvaluation>>(
      `${this.baseUrl}/surveys`,
      dto,
    );
  }

  removeSurvey(positionEvaluationSurveyId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/surveys/${positionEvaluationSurveyId}`,
    );
  }
}
