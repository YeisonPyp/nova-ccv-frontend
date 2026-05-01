import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface CompensationEntity {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class CompensationEntityService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/compensation-entities/`;

  getCompensationEntities() {
    return this.http.get<ApiResponse<CompensationEntity[]>>(this.API_URL);
  }
}
