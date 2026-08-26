import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { ImpactRule } from "../../models/assessment/impact-rule.model";

export interface FindImpactRulesQuery extends PageableQuery {
  name?: string;
  competencyId?: number;
}

export interface CreateRuleDto {
  competencieIds: Array<number>;
  impactFactor: number;
  name: string;
}

export interface UpdateRuleDto {
  name?: string;
  impactFactor?: number;
  competencieIds?: Array<number>;
}

@Injectable({
  providedIn: "root",
})
export class ImpactRuleService {
  private readonly API_URL = `${environment.apiUrl}/impact-rules`;
  private http = inject(HttpClient);

  findRules(
    q: FindImpactRulesQuery,
  ): Observable<ApiResponse<APIPage<ImpactRule>>> {
    const params = new PageableQueryParams(q).getParams();
    return this.http.get<ApiResponse<APIPage<ImpactRule>>>(`${this.API_URL}`, {
      params,
    });
  }

  createRule(dto: CreateRuleDto) {
    return this.http.post<ApiResponse<ImpactRule>>(`${this.API_URL}`, dto);
  }

  deleteRule(id: number) {
    return this.http.delete<ApiResponse<ImpactRule>>(`${this.API_URL}/${id}`);
  }

  updateRule(id: number, dto: UpdateRuleDto) {
    return this.http.patch<ApiResponse<ImpactRule>>(
      `${this.API_URL}/${id}`,
      dto,
    );
  }
}
