// src/app/services/pat/activity.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Activity, 
  ActivityWithMetrics, 
  CreateActivityRequest,
  BudgetItem,
  CreateBudgetItemRequest
} from '../models/activity.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/pat/activities`;

  getActivitiesByProgram(programId: number): Observable<ApiResponse<Activity[]>> {
    return this.http.get<ApiResponse<Activity[]>>(
      `${this.apiUrl}/program/${programId}`
    );
  }

  getActivitiesWithMetrics(programId: number): Observable<ApiResponse<ActivityWithMetrics[]>> {
    return this.http.get<ApiResponse<ActivityWithMetrics[]>>(
      `${this.apiUrl}/program/${programId}/with-metrics`
    );
  }

  getActivityById(id: number): Observable<ApiResponse<Activity>> {
    return this.http.get<ApiResponse<Activity>>(`${this.apiUrl}/${id}`);
  }

  createActivity(request: CreateActivityRequest): Observable<ApiResponse<Activity>> {
    return this.http.post<ApiResponse<Activity>>(this.apiUrl, request);
  }

  deleteActivity(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Budget methods
  getBudget(activityId: number): Observable<ApiResponse<BudgetItem[]>> {
    return this.http.get<ApiResponse<BudgetItem[]>>(
      `${this.apiUrl}/${activityId}/budget`
    );
  }

  createBudgetItem(request: CreateBudgetItemRequest): Observable<ApiResponse<BudgetItem>> {
    return this.http.post<ApiResponse<BudgetItem>>(
      `${this.apiUrl}/budget`, 
      request
    );
  }

  deleteBudgetItem(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/budget/${id}`);
  }
}