import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { PensionType } from "../../models/contract/contract-params.model";

@Injectable({
  providedIn: "root",
})
export class PensionTypeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/pension-types`;

  getPensionTypes() {
    return this.http.get<ApiResponse<PensionType[]>>(this.API_URL);
  }
}
