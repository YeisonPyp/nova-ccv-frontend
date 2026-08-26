import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ImprovementPlanMetrics } from "../../models/improvement-plan/improvement-plan-metrics.model";

@Injectable({
  providedIn: "root",
})
export class ImprovementPlanMetricsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/improvement-plan-metrics`;

  getMetrics(): Observable<ApiResponse<ImprovementPlanMetrics>> {
    return this.http.get<ApiResponse<ImprovementPlanMetrics>>(this.apiUrl);
  }
}
