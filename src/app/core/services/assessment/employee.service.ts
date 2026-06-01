import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { Employee } from "../../models/assessment/employee.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";
import {
  OnSelectCallback,
  SearchSelectContextFactory,
  SearchSelectContextFactoryOptions,
} from "../../../shared/components/search-select/on-search-select.interface";

export interface EmployeeQuery extends PageableQuery {
  nameOrEmail?: string;
}

export interface CreateEmployeeDto {
  name: string;
  lastName: string;
  email: string;
  positionId: number;
  employeeReportsToId: number;
}

export interface UpdateEmployeeDto {
  name?: string;
  lastName?: string;
  email?: string;
  positionId?: number;
  employeeReportsToId?: number;
}

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/employee`;

  findEmployees(
    query: EmployeeQuery,
  ): Observable<ApiResponse<APIPage<Employee>>> {
    const params = new PageableQueryParams(query).getParams();

    return this.http.get<ApiResponse<APIPage<Employee>>>(this.API_URL, {
      params,
    });
  }

  createEmployee(dto: CreateEmployeeDto): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.API_URL, dto);
  }

  updateEmployee(
    id: number,
    dto: UpdateEmployeeDto,
  ): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.API_URL}/${id}`, dto);
  }

  deleteEmployee(id: number): Observable<ApiResponse<Employee>> {
    return this.http.delete<ApiResponse<Employee>>(`${this.API_URL}/${id}`);
  }

  newSearchSelectEmployeeContext(
    onSelectCallback?: OnSelectCallback<Employee>,
    op?: SearchSelectContextFactoryOptions,
    onRemoveCallback?: OnSelectCallback<Employee>,
  ) {
    return new SearchSelectContextFactory<Employee>(
      (term) => {
        return this.findEmployees({ nameOrEmail: term }).pipe(
          map((res) => res?.data?.content ?? []),
        );
      },
      (e) => ({ id: e.id, title: `${e.name ?? ""} ${e.lastName ?? ""}` }),
      onSelectCallback,
      op,
      onRemoveCallback,
    );
  }
}
