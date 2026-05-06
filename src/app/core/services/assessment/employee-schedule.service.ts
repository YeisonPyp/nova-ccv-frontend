import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { EmployeeSchedule } from "../../models/assessment/employee-schedule.model";

export interface CreateEmployeeScheduleDto {
  employeeId: number;
  weekDay: number;
  utcStartsMinutes: number;
  utcEndsMinutes: number;
}

@Injectable({ providedIn: "root" })
export class EmployeeScheduleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/employee-schedule`;

  findByEmployee(employeeId: number): Observable<ApiResponse<EmployeeSchedule[]>> {
    return this.http.get<ApiResponse<EmployeeSchedule[]>>(this.API_URL, {
      params: { employeeId: employeeId.toString() },
    });
  }

  create(dto: CreateEmployeeScheduleDto): Observable<ApiResponse<EmployeeSchedule>> {
    return this.http.post<ApiResponse<EmployeeSchedule>>(this.API_URL, dto);
  }

  delete(id: number): Observable<ApiResponse<EmployeeSchedule>> {
    return this.http.delete<ApiResponse<EmployeeSchedule>>(`${this.API_URL}/${id}`);
  }
}
