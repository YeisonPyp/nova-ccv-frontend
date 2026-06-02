import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface PatMonthlyKpiView {
  month: number;
  year: number;
  plannedBudget: number;
  plannedBenefit: number;
  plannedMeasurement: number;
  plannedIndicator: number;
  executedBudget: number;
  executedBenefit: number;
  executedMeasurement: number;
  executedIndicator: number;
}

export interface PatAreaExecutionView {
  areaId: number;
  area: {
    id: number;
    name: string;
  };
  year: number;
  activitiesCount: number;
  plannedGoal: number;
  executedGoal: number;
  executedBudget: number;
  approvedBudget: number;
}

export interface PatPerformanceKpiResponse {
  monthlyKpis: PatMonthlyKpiView[];
  areaPerformances: PatAreaExecutionView[];
}

@Injectable({
  providedIn: "root",
})
export class PatPerformanceKpiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pat/v2/kpis/performance`;

  getPerformanceByYear(year: number): Observable<ApiResponse<PatPerformanceKpiResponse>> {
    return this.http.get<ApiResponse<PatPerformanceKpiResponse>>(`${this.apiUrl}/${year}`);
  }
}
