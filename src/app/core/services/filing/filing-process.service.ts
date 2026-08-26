import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  FilingProcess,
  CreateFilingProcessDto,
} from "../../models/filing/filing.models";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class FilingProcessService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/filing-processes`;

  findAll(
    p: PageableQuery = {},
  ): Observable<ApiResponse<APIPage<FilingProcess>>> {
    return this.http.get<ApiResponse<APIPage<FilingProcess>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  findById(id: number): Observable<ApiResponse<FilingProcess>> {
    return this.http.get<ApiResponse<FilingProcess>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateFilingProcessDto): Observable<ApiResponse<FilingProcess>> {
    return this.http.post<ApiResponse<FilingProcess>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: CreateFilingProcessDto,
  ): Observable<ApiResponse<FilingProcess>> {
    return this.http.put<ApiResponse<FilingProcess>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
