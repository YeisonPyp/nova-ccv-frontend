import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  CreateFindingDto,
  FindingDto,
  UpdateFindingDto,
} from "../../models/improvement-plan/finding.model";
import { ApiResponse } from "../../models/api-response.model";

@Injectable({
  providedIn: "root",
})
export class FindingService {
  private apiUrl = `${environment.apiUrl}/finding`;

  constructor(private http: HttpClient) {}

  findByPlanId(planId: number): Observable<ApiResponse<FindingDto[]>> {
    return this.http.get<ApiResponse<FindingDto[]>>(
      `${this.apiUrl}/plan/${planId}`,
    );
  }

  findById(id: number): Observable<ApiResponse<FindingDto>> {
    return this.http.get<ApiResponse<FindingDto>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateFindingDto): Observable<ApiResponse<FindingDto>> {
    return this.http.post<ApiResponse<FindingDto>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: UpdateFindingDto,
  ): Observable<ApiResponse<FindingDto>> {
    return this.http.put<ApiResponse<FindingDto>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  deleteById(id: number): Observable<ApiResponse<FindingDto>> {
    return this.http.delete<ApiResponse<FindingDto>>(`${this.apiUrl}/${id}`);
  }
}
