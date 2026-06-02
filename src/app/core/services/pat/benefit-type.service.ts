import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatBenefitType } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "@/app/shared/components/search-select/on-search-select.interface";
import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { map } from "rxjs";

@Injectable({ providedIn: "root" })
export class BenefitTypeService extends FilterServiceSpecImpl<PatBenefitType> {
  constructor() {
    super("pat/v2/benefit-types");
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatBenefitType>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatBenefitType>,
  ) {
    return new SearchSelectContextFactory<PatBenefitType>(
      (term) => {
        const b = builder.or(builder.eq("name", `*${term}*`));
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
