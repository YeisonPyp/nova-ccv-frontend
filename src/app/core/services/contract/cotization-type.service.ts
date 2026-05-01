import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface CotizationType {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class CotizationTypeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cotization-types/`;

  getCotizationTypes() {
    return this.http.get<ApiResponse<CotizationType[]>>(this.API_URL);
  }
}
