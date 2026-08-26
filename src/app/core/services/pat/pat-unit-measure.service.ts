import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatUnitMeasure } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

export interface CreatePatUnitMeasureDto {
  name: string;
}

@Injectable({ providedIn: "root" })
export class PatUnitMeasureService extends FilterServiceSpecImpl<
  PatUnitMeasure,
  CreatePatUnitMeasureDto
> {
  constructor() {
    super("pat/v2/unit-measures");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatUnitMeasure>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatUnitMeasure>,
  ) {
    return new SearchSelectContextFactory<PatUnitMeasure>(
      (term) => {
        const b = builder.eq("name", `*${term}*`);
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
