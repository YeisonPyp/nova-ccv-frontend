import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatStrategicProgram } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { Observable } from "rxjs/internal/Observable";
import { APIPage } from "../../models/api-page.model";
import { ApiResponse } from "../../models/api-response.model";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { map } from "rxjs";

export interface CreatePatProgramDto {
  name: string;
  description?: string;
  year?: number;
  pillarId: number;
}

@Injectable({ providedIn: "root" })
export class PatProgramService extends FilterServiceSpecImpl<
  PatStrategicProgram,
  CreatePatProgramDto
> {
  constructor() {
    super("pat/v2/strategic-programs");
  }

  getServiceByYear(year: number) {
    return new PatProgramByYearService(this, year);
  }
}

export class PatProgramByYearService implements FilterServiceSpec {
  constructor(
    private service: PatProgramService,
    private year?: number,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatStrategicProgram>>> {
    if (this.year) {
      pageable.rsqlQuery = pageable.rsqlQuery
        ? `${pageable.rsqlQuery} and year==${this.year}`
        : `year==${this.year}`;
    }
    return this.service.findAll(pageable);
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatStrategicProgram>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatStrategicProgram>,
  ) {
    return new SearchSelectContextFactory<PatStrategicProgram>(
      (term) => {
        const b = builder.or(builder.eq("name", `*${term}*`));
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.name ?? ""}` }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
