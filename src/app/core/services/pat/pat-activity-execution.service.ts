import { Injectable } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";

export interface PatActivityExecution {
  id: number;
  activityId: number;
  executedBudget: number;
  executedBenefit: number;
  executedMeasurementGoal: number;
  executedIndicatorGoal: number;
  month: number;
  description: string;
  createdAt: string;
}

export interface CreatePatActivityExecutionDto {
  activityId: number;
  executedBudget: number;
  executedBenefit: number;
  executedIndicator: number;
  executedMeasurement: number;
  month: number;
  description?: string;
}

@Injectable({
  providedIn: "root",
})
export class PatActivityExecutionService extends FilterServiceSpecImpl<
  PatActivityExecution,
  CreatePatActivityExecutionDto
> {
  constructor() {
    super("pat/v2/activity/executions");
  }
}

export class PatActivityExecutionServiceByActivityId implements FilterServiceSpec {
  constructor(
    private patActivityExecutionService: PatActivityExecutionService,
    private activityId: number,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatActivityExecution>>> {
    pageable.rsqlQuery = pageable.rsqlQuery
      ? `${pageable.rsqlQuery} and activityId==${this.activityId}`
      : `activityId==${this.activityId}`;
    return this.patActivityExecutionService.findAll(pageable);
  }
}
