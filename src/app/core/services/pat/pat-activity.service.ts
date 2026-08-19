import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { PatActivity } from '../../models/pat/pat-models';
import { Area } from '../../models/assessment/area.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from '@/app/shared/components/pagination-table/pagination-table.component';
import { APIPage } from '../../models/api-page.model';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';

export interface CreatePatActivity {
  name: string;
  code?: string;
  tacticalActivityId: number;
  startsAt: string;
  endsAt: string;

  description?: string | null;
  policyId?: number | null;
  programId?: number | null;
  unitMeasureId?: number | null;
  unitMeasureGoal?: number | null;
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

  seedFromFile(year: number, file: File): Observable<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('year', String(year));
    formData.append('file', file);
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/seed-from-file`,
      formData,
    );
  }

  findAllForDashboard(
    query: PageableQuery,
    areaId?: number | null,
  ): Observable<ApiResponse<APIPage<PatActivity>>> {
    const params = new PageableQueryParams(query).getParams();
    if (areaId != null) params['areaId'] = areaId;
    return this.http.get<ApiResponse<APIPage<PatActivity>>>(this.baseUrl, {
      params,
    });
  }

  findAreasForYear(year: number): Observable<ApiResponse<Area[]>> {
    return this.http.get<ApiResponse<Area[]>>(`${this.baseUrl}/areas`, {
      params: { year },
    });
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
