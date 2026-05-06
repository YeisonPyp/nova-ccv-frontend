import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { RoleResponse } from "../../models/user/role.model";

@Injectable({ providedIn: "root" })
export class RoleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/roles`;

  findAll(): Observable<ApiResponse<RoleResponse[]>> {
    return this.http.get<ApiResponse<RoleResponse[]>>(this.API_URL);
  }
}
