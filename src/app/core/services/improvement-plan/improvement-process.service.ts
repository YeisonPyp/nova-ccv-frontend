import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ImprovementProcess,
  CreateImprovementProcessDto,
  UpdateImprovementProcessDto,
} from "../../models/improvement-plan/improvement-process.model";
import { APIPage } from "../../models/api-page.model";
import { OnSelectCallback, SearchSelectContextFactory, SearchSelectContextFactoryOptions } from "../../../shared/components/search-select/on-search-select.interface";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

export interface PageableImprovementProcessParams extends PageableQuery {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class ImprovementProcessService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/improvement-plan/process`;

  findAll(
    p: PageableImprovementProcessParams
  ): Observable<ApiResponse<APIPage<ImprovementProcess>>> {
    const params = new PageableQueryParams(p).getParams();

    return this.http.get<ApiResponse<APIPage<ImprovementProcess>>>(this.apiUrl, {
      params,
    });
  }

  findAllList(): Observable<ApiResponse<ImprovementProcess[]>> {
    return this.http.get<ApiResponse<ImprovementProcess[]>>(`${this.apiUrl}/all`);
  }

  findById(id: number): Observable<ApiResponse<ImprovementProcess>> {
    return this.http.get<ApiResponse<ImprovementProcess>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateImprovementProcessDto): Observable<ApiResponse<ImprovementProcess>> {
    return this.http.post<ApiResponse<ImprovementProcess>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: UpdateImprovementProcessDto,
  ): Observable<ApiResponse<ImprovementProcess>> {
    return this.http.put<ApiResponse<ImprovementProcess>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<ImprovementProcess>> {
    return this.http.delete<ApiResponse<ImprovementProcess>>(`${this.apiUrl}/${id}`);
  }

  newSearchSelectProcessContext(onSelectCallback?: OnSelectCallback<ImprovementProcess>, op?: SearchSelectContextFactoryOptions) {
    return new SearchSelectContextFactory<ImprovementProcess>(
      (term) => {
        return this.findAll({ name: term }).pipe(map((res) => res?.data?.content ?? []));
      },
      (e) => ({ id: e.id, title: `${e.name} (${e.code})` }),
      onSelectCallback,
      op
    );
  }
}
