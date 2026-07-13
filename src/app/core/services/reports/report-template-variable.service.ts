import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { Injectable } from '@angular/core';
import { ReportTemplateVariable } from '../../models/reports/report-template-variable.model';
import { Observable } from 'rxjs';
import { APIPage } from '../../models/api-page.model';
import { GoalOption } from '../../models/goals/goal-option.model';
import { ApiResponse } from '../../models/api-response.model';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';

@Injectable({
  providedIn: 'root',
})
export class ReportTemplateVariableService extends FilterServiceSpecImpl<ReportTemplateVariable> {
  constructor() {
    super('report-template-variables');
  }

  findOptionsForVariable(
    id: number,
    q: PageableQuery,
  ): Observable<ApiResponse<APIPage<GoalOption>>> {
    return this.http.get<ApiResponse<APIPage<GoalOption>>>(
      `${this.baseUrl}/${id}/options`,
      { params: new PageableQueryParams(q).getParams() },
    );
  }
}
