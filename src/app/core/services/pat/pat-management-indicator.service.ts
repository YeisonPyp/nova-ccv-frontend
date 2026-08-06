import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatManagementIndicator } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

export interface CreatePatManagementIndicatorDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class PatManagementIndicatorService extends FilterServiceSpecImpl<
  PatManagementIndicator,
  CreatePatManagementIndicatorDto
> {
  constructor() {
    super("pat/v2/management-indicators");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatManagementIndicator>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatManagementIndicator>,
  ) {
    return new SearchSelectContextFactory<PatManagementIndicator>(
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
