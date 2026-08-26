import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { ArlEntity } from "../../models/contract/contract-params.model";

@Injectable({
  providedIn: "root",
})
export class ArlEntityService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/arl-entities`;

  findAll() {
    return this.http.get<ApiResponse<ArlEntity[]>>(this.API_URL);
  }
}
