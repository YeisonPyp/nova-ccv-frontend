import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment.development";
import { ApiResponse } from "../../models/api-response.model";
import { PatAdendaProgramSummary } from "../../models/pat/pat-models";

@Injectable({ providedIn: "root" })
export class PatAdendaProgramSummaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/strategic-programs/adenda-summary`;

  findSummaries(adendaId?: number | null, year?: number | null) {
    let params: Record<string, string> = {};
    if (adendaId != null) params["adendaId"] = String(adendaId);
    if (year != null) params["year"] = String(year);
    return this.http.get<ApiResponse<PatAdendaProgramSummary[]>>(
      this.baseUrl,
      { params },
    );
  }
}
