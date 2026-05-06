import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  UserStatus,
  UserStatusChange,
} from "../../models/user/user-status-change.model";
import {
  PageableQuery,
  PageableQueryParams,
} from "../../../shared/pageable-query";

export interface CreateUserStatusChangeDto {
  userId: number;
  newStatus: UserStatus;
  reason: string;
}

export interface UserStatusChangeQueryParams extends PageableQuery {
  userId: number;
}

@Injectable({ providedIn: "root" })
export class UserStatusChangeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/user-status-change`;

  findByUser(
    query: UserStatusChangeQueryParams,
  ): Observable<ApiResponse<APIPage<UserStatusChange>>> {
    const params = new PageableQueryParams(query).getParams();
    return this.http.get<ApiResponse<APIPage<UserStatusChange>>>(this.API_URL, {
      params,
    });
  }

  create(
    dto: CreateUserStatusChangeDto,
  ): Observable<ApiResponse<UserStatusChange>> {
    return this.http.post<ApiResponse<UserStatusChange>>(this.API_URL, dto);
  }
}
