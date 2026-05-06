import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface EpsAfiliation {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class EpsAfiliationService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/eps-affiliation-types`;

  getEpsAfiliations() {
    return this.http.get<ApiResponse<EpsAfiliation[]>>(this.API_URL);
  }
}
