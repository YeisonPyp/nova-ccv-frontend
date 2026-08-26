import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatProduct } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { map } from "rxjs";
import { emit } from "@rsql/emitter";

export interface CreatePatProductDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class PatProductService extends FilterServiceSpecImpl<
  PatProduct,
  CreatePatProductDto
> {
  constructor() {
    super("pat/v2/product-catalog");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatProduct>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatProduct>,
  ) {
    return new SearchSelectContextFactory<PatProduct>(
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
