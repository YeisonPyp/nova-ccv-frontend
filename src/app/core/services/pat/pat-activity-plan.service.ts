import { Injectable } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PageableQueryWithRsql } from "@/app/shared/components/pagination-table/pagination-table.component";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { FilterServiceSpec } from "@/app/shared/components/pagination-table/pagination-table.component";

export interface PatActivityPlan {
  id: number;
  activityId: number;
  plannedBenefit: number;
  plannedBudget: number;
  plannedMeasurementGoal: number;
  plannedIndicatorGoal: number;
  month: number;
  createdAt: string;
  user: any;
}

export interface CreatePatActivityPlanDto {
  activityId: number;
  plannedBenefit: number;
  plannedBudget: number;
  plannedMeasurementGoal: number;
  plannedIndicatorGoal: number;
  month: number;
}

@Injectable({
  providedIn: "root",
})
export class PatActivityPlanService extends FilterServiceSpecImpl<
  PatActivityPlan,
  CreatePatActivityPlanDto
> {
  constructor() {
    super("pat/activity-plans");
  }
}

export class PatActivityPlanServiceByActivityId implements FilterServiceSpec {
  constructor(
    private patActivityPlanService: PatActivityPlanService,
    private activityId: number,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatActivityPlan>>> {
    pageable.rsqlQuery = pageable.rsqlQuery
      ? `${pageable.rsqlQuery} and activityId==${this.activityId}`
      : `activityId==${this.activityId}`;
    return this.patActivityPlanService.findAll(pageable);
  }
}
