import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { PermissionResponse } from "../../models/user/permission.model";

@Injectable({ providedIn: "root" })
export class PermissionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/permissions`;

  findAll(): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(this.API_URL);
  }
}
