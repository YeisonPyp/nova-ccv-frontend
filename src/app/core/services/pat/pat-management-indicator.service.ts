import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { PatManagementIndicator } from '../../models/pat/pat-models';
import { Injectable } from '@angular/core';
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from '@/app/shared/components/search-select/on-search-select.interface';
import builder from '@rsql/builder';
import { map, Observable } from 'rxjs';
import { emit } from '@rsql/emitter';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';
import {
  PatDashboardFilters,
  PatDashboardIndicator,
  PatIndicatorType,
} from '../../models/pat/pat-dashboard.models';
import { ApiResponse } from '../../models/api-response.model';
import { APIPage } from '../../models/api-page.model';

export interface CreatePatManagementIndicatorDto {
  name: string;
  description?: string;
}

export interface PatSummaryIndicatorFilters extends PageableQuery {
  year?: number | null;
  areaId?: number | null;
  programId?: number | null;
  name?: string;
  types?: PatIndicatorType[];
  taskIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class PatManagementIndicatorService extends FilterServiceSpecImpl<
  PatManagementIndicator,
  CreatePatManagementIndicatorDto
> {
  constructor() {
    super('pat/v2/management-indicators');
  }

  findSummary(
    filters: PatSummaryIndicatorFilters,
  ): Observable<ApiResponse<APIPage<PatDashboardIndicator>>> {
    return this.http.get<ApiResponse<APIPage<PatDashboardIndicator>>>(
      `${this.baseUrl}/summary`,
      { params: new PageableQueryParams(filters).getParams() },
    );
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatManagementIndicator>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatManagementIndicator>,
  ) {
    return new SearchSelectContextFactory<PatManagementIndicator>(
      (term) => {
        const b = builder.eq('name', `*${term}*`);
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.name ?? ''}` }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
