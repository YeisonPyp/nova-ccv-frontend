import { APIPage } from "@/app/core/models/api-page.model";
import { ApiResponse } from "@/app/core/models/api-response.model";
import { Observable } from "rxjs/internal/Observable";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "../components/pagination-table/pagination-table.component";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment.development";
import { PageableQueryParams } from "../pageable-query";

export abstract class FilterServiceSpecImpl<T> implements FilterServiceSpec {
  protected http = inject(HttpClient);
  protected baseUrl: string;
  constructor(endpoint: string) {
    if (endpoint.startsWith("/")) endpoint = endpoint.substring(1);
    this.baseUrl = `${environment.apiUrl}/${endpoint}`;
  }
  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<T>>> {
    return this.http.get<ApiResponse<APIPage<T>>>(this.baseUrl, {
      params: new PageableQueryParams(pageable).getParams(),
    });
  }
}
