import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Agency } from "../../models/contract/agency.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "../../../shared/components/search-select/on-search-select.interface";

export interface AgencyQuery extends PageableQuery {
  name?: string;
}

@Injectable({ providedIn: "root" })
export class AgencyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agencies`;

  findAll(q: AgencyQuery = {}): Observable<ApiResponse<APIPage<Agency>>> {
    const params: Record<string, any> = new PageableQueryParams(q).getParams();
    if (q.name) params["name"] = q.name;
    return this.http.get<ApiResponse<APIPage<Agency>>>(this.apiUrl, { params });
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<Agency>,
    op?: SearchSelectContextFactoryOptions,
  ) {
    return new SearchSelectContextFactory<Agency>(
      (term) =>
        this.findAll({ name: term }).pipe(
          map((res) => res?.data?.content ?? []),
        ),
      (a) => ({ id: a.id, title: a.name }),
      onSelectCallback,
      op,
    );
  }
}
