import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Injectable } from "@angular/core";
import { PatSpecificObjective } from "../../models/pat/pat-models";

@Injectable({
  providedIn: "root",
})
export class PatSpecificObjectiveService extends FilterServiceSpecImpl<PatSpecificObjective> {
  constructor() {
    super("pat/v2/specific-objectives");
  }
}
