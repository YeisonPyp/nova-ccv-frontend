import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment.development';
import { ApiResponse } from '../../models/api-response.model';
import { PatAdendaProgramSummary } from '../../models/pat/pat-models';
import {
  PageableQuery,
  PageableQueryParams,
} from '@/app/shared/pageable-query';

export interface SummaryRequest extends PageableQuery {
  adendaId?: number | null;
  year?: number | null;
  areaId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PatAdendaProgramSummaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/strategic-programs/adenda-summary`;

  findSummaries(params: SummaryRequest) {
    return this.http.get<ApiResponse<PatAdendaProgramSummary[]>>(this.baseUrl, {
      params: new PageableQueryParams(params).getParams(),
    });
  }
}
