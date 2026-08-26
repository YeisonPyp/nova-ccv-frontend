import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface Salary {
  id: number;
  year: number;
  smmlv: number;
  transportAllowance: number;
  integralSalaryFactor: number;
  employeeHealthPct: number;
  employeePensionPct: number;
  employerHealthPct: number;
  employerPensionPct: number;
  arlPct: number;
  senaPct: number;
  icbfPct: number;
  compensationBoxPct: number;
  uvt: number;
  effectiveFrom: string;
  effectiveTo: string;
  createdAt: string;
}

@Injectable({
  providedIn: "root",
})
export class SalaryService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/salary-parameters`;

  getSalaryForYear(year?: number) {
    year ??= new Date().getFullYear();
    return this.http.get<ApiResponse<Salary>>(`${this.API_URL}/year/${year}`);
  }
}
