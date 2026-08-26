import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatAdendaContext } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

export interface CreatePatAdendaContextDto {
  year: number;
  name: string;
  programPrefix: string;
}

@Injectable({ providedIn: "root" })
export class PatAdendaContextService extends FilterServiceSpecImpl<
  PatAdendaContext,
  CreatePatAdendaContextDto
> {
  constructor() {
    super("pat/v2/adenda-contexts");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatAdendaContext>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatAdendaContext>,
  ) {
    return new SearchSelectContextFactory<PatAdendaContext>(
      (term) => {
        const b = builder.eq("name", `*${term}*`);
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.name} (${e.year})` }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
