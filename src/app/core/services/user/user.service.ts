import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import { UserResponse } from "../../models/user/user.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  getAllUsers(query: PageableQuery): Observable<ApiResponse<APIPage<UserResponse>>> {
    const params = new PageableQueryParams(query).getParams();
    return this.http.get<ApiResponse<APIPage<UserResponse>>>(this.API_URL, { params });
  }

  getUserById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.API_URL}/${id}`);
  }

  assignRole(userId: number, roleName: string): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.API_URL}/${userId}/roles/${encodeURIComponent(roleName)}`,
      {}
    );
  }

  removeRole(userId: number, roleName: string): Observable<ApiResponse<UserResponse>> {
    return this.http.delete<ApiResponse<UserResponse>>(
      `${this.API_URL}/${userId}/roles/${encodeURIComponent(roleName)}`
    );
  }

  assignPermission(userId: number, permissionName: string): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.API_URL}/${userId}/permissions/${encodeURIComponent(permissionName)}`,
      {}
    );
  }

  removePermission(userId: number, permissionName: string): Observable<ApiResponse<UserResponse>> {
    return this.http.delete<ApiResponse<UserResponse>>(
      `${this.API_URL}/${userId}/permissions/${encodeURIComponent(permissionName)}`
    );
  }
}
