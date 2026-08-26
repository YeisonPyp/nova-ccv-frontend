import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatPolicy } from "../../models/pat/pat-models";
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
export class PolicyService extends FilterServiceSpecImpl<PatPolicy> {
  constructor() {
    super("pat/v2/policies");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatPolicy>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatPolicy>,
  ) {
    return new SearchSelectContextFactory<PatPolicy>(
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
