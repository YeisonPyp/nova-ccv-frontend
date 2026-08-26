import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { EpsEntity } from "../../models/contract/contract-params.model";

@Injectable({
  providedIn: "root",
})
export class EpsEntityService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/eps-entities`;

  getEpsEntities() {
    return this.http.get<ApiResponse<EpsEntity[]>>(this.API_URL);
  }
}
