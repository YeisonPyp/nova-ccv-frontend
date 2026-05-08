import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { CotizationType } from "../../models/contract/contract-params.model";

@Injectable({
  providedIn: "root",
})
export class CotizationTypeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cotization-types`;

  getCotizationTypes() {
    return this.http.get<ApiResponse<CotizationType[]>>(this.API_URL);
  }
}
