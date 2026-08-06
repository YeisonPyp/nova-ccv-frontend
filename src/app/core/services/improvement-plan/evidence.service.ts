import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EvidenceDto,
  CreateEvidenceDto,
} from '../../models/improvement-plan/evidence.model';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';

@Injectable({
  providedIn: 'root',
})
export class EvidenceService {
  private apiUrl = `${environment.apiUrl}/evidence`;

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

  create(
    dto: CreateEvidenceDto,
  ): Observable<HttpEvent<ApiResponse<EvidenceDto>>> {
    const formData = new FormData();
    formData.append('actionId', dto.followUpId + '');
    if (dto.description) formData.append('description', dto.description);
    formData.append('file', dto.file);

    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request<ApiResponse<EvidenceDto>>(req);
  }

  update(
    id: number,
    dto: CreateEvidenceDto,
  ): Observable<HttpEvent<ApiResponse<EvidenceDto>>> {
    const formData = new FormData();
    formData.append('followUpId', dto.followUpId + '');
    if (dto.description) formData.append('description', dto.description);
    formData.append('file', dto.file);

    const req = new HttpRequest('PUT', `${this.apiUrl}/${id}`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request<ApiResponse<EvidenceDto>>(req);
  }

  deleteById(id: number): Observable<ApiResponse<EvidenceDto>> {
    return this.http.delete<ApiResponse<EvidenceDto>>(`${this.apiUrl}/${id}`);
  }
}
