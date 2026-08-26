import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  SeededContract,
  UpdateSeededContractDto,
} from "../../models/contract/seeded-contract.model";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { PageableQueryParams } from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class SeededContractService implements FilterServiceSpec {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(
    p: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<SeededContract>>> {
    const params: Record<string, any> = new PageableQueryParams(p).getParams();
    return this.http.get<ApiResponse<APIPage<SeededContract>>>(
      `${this.base}/seeded-contracts`,
      { params },
    );
  }

  findById(id: string): Observable<ApiResponse<SeededContract>> {
    return this.http.get<ApiResponse<SeededContract>>(
      `${this.base}/seeded-contracts/${id}`,
    );
  }

  update(
    id: string,
    dto: UpdateSeededContractDto,
  ): Observable<ApiResponse<SeededContract>> {
    return this.http.put<ApiResponse<SeededContract>>(
      `${this.base}/seeded-contracts/${id}`,
      dto,
    );
  }
}
