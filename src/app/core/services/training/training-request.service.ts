import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { ApiResponse } from '@/app/core/models/api-response.model';
import { Employee } from '@/app/core/models/assessment/employee.model';
import {
  ConvertRequestToTrainingDto,
  CreateTrainingRequestDto,
  RespondTrainingRequestDto,
  TrainingRequest,
  TrainingRequestDetail,
} from '@/app/core/models/training/training-request.models';
import { TrainingDetail } from '@/app/core/models/training/training.models';

@Injectable({ providedIn: 'root' })
export class TrainingRequestService extends FilterServiceSpecImpl<
  TrainingRequest,
  CreateTrainingRequestDto
> {
  constructor() {
    super('training-requests');
  }

  getDetail(id: number): Observable<ApiResponse<TrainingRequestDetail>> {
    return this.http.get<ApiResponse<TrainingRequestDetail>>(
      `${this.baseUrl}/${id}`,
    );
  }

  /** Employees the current user may request a training for (subordinates). */
  requestableEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.baseUrl}/requestable-employees`,
    );
  }

  redirect(id: number): Observable<ApiResponse<TrainingRequestDetail>> {
    return this.http.post<ApiResponse<TrainingRequestDetail>>(
      `${this.baseUrl}/${id}/redirect`,
      {},
    );
  }

  respond(
    id: number,
    dto: RespondTrainingRequestDto,
  ): Observable<ApiResponse<TrainingRequestDetail>> {
    return this.http.post<ApiResponse<TrainingRequestDetail>>(
      `${this.baseUrl}/${id}/respond`,
      dto,
    );
  }

  convertToTraining(
    id: number,
    dto: ConvertRequestToTrainingDto,
  ): Observable<ApiResponse<TrainingDetail>> {
    return this.http.post<ApiResponse<TrainingDetail>>(
      `${this.baseUrl}/${id}/convert`,
      dto,
    );
  }
}
