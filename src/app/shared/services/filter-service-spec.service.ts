import { APIPage } from '@/app/core/models/api-page.model';
import { ApiResponse } from '@/app/core/models/api-response.model';
import { Observable } from 'rxjs/internal/Observable';
import {
  FilterServiceSpec,
  PageableQueryWithRsql,
} from '../components/pagination-table/pagination-table.component';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PageableQueryParams } from '../pageable-query';
import { Subject, tap } from 'rxjs';
import { environment } from '@/environments/environment';

export abstract class FilterServiceSpecImpl<
  T,
  CreateDto = Partial<T>,
> implements FilterServiceSpec {
  protected http = inject(HttpClient);
  protected baseUrl: string;
  onSave: Subject<T>;
  onDelete: Subject<number | string>;

  constructor(endpoint: string) {
    this.onSave = new Subject<T>();
    this.onDelete = new Subject<number | string>();
    if (endpoint.startsWith('/')) endpoint = endpoint.substring(1);
    this.baseUrl = `${environment.apiUrl}/${endpoint}`;
  }

  findAll(
    pageable: PageableQueryWithRsql,
  ): Observable<ApiResponse<APIPage<T>>> {
    return this.http.get<ApiResponse<APIPage<T>>>(this.baseUrl, {
      params: new PageableQueryParams(pageable).getParams(),
    });
  }

  findById(id: number | string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateDto): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.baseUrl, dto).pipe(
      tap((res) => {
        if (res.success && res.data) this.onSave.next(res.data);
      }),
    );
  }

  update(id: number | string, dto: CreateDto): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((res) => {
        if (res.success && res.data) this.onSave.next(res.data);
      }),
    );
  }

  delete(id: number | string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.onDelete.next(id);
      }),
    );
  }
}
