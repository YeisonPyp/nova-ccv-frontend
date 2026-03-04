import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Competencie } from "../../models/assessment/competencie.model";

export interface CompetenciePaginatedQuery extends PageableQuery {
  name?: string;
}

export const CompetencyEnum = {
  BEHAVIORAL: "BEHAVIORAL",
  TECHNICAL: "TECHNICAL",
  CORE: "CORE",
} as const;

export type CompetencyType =
  (typeof CompetencyEnum)[keyof typeof CompetencyEnum];

export interface CreateCompetencyDto {
  name: string;
  type: CompetencyType;
  description: string;
  positions: Array<number>;
}

@Injectable({
  providedIn: "root",
})
export class CompetencieService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/area`;

  getCompetencies(
    q: CompetenciePaginatedQuery,
  ): Observable<ApiResponse<APIPage<Competencie>>> {
    const params = new PageableQueryParams(q).getParams();
    if (q.name) params.append("name", q.name);

    return this.http.get<ApiResponse<APIPage<Competencie>>>(
      `${this.API_URL}/competencies`,
      { params },
    );
  }

  createCompetency(
    dto: CreateCompetencyDto,
  ): Observable<ApiResponse<Competencie>> {
    return this.http.post<ApiResponse<Competencie>>(
      `${this.API_URL}/competencies`,
      dto,
    );
  }
}
