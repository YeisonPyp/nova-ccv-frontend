import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import {
  ControlEntity,
  CreateControlEntityDto,
  UpdateControlEntityDto,
} from "../../models/improvement-plan/control-entity.model";
import { APIPage } from "../../models/api-page.model";
import { OnSelectCallback, SearchSelectContextFactory, SearchSelectContextFactoryOptions } from "../../../shared/components/search-select/on-search-select.interface";
import { PageableQuery, PageableQueryParams } from "../../../shared/pageable-query";

export interface PageableControlEntityParams extends PageableQuery {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class ControlEntityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/improvement-plan/control-entity`;

  findAll(
    p: PageableControlEntityParams
  ): Observable<ApiResponse<APIPage<ControlEntity>>> {
    const params = new PageableQueryParams(p).getParams();

    return this.http.get<ApiResponse<APIPage<ControlEntity>>>(this.apiUrl, {
      params,
    });
  }

  findById(id: number): Observable<ApiResponse<ControlEntity>> {
    return this.http.get<ApiResponse<ControlEntity>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateControlEntityDto): Observable<ApiResponse<ControlEntity>> {
    return this.http.post<ApiResponse<ControlEntity>>(this.apiUrl, dto);
  }

  update(
    id: number,
    dto: UpdateControlEntityDto,
  ): Observable<ApiResponse<ControlEntity>> {
    return this.http.put<ApiResponse<ControlEntity>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<ControlEntity>> {
    return this.http.delete<ApiResponse<ControlEntity>>(`${this.apiUrl}/${id}`);
  }

  newSearchSelectControlEntityContext(onSelectCallback?: OnSelectCallback<ControlEntity>, op?: SearchSelectContextFactoryOptions) {
    return new SearchSelectContextFactory<ControlEntity>(
      (term) => {
        return this.findAll({ name: term }).pipe(map((res) => res?.data?.content ?? []));
      },
      (e) => ({ id: e.id, title: e.name }),
      onSelectCallback,
      op
    );
  }
}
