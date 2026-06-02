import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatMeasurement } from "../../models/pat/pat-models";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { map } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class MeasurementService extends FilterServiceSpecImpl<PatMeasurement> {
  constructor() {
    super("pat/v2/measurements");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatMeasurement>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatMeasurement>,
  ) {
    return new SearchSelectContextFactory<PatMeasurement>(
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
