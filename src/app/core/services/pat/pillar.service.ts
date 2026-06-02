import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatPillar } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

@Injectable({ providedIn: "root" })
export class PillarService extends FilterServiceSpecImpl<PatPillar> {
  constructor() {
    super("pat/v2/pillars");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatPillar>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatPillar>,
  ) {
    return new SearchSelectContextFactory<PatPillar>(
      (term) => {
        const b = builder.or(builder.eq("name", `${term}*`));
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
