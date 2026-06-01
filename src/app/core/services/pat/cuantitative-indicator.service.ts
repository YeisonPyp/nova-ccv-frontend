import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatCuantitativeIndicator } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";

export interface CreatePatIndicatorDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class CuantitativeIndicatorService extends FilterServiceSpecImpl<
  PatCuantitativeIndicator,
  CreatePatIndicatorDto
> {
  constructor() {
    super("pat/v2/cuantitative-indicators");
  }
}
