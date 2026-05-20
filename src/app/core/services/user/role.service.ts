import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { RoleResponse } from "../../models/user/role.model";

export interface CreateRoleDto {
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class RoleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/roles`;

  findAll(): Observable<ApiResponse<RoleResponse[]>> {
    return this.http.get<ApiResponse<RoleResponse[]>>(this.API_URL);
  }

  findById(id: number): Observable<ApiResponse<RoleResponse>> {
    return this.http.get<ApiResponse<RoleResponse>>(`${this.API_URL}/${id}`);
  }

  create(dto: CreateRoleDto): Observable<ApiResponse<RoleResponse>> {
    return this.http.post<ApiResponse<RoleResponse>>(this.API_URL, dto);
  }

  update(id: number, dto: CreateRoleDto): Observable<ApiResponse<RoleResponse>> {
    return this.http.put<ApiResponse<RoleResponse>>(`${this.API_URL}/${id}`, dto);
  }

  addPermission(id: number, permissionName: string): Observable<ApiResponse<RoleResponse>> {
    return this.http.post<ApiResponse<RoleResponse>>(
      `${this.API_URL}/${id}/permissions/${permissionName}`,
      {},
    );
  }

  removePermission(id: number, permissionName: string): Observable<ApiResponse<RoleResponse>> {
    return this.http.delete<ApiResponse<RoleResponse>>(
      `${this.API_URL}/${id}/permissions/${permissionName}`,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
