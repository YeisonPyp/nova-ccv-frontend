import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { AccountingPeriod } from "../../models/billing/billing-params.model";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

export interface CreateAccountingPeriodDto {
  period: string;
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: "root" })
export class AccountingPeriodService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/accounting-periods`;

  findAll(p: PageableQuery = {}): Observable<ApiResponse<APIPage<AccountingPeriod>>> {
    return this.http.get<ApiResponse<APIPage<AccountingPeriod>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  create(dto: CreateAccountingPeriodDto): Observable<ApiResponse<AccountingPeriod>> {
    return this.http.post<ApiResponse<AccountingPeriod>>(this.apiUrl, dto);
  }

  delete(period: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${period}`);
  }
}
