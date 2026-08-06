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
  code?: string;
  adendaId: number;
  startsAt: string;
  endsAt: string;
  unitMeasureId: number;
  goalValue?: number;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class PatProgramService extends FilterServiceSpecImpl<
  PatStrategicProgram,
  CreatePatProgramDto
> {
  constructor() {
    super("pat/v2/strategic-programs");
  }

  getServiceByAdenda(adendaId: number | null | undefined) {
    return new PatProgramByAdendaService(this, adendaId);
  }
}

export class PatProgramByAdendaService implements FilterServiceSpec {
  constructor(
    private service: PatProgramService,
    private adendaId?: number | null,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatStrategicProgram>>> {
    if (this.adendaId) {
      pageable.rsqlQuery = pageable.rsqlQuery
        ? `${pageable.rsqlQuery} and adenda.id==${this.adendaId}`
        : `adenda.id==${this.adendaId}`;
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
        const nameFilter = builder.eq("name", `*${term}*`);
        const b = this.adendaId
          ? builder.and(nameFilter, builder.eq("adenda.id", `${this.adendaId}`))
          : nameFilter;
        return this.service
          .findAll({ rsqlQuery: emit(b) })
          .pipe(map((res) => res?.data?.content ?? []));
      },
      (e) => ({ id: e.id, title: e.name }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
