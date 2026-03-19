import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  EvidenceDto,
  CreateEvidenceDto,
  UpdateEvidenceDto,
} from "../../models/improvement-plan/evidence.model";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";

@Injectable({
  providedIn: "root",
})
export class EvidenceService {
  private apiUrl = `${environment.apiUrl}/api/evidence`;

  constructor(private http: HttpClient) {}

  findElements(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<APIPage<EvidenceDto>>> {
    return this.http.get<ApiResponse<APIPage<EvidenceDto>>>(
      `${this.apiUrl}?page=${page}&size=${size}`,
    );
  }

  findById(id: number): Observable<ApiResponse<EvidenceDto>> {
    return this.http.get<ApiResponse<EvidenceDto>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEvidenceDto): Observable<ApiResponse<EvidenceDto>> {
    return this.http.post<ApiResponse<EvidenceDto>>(this.apiUrl, dto);
  }

  createMultiple(
    dtos: CreateEvidenceDto[],
  ): Observable<ApiResponse<EvidenceDto[]>> {
    return this.http.post<ApiResponse<EvidenceDto[]>>(
      `${this.apiUrl}/batch`,
      dtos,
    );
  }

  update(
    id: number,
    dto: UpdateEvidenceDto,
  ): Observable<ApiResponse<EvidenceDto>> {
    return this.http.put<ApiResponse<EvidenceDto>>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<ApiResponse<EvidenceDto>> {
    return this.http.delete<ApiResponse<EvidenceDto>>(`${this.apiUrl}/${id}`);
  }
}
