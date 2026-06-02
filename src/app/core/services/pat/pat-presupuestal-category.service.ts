import { Injectable } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";

export interface PresupuestalCategory {
  id: number;
  code: string;
  name: string;
  resourceType: string;
  description: string;
  amount: number;
  plannedBudget: number;
  unplannedBudget: number;
}

export interface CreatePresupuestalCategoryDto {
  code: string;
  name: string;
  resourceType: string;
  description: string;
  amount: number;
}

@Injectable({
  providedIn: "root",
})
export class PatPresupuestalCategoryService extends FilterServiceSpecImpl<
  PresupuestalCategory,
  CreatePresupuestalCategoryDto
> {
  constructor() {
    super("pat/v2/presupuestal-categories"); // Assuming this is the standard endpoint based on PAT module naming convention.
  }
}
