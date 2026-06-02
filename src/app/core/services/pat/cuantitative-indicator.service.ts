import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import {
  PatCuantitativeIndicator,
  PatMeasurement,
} from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { map } from "rxjs";

export interface CreatePatIndicatorDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class CuantitativeIndicatorService extends FilterServiceSpecImpl<
  PatCuantitativeIndicator,
  CreatePatIndicatorDto
> {
  constructor() {
    super("pat/v2/cuantitative-indicators");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatCuantitativeIndicator>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatCuantitativeIndicator>,
  ) {
    return new SearchSelectContextFactory<PatCuantitativeIndicator>(
      (term) => {
        const b = builder.or(
          builder.eq("name", `*${term}*`),
          builder.eq("description", `*${term}*`),
        );
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
