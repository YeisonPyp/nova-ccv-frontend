import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { ContractSeeding } from "../../models/contract/contract-seeding.model";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class ContractSeedingService implements FilterServiceSpec {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(
    p: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<ContractSeeding>>> {
    const params: Record<string, any> = new PageableQueryParams(p).getParams();
    return this.http.get<ApiResponse<APIPage<ContractSeeding>>>(
      `${this.base}/contract-seedings`,
      { params },
    );
  }

  findById(id: string): Observable<ApiResponse<ContractSeeding>> {
    return this.http.get<ApiResponse<ContractSeeding>>(
      `${this.base}/contract-seedings/${id}`,
    );
  }

  seedFromPdf(file: File): Observable<ApiResponse<ContractSeeding>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<ApiResponse<ContractSeeding>>(
      `${this.base}/contract-seedings`,
      formData,
    );
  }
}
