import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { PeriodCharts } from "../../models/assessment/period-charts.model";

@Injectable({ providedIn: "root" })
export class PeriodChartsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/assessment-periods`;

  getCharts(periodId: number): Observable<ApiResponse<PeriodCharts>> {
    return this.http.get<ApiResponse<PeriodCharts>>(
      `${this.apiUrl}/${periodId}/charts`,
    );
  }
}
