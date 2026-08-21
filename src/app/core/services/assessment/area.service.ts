import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  Area,
  AreaTreeNode,
  AreaType,
} from "../../models/assessment/area.model";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "../../../shared/components/search-select/on-search-select.interface";

export interface CreateAreaDto {
  name: string;
  type?: AreaType;
  parentId?: number | null;
}

export interface FindAreasPageableQuery extends PageableQuery {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class AreaService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/area`;

  list(type?: AreaType): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(`${this.API_URL}/list`, {
      params: type ? { type } : {},
    });
  }

  /** Whole organizational chart, roots first, descendants nested. */
  tree(): Observable<ApiResponse<AreaTreeNode[]>> {
    return this.http.get<ApiResponse<AreaTreeNode[]>>(`${this.API_URL}/tree`);
  }

  children(id: number): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(`${this.API_URL}/${id}/children`);
  }

  findAreas(query: FindAreasPageableQuery): Observable<ApiResponse<APIPage<Area>>> {
    return this.http.get<ApiResponse<APIPage<Area>>>(this.API_URL, {
      params: new PageableQueryParams(query).getParams(),
    });
  }

  createArea(dto: CreateAreaDto): Observable<ApiResponse<Area>> {
    return this.http.post<ApiResponse<Area>>(this.API_URL, dto);
  }

  updateArea(id: number, dto: CreateAreaDto): Observable<ApiResponse<Area>> {
    return this.http.put<ApiResponse<Area>>(`${this.API_URL}/${id}`, dto);
  }

  deleteArea(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  newSearchSelectAreaContext(
    onSelectCallback?: OnSelectCallback<Area>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<Area>,
  ) {
    return new SearchSelectContextFactory<Area>(
      (term) =>
        this.findAreas({ name: term }).pipe(
          map((res) => res?.data?.content ?? []),
        ),
      (a) => ({ id: a.id, title: a.name }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
