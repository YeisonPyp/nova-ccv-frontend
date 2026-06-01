import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatCualitativeIndicator } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";

export interface CreatePatIndicatorDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class CualitativeIndicatorService extends FilterServiceSpecImpl<
  PatCualitativeIndicator,
  CreatePatIndicatorDto
> {
  constructor() {
    super("pat/v2/cualitative-indicators");
  }
}
