import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { ExecutionOrPlaning } from '../../models/pat/pat-models';

@Injectable({ providedIn: 'root' })
export class PatTaskMonthlyOverviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/tasks`;

  findOverview(
    taskId: number,
  ): Observable<ApiResponse<ExecutionOrPlaning[]>> {
    return this.http.get<ApiResponse<ExecutionOrPlaning[]>>(
      `${this.baseUrl}/${taskId}/monthly-overview`,
    );
  }
}
