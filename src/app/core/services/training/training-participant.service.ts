import { TrainingParticipant } from '@/app/core/models/training/training.models';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';
import { Employee } from '../../models/assessment/employee.model';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';

export interface EmployeesToEnrollQueryParams extends PageableQuery {
  trainingId: number;
  areaName?: string;
  position?: string;
}

@Injectable({ providedIn: 'root' })
export class TrainingParticipantService {
  private baseUrl = `${environment.apiUrl}/trainings`;
  private readonly http = inject(HttpClient);

  getTrainingParticipants(
    trainingId: number,
  ): Observable<ApiResponse<TrainingParticipant[]>> {
    return this.http.get<ApiResponse<TrainingParticipant[]>>(
      `${this.baseUrl}/${trainingId}/participants`,
    );
  }

  findEmployeesToEnroll(
    p: EmployeesToEnrollQueryParams,
  ): Observable<ApiResponse<APIPage<Employee>>> {
    const { trainingId, ...pageable } = p;
    return this.http.get<ApiResponse<APIPage<Employee>>>(
      `${this.baseUrl}/${trainingId}/employees-to-enroll`,
      { params: new PageableQueryParams(pageable).getParams() },
    );
  }

  enrollParticipant(trainingId: number, employeeId: number) {
    return this.http.post<ApiResponse<TrainingParticipant>>(
      `${this.baseUrl}/${trainingId}/participants`,
      {
        employeeId,
      },
    );
  }

  removeParticipant(trainingId: number, employeeId: number) {
    return this.http.delete(
      `${this.baseUrl}/${trainingId}/participants/${employeeId}`,
    );
  }
}
