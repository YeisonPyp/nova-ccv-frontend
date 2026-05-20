import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { Schedule, ScheduleDay } from "../../models/assessment/schedule.model";

export interface CreateScheduleDto {
  name: string;
  description?: string;
}

export interface UpdateScheduleDto {
  name?: string;
  description?: string;
}

export interface CreateScheduleDayDto {
  scheduleId: number;
  weekDay: number;
  utcStartsMinutes: number;
  utcEndsMinutes: number;
}

export interface UpdateScheduleDayDto {
  utcStartsMinutes?: number;
  utcEndsMinutes?: number;
}

@Injectable({ providedIn: "root" })
export class ScheduleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/employee-schedule`;

  findAll(): Observable<ApiResponse<Schedule[]>> {
    return this.http.get<ApiResponse<Schedule[]>>(this.API_URL);
  }

  create(dto: CreateScheduleDto): Observable<ApiResponse<Schedule>> {
    return this.http.post<ApiResponse<Schedule>>(this.API_URL, dto);
  }

  update(id: number, dto: UpdateScheduleDto): Observable<ApiResponse<Schedule>> {
    return this.http.patch<ApiResponse<Schedule>>(`${this.API_URL}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  createDay(dto: CreateScheduleDayDto): Observable<ApiResponse<ScheduleDay>> {
    return this.http.post<ApiResponse<ScheduleDay>>(`${this.API_URL}/days`, dto);
  }

  updateDay(id: number, dto: UpdateScheduleDayDto): Observable<ApiResponse<ScheduleDay>> {
    return this.http.patch<ApiResponse<ScheduleDay>>(`${this.API_URL}/days/${id}`, dto);
  }

  deleteDay(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/days/${id}`);
  }
}
