import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Injectable } from "@angular/core";
import { PatSpecificObjective } from "../../models/pat/pat-models";

export interface CreatePatSpecificObjectiveDto {
  name: string;
  code?: string;
  description?: string;
  year: number;
  strategicObjectiveId: number;
}

@Injectable({
  providedIn: "root",
})
export class PatSpecificObjectiveService extends FilterServiceSpecImpl<
  PatSpecificObjective,
  CreatePatSpecificObjectiveDto
> {
  constructor() {
    super("pat/v2/specific-objectives");
  }
}
