import { Injectable, inject } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import {
  Training,
  CreateTrainingDto,
  TrainingDetail,
  TrainingSession,
  CreateTrainingSessionDto,
  TrainingParticipant,
  EnrollParticipantDto,
  UpdateParticipantDto,
  TrainingSurvey,
  AttachTrainingSurveyDto,
  SetQuestionImpactDto,
  SubmitTrainingAnswersDto,
  TrainingSurveyAnswer,
  TrainingMetrics,
} from "../../models/training/training.models";

@Injectable({
  providedIn: "root",
})
export class TrainingService extends FilterServiceSpecImpl<
  Training,
  CreateTrainingDto
> {
  constructor() {
    super("trainings");
  }

  getDetail(id: number): Observable<ApiResponse<TrainingDetail>> {
    return this.http.get<ApiResponse<TrainingDetail>>(`${this.baseUrl}/${id}`);
  }

  getMetrics(id: number): Observable<ApiResponse<TrainingMetrics>> {
    return this.http.get<ApiResponse<TrainingMetrics>>(
      `${this.baseUrl}/${id}/metrics`,
    );
  }

  // -- Sessions --
  addSession(
    id: number,
    dto: CreateTrainingSessionDto,
  ): Observable<ApiResponse<TrainingSession>> {
    return this.http.post<ApiResponse<TrainingSession>>(
      `${this.baseUrl}/${id}/sessions`,
      dto,
    );
  }

  deleteSession(id: number, sessionId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/sessions/${sessionId}`,
    );
  }

  // -- Participants --
  enrollParticipant(
    id: number,
    dto: EnrollParticipantDto,
  ): Observable<ApiResponse<TrainingParticipant>> {
    return this.http.post<ApiResponse<TrainingParticipant>>(
      `${this.baseUrl}/${id}/participants`,
      dto,
    );
  }

  updateParticipant(
    id: number,
    participantId: number,
    dto: UpdateParticipantDto,
  ): Observable<ApiResponse<TrainingParticipant>> {
    return this.http.put<ApiResponse<TrainingParticipant>>(
      `${this.baseUrl}/${id}/participants/${participantId}`,
      dto,
    );
  }

  removeParticipant(
    id: number,
    participantId: number,
  ): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/participants/${participantId}`,
    );
  }

  // -- Surveys & Impacts --
  attachSurvey(
    id: number,
    dto: AttachTrainingSurveyDto,
  ): Observable<ApiResponse<TrainingSurvey>> {
    return this.http.post<ApiResponse<TrainingSurvey>>(
      `${this.baseUrl}/${id}/surveys`,
      dto,
    );
  }

  detachSurvey(id: number, surveyId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/surveys/${surveyId}`,
    );
  }

  setImpact(
    id: number,
    surveyId: number,
    dto: SetQuestionImpactDto,
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/${id}/surveys/${surveyId}/impact`,
      dto,
    );
  }

  // -- Answers --
  getAnswers(
    id: number,
    employeeId: number,
  ): Observable<ApiResponse<TrainingSurveyAnswer[]>> {
    return this.http.get<ApiResponse<TrainingSurveyAnswer[]>>(
      `${this.baseUrl}/${id}/answers/${employeeId}`,
    );
  }

  submitAnswers(
    id: number,
    dto: SubmitTrainingAnswersDto,
  ): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/${id}/answers`,
      dto,
    );
  }
}
