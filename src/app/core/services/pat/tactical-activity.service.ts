import { PatTacticalActivity } from "../../models/pat/pat-models";
import { Injectable, inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { PageableQuery } from "@/app/shared/pageable-query";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { APIPage } from "../../models/api-page.model";
import { PageableQueryWithRsql } from "@/app/shared/components/pagination-table/pagination-table.component";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";

export interface PatTacticalActivityQueryParams extends PageableQuery {
  specificObjectiveId?: number;
  code?: string;
}

export interface CreatePatTacticalActivityDto {
  name: string;
  code?: string;
  description?: string;
  specificObjectiveId: number;
}

@Injectable({
  providedIn: "root",
})
export class PatTacticalActivityService extends FilterServiceSpecImpl<
  PatTacticalActivity,
  CreatePatTacticalActivityDto
> {
  constructor() {
    super("pat/v2/tactical-activities");
  }

  findAllBySpecificObjectiveId(
    specificObjectiveId: number,
  ): Observable<ApiResponse<PatTacticalActivity[]>> {
    return this.http.get<ApiResponse<PatTacticalActivity[]>>(
      `${this.baseUrl}/specific-objective/${specificObjectiveId}`,
    );
  }

  findByQueryParams(
    params: PatTacticalActivityQueryParams,
  ): Observable<ApiResponse<APIPage<PatTacticalActivity>>> {
    const { specificObjectiveId, code, ...pageableQueryParams } = params;
    (pageableQueryParams as PageableQueryWithRsql).rsqlQuery =
      `specificObjectiveId=${specificObjectiveId},code=${code}`;
    return this.findAll(pageableQueryParams);
  }

  newSearchSelectContext(
    year: number,
    onSelectCallback?: OnSelectCallback<PatTacticalActivity>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatTacticalActivity>,
  ) {
    return new SearchSelectContextFactory<PatTacticalActivity>(
      (term) => {
        const b = builder.or(
          builder.eq("name", `*${term}*`),
          builder.eq("description", `*${term}*`),
          builder.eq("year", year),
        );
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.code} ${e.name}` }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
