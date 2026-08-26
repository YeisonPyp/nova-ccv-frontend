import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  FilingDocumentType,
  CreateFilingDocumentTypeDto,
} from "../../models/filing/filing.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class FilingDocumentTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/filing-document-types`;

  findAll(
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<FilingDocumentType>>> {
    return this.http.get<ApiResponse<APIPage<FilingDocumentType>>>(
      this.apiUrl,
      {
        params: new PageableQueryParams(p).getParams(),
      },
    );
  }

  findById(id: number): Observable<ApiResponse<FilingDocumentType>> {
    return this.http.get<ApiResponse<FilingDocumentType>>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    dto: CreateFilingDocumentTypeDto,
  ): Observable<ApiResponse<FilingDocumentType>> {
    return this.http.post<ApiResponse<FilingDocumentType>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: CreateFilingDocumentTypeDto,
  ): Observable<ApiResponse<FilingDocumentType>> {
    return this.http.put<ApiResponse<FilingDocumentType>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
