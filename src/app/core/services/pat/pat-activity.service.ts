import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import {
  PatActivity,
  PatActivityBudgetMatrix,
} from '../../models/pat/pat-models';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from '@/app/shared/components/pagination-table/pagination-table.component';
import { APIPage } from '../../models/api-page.model';

export interface CreatePatActivity {
  name: string;
  code?: string;
  employeeId: number;
  tacticalActivityId: number;
  costCenterId: number;
  measurement: string;
  startsAt: string;
  endsAt: string;

  description?: string | null;
  policyId?: number | null;
  programId?: number | null;
  measurementGoal?: number | null;
  parentId?: number | null;
  colorHex?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PatActivityService extends FilterServiceSpecImpl<
  PatActivity,
  CreatePatActivity
> {
  constructor() {
    super('pat/v2/activities');
  }

  findPresupuestalMatrix(
    id: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix[]>> {
    return this.http.get<ApiResponse<PatActivityBudgetMatrix[]>>(
      `${this.baseUrl}/${id}/presupuestal-matrix`,
    );
  }

  saveBudgetMatrix(
    activityId: number,
    budgetCategoryId: number,
    amount: number,
  ): Observable<ApiResponse<PatActivityBudgetMatrix>> {
    return this.http.post<ApiResponse<PatActivityBudgetMatrix>>(
      `${this.baseUrl}/${activityId}/presupuestal-matrix`,
      { budgetCategoryId, amount },
    );
  }

  seedFromFile(year: number, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('year', String(year));
    formData.append('file', file);
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/seed-from-file`,
      formData,
    );
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
