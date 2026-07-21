import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  AssessmentAnswerComment,
  RejectionLevel,
} from '../../models/assessment/assessment.model';

export interface CreateAnswerCommentDto {
  answerId: number;
  comment: string;
  rejectionLevel: RejectionLevel;
}

@Injectable({ providedIn: 'root' })
export class AssessmentCommentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/assessment-answer-comments`;

  create(
    dto: CreateAnswerCommentDto,
  ): Observable<ApiResponse<AssessmentAnswerComment>> {
    return this.http.post<ApiResponse<AssessmentAnswerComment>>(
      this.apiUrl,
      dto,
    );
  }

  reply(
    id: number,
    reply: string,
  ): Observable<ApiResponse<AssessmentAnswerComment>> {
    return this.http.post<ApiResponse<AssessmentAnswerComment>>(
      `${this.apiUrl}/${id}/reply`,
      { reply },
    );
  }
}
