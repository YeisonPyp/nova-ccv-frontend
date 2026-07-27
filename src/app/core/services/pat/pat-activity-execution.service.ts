import { Injectable } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  ActivityBudgetExecution,
  PatActivityExecution,
} from "../../models/pat/pat-models";

export interface CreatePatActivityExecutionDto {
  activityId: number;
  executedBenefit: number;
  executedIndicator: number;
  executedMeasurement: number;
  month: number;
  description?: string;
}

export interface SaveActivityBudgetExecution {
  amount: number;
  activityId: number;
  month: number;
  budgetCategoryId: number;
}

export interface ActivityProductMatrixRow {
  productId: number;
  code: string;
  name: string;
  unitMeasure: string;
  targetQuantity: number;
  executionId?: number | null;
  contribution?: number | null;
}

export interface ActivityProductExecution {
  id: number;
  activityId: number;
  productId: number;
  month: number;
  contribution: number;
}

export interface SaveActivityProductExecution {
  activityId: number;
  productId: number;
  month: number;
  contribution: number;
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

  saveBudgetExecution(e: SaveActivityBudgetExecution) {
    return this.http.post<ApiResponse<ActivityBudgetExecution>>(
      `${this.baseUrl}/budget`,
      e,
    );
  }

  productMatrix(
    activityId: number,
    month: number,
  ): Observable<ApiResponse<ActivityProductMatrixRow[]>> {
    return this.http.get<ApiResponse<ActivityProductMatrixRow[]>>(
      `${this.baseUrl}/products`,
      { params: { activityId, month } },
    );
  }

  saveProductExecution(e: SaveActivityProductExecution) {
    return this.http.post<ApiResponse<ActivityProductExecution>>(
      `${this.baseUrl}/product`,
      e,
    );
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
