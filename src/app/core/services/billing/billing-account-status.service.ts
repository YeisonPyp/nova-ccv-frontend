import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { BillingAccountStatus } from "../../models/billing/billing-params.model";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class BillingAccountStatusParamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/billing-account-statuses`;

  findAll(p: PageableQuery = {}): Observable<ApiResponse<APIPage<BillingAccountStatus>>> {
    return this.http.get<ApiResponse<APIPage<BillingAccountStatus>>>(this.apiUrl, {
      params: new PageableQueryParams(p).getParams(),
    });
  }

  create(name: string): Observable<ApiResponse<BillingAccountStatus>> {
    return this.http.post<ApiResponse<BillingAccountStatus>>(this.apiUrl, { name });
  }
}
