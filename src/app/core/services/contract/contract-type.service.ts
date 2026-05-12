import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";

export interface ContractType {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateContractTypeDto {
  id: string;
  name: string;
  description?: string;
}

@Injectable({ providedIn: "root" })
export class ContractTypeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contract-types`;

  findAll(): Observable<ApiResponse<ContractType[]>> {
    return this.http.get<ApiResponse<ContractType[]>>(this.base);
  }

  create(dto: CreateContractTypeDto): Observable<ApiResponse<ContractType>> {
    return this.http.post<ApiResponse<ContractType>>(this.base, dto);
  }

  update(
    id: string,
    dto: CreateContractTypeDto,
  ): Observable<ApiResponse<ContractType>> {
    return this.http.put<ApiResponse<ContractType>>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
  }
}
