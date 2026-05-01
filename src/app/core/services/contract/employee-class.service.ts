import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface EmployeeClass {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class EmployeeClassService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/employee-classes/`;

  getEmployeeClasses() {
    return this.http.get<ApiResponse<EmployeeClass[]>>(this.API_URL);
  }
}
