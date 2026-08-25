import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FilterServiceSpecImpl } from '@/app/shared/services/filter-service-spec.service';
import { ApiResponse } from '@/app/core/models/api-response.model';
import {
  PatDashboardBudget,
  PatDashboardFilters,
} from '../../models/pat/pat-dashboard.models';
import { PageableQueryParams } from '@/app/shared/pageable-query';
import builder from '@rsql/builder';
import { emit } from '@rsql/emitter';
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from '@/app/shared/components/search-select/on-search-select.interface';

export interface PresupuestalCategory {
  id: number;
  code: string;
  name: string;
  resourceType: string;
  description: string;
  amount: number;
  plannedBudget: number;
  unplannedBudget: number;
}

export interface CreatePresupuestalCategoryDto {
  code: string;
  name: string;
  resourceType: string;
  description: string;
  amount: number;
}

export interface CategoryIn {
  id: number;
  amount: number;
  description?: string;
  userId?: number;
  userFirstName?: string;
  userLastName?: string;
  createdAt: string;
}

export interface CategoryOut {
  id: number;
  amount: number;
  description?: string;
  createdAt: string;
  systemManaged: boolean;
}

export interface CreateCategoryMovementDto {
  amount: number;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatPresupuestalCategoryService extends FilterServiceSpecImpl<
  PresupuestalCategory,
  CreatePresupuestalCategoryDto
> {
  constructor() {
    super('pat/v2/presupuestal-categories');
  }

  findSummary(
    filters: PatDashboardFilters,
  ): Observable<ApiResponse<PatDashboardBudget>> {
    return this.http.get<ApiResponse<PatDashboardBudget>>(
      `${this.baseUrl}/summary`,
      { params: new PageableQueryParams(filters).getParams() },
    );
  }

  // ── Ingresos ──
  findIns(id: number): Observable<ApiResponse<CategoryIn[]>> {
    return this.http.get<ApiResponse<CategoryIn[]>>(
      `${this.baseUrl}/${id}/ins`,
    );
  }

  createIn(id: number, dto: CreateCategoryMovementDto) {
    return this.http.post<ApiResponse<CategoryIn>>(
      `${this.baseUrl}/${id}/ins`,
      dto,
    );
  }

  deleteIn(id: number, inId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/ins/${inId}`,
    );
  }

  // ── Egresos ──
  findOuts(id: number): Observable<ApiResponse<CategoryOut[]>> {
    return this.http.get<ApiResponse<CategoryOut[]>>(
      `${this.baseUrl}/${id}/outs`,
    );
  }

  createOut(id: number, dto: CreateCategoryMovementDto) {
    return this.http.post<ApiResponse<CategoryOut>>(
      `${this.baseUrl}/${id}/outs`,
      dto,
    );
  }

  deleteOut(id: number, outId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}/outs/${outId}`,
    );
  }

  newSearchSelectContext(
    onSelectCallback?: OnSelectCallback<PresupuestalCategory>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<PresupuestalCategory>,
  ) {
    return new SearchSelectContextFactory<PresupuestalCategory>(
      (term) =>
        this.findAll({ rsqlQuery: emit(builder.eq('name', `*${term}*`)) }).pipe(
          map((res) => res?.data?.content ?? []),
        ),
      (c) => ({ id: c.id, title: c.code ? `${c.code} — ${c.name}` : c.name }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
