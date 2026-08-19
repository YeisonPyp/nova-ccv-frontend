import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import {
  PatStrategicProgram,
  PatStrategicProgramDetail,
} from '../../models/pat/pat-models';
import { Injectable } from '@angular/core';
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from '@/app/shared/components/search-select/on-search-select.interface';
import builder from '@rsql/builder';
import { emit } from '@rsql/emitter';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';

export interface CreatePatProgramDto {
  year: number;
  startsAt: string;
  endsAt: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class PatProgramService extends FilterServiceSpecImpl<
  PatStrategicProgram,
  CreatePatProgramDto
> {
  constructor() {
    super('pat/v2/strategic-programs');
  }

  resolveProgram(
    adendaId: number,
    contextId: number,
    unitMeasureId: number,
  ): Observable<ApiResponse<PatStrategicProgram>> {
    return this.http.post<ApiResponse<PatStrategicProgram>>(
      `${this.baseUrl}/resolve`,
      null,
      { params: { adendaId, contextId, unitMeasureId } },
    );
  }

  findDetail(
    id: number,
  ): Observable<ApiResponse<PatStrategicProgramDetail>> {
    return this.http.get<ApiResponse<PatStrategicProgramDetail>>(
      `${this.baseUrl}/${id}/detail`,
    );
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PatStrategicProgram>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PatStrategicProgram>,
  ) {
    return new SearchSelectContextFactory<PatStrategicProgram>(
      (term) => {
        const b = builder.eq('description', `*${term}*`);
        return this.findAll({ rsqlQuery: emit(b) }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({
        id: e.id,
        title: `${e.description} (${e.startsAt} — ${e.endsAt})`,
      }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
