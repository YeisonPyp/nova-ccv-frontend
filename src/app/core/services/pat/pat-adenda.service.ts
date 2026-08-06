import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatAdenda } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

export interface CreatePatAdendaDto {
  name: string;
}

@Injectable({ providedIn: "root" })
export class PatAdendaService extends FilterServiceSpecImpl<
  PatAdenda,
  CreatePatAdendaDto
> {
  constructor() {
    super("pat/v2/adendas");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatAdenda>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatAdenda>,
  ) {
    return new SearchSelectContextFactory<PatAdenda>(
      (term) => {
        const b = builder.eq("name", `*${term}*`);
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: e.name }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
