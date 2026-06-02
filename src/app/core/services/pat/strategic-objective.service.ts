import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { ApiResponse } from "@/app/core/models/api-response.model";
import { APIPage } from "@/app/core/models/api-page.model";
import { PatStrategicObjective } from "@/app/core/models/pat/pat-models";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";

export interface CreatePatStrategicObjectiveDto {
  name: string;
  code?: string;
  year: number;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class PatStrategicObjectiveService extends FilterServiceSpecImpl<
  PatStrategicObjective,
  CreatePatStrategicObjectiveDto
> {
  constructor() {
    super("pat/v2/strategic-objectives");
  }

  getServiceByYear(year: number) {
    return new PatStrategicObjectiveByYearService(this, year);
  }
}

export class PatStrategicObjectiveByYearService implements FilterServiceSpec {
  constructor(
    private service: PatStrategicObjectiveService,
    private year?: number,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatStrategicObjective>>> {
    if (this.year) {
      pageable.rsqlQuery = pageable.rsqlQuery
        ? `${pageable.rsqlQuery} and year==${this.year}`
        : `year==${this.year}`;
    }
    return this.service.findAll(pageable);
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatStrategicObjective>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatStrategicObjective>,
  ) {
    return new SearchSelectContextFactory<PatStrategicObjective>(
      (term) => {
        const b = builder.or(
          builder.eq("name", `*${term}*`),
          builder.eq("code", `*${term}*`),
        );
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.code ?? ""} ${e.name ?? ""}`.trim() }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
