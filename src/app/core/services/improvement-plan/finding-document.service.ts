import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  CreateFindingDocumentDto,
  FindingDocumentDto,
} from "../../models/improvement-plan/finding-document.model";
import { ApiResponse } from "../../models/api-response.model";

@Injectable({
  providedIn: "root",
})
export class FindingDocumentService {
  private apiUrl = `${environment.apiUrl}/finding-document`;

  constructor(private http: HttpClient) {}

  findById(id: number): Observable<ApiResponse<FindingDocumentDto>> {
    return this.http.get<ApiResponse<FindingDocumentDto>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateFindingDocumentDto,
  ): Observable<HttpEvent<ApiResponse<FindingDocumentDto>>> {
    const formData = new FormData();
    formData.append("findingId", dto.findingId + "");
    if (dto.description) formData.append("description", dto.description);
    formData.append("file", dto.file);

    const req = new HttpRequest("POST", this.apiUrl, formData, {
      reportProgress: true,
      responseType: "json",
    });

    return this.http.request<ApiResponse<FindingDocumentDto>>(req);
  }

  update(
    id: number,
    dto: CreateFindingDocumentDto,
  ): Observable<HttpEvent<ApiResponse<FindingDocumentDto>>> {
    const formData = new FormData();
    formData.append("findingId", dto.findingId + "");
    if (dto.description) formData.append("description", dto.description);
    formData.append("file", dto.file);

    const req = new HttpRequest("PUT", `${this.apiUrl}/${id}`, formData, {
      reportProgress: true,
      responseType: "json",
    });

    return this.http.request<ApiResponse<FindingDocumentDto>>(req);
  }

  deleteById(id: number): Observable<ApiResponse<FindingDocumentDto>> {
    return this.http.delete<ApiResponse<FindingDocumentDto>>(
      `${this.apiUrl}/${id}`,
    );
  }
}
