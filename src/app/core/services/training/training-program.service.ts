import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  CreateTrainingProgramDto,
  ProgramEmployee,
  ProgramMetrics,
  ProgramSurvey,
  TrainingProgram,
  TrainingProgramDetail,
} from '../../models/training/training-program.models';
import { SurveyAudience } from '../../models/training/training.models';

@Injectable({ providedIn: 'root' })
export class TrainingProgramService extends FilterServiceSpecImpl<
  TrainingProgram,
  CreateTrainingProgramDto
> {
  constructor() {
    super('training-programs');
  }

  getDetail(id: number): Observable<ApiResponse<TrainingProgramDetail>> {
    return this.http.get<ApiResponse<TrainingProgramDetail>>(
      `${this.baseUrl}/${id}`,
    );
  }

  // -- Employees --
  addEmployee(
    id: number,
    employeeId: number,
  ): Observable<ApiResponse<ProgramEmployee>> {
    return this.http.post<ApiResponse<ProgramEmployee>>(
      `${this.baseUrl}/${id}/employees`,
      { employeeId },
    );
  }

  removeEmployee(
    id: number,
    programEmployeeId: number,
  ): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/employees/${programEmployeeId}`,
    );
  }

  // -- Surveys --
  attachSurvey(
    id: number,
    dto: { surveyId: number; aimedAt: SurveyAudience; evaluatorId?: number },
  ): Observable<ApiResponse<ProgramSurvey>> {
    return this.http.post<ApiResponse<ProgramSurvey>>(
      `${this.baseUrl}/${id}/surveys`,
      dto,
    );
  }

  detachSurvey(
    id: number,
    programSurveyId: number,
  ): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/surveys/${programSurveyId}`,
    );
  }

  // -- Generation & metrics --
  generate(id: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(
      `${this.baseUrl}/${id}/generate`,
      {},
    );
  }

  getMetrics(id: number): Observable<ApiResponse<ProgramMetrics>> {
    return this.http.get<ApiResponse<ProgramMetrics>>(
      `${this.baseUrl}/${id}/metrics`,
    );
  }
}
