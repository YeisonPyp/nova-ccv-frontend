import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { PatActivity } from "../../models/pat/pat-models";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from "@/app/shared/components/pagination-table/pagination-table.component";
import { APIPage } from "../../models/api-page.model";

export interface CreatePatActivity {
  name: string;
  code: string;
  employeeId: number;
  tacticalActivityId: number;
  costCenterId: number;
  measurementId: number;
  indicatorId: number;
  benefitTypeId: number;
  startsAt: string;
  endsAt: string;
  description: string;

  strategicProgramId: number | null;
  policyId: number | null;
  measurementGoal: number | null;
  indicatorBaseLine: number | null;
  indicatorGoal: number | null;
  benefitAmount: number | null;
}

@Injectable({
  providedIn: "root",
})
export class PatActivityService extends FilterServiceSpecImpl<
  PatActivity,
  CreatePatActivity
> {
  constructor() {
    super("pat/v2/activities");
  }
}

export class PatActivityServiceByYear implements FilterServiceSpec {
  constructor(
    private patActivityService: PatActivityService,
    private year?: number,
  ) {}

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<PatActivity>>> {
    if (this.year) {
      pageable.rsqlQuery = pageable.rsqlQuery
        ? `${pageable.rsqlQuery} and year==${this.year}`
        : `year==${this.year}`;
    }
    return this.patActivityService.findAll(pageable);
  }
}
