import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { APIPage } from "../../models/api-page.model";
import {
  BillingAccount,
  ContractCandidate,
  BillingChargePayment,
} from "../../models/billing/billing-account.model";

@Injectable({ providedIn: "root" })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  findAll(
    page = 0,
    size = 20,
    filters: { contractId?: string; employeeId?: number; status?: string } = {},
  ): Observable<ApiResponse<APIPage<BillingAccount>>> {
    let params = new HttpParams().set("page", page).set("size", size);
    if (filters.contractId) params = params.set("contractId", filters.contractId);
    if (filters.employeeId != null) params = params.set("employeeId", filters.employeeId);
    if (filters.status) params = params.set("status", filters.status);
    return this.http.get<ApiResponse<APIPage<BillingAccount>>>(
      `${this.base}/billing-accounts`,
      { params },
    );
  }

  findById(id: number): Observable<ApiResponse<BillingAccount>> {
    return this.http.get<ApiResponse<BillingAccount>>(
      `${this.base}/billing-accounts/${id}`,
    );
  }

  create(contractId: number, files: File[]): Observable<ApiResponse<BillingAccount>> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return this.http.post<ApiResponse<BillingAccount>>(
      `${this.base}/billing-accounts/${contractId}`,
      formData,
    );
  }

  getBillingCandidates(): Observable<ApiResponse<ContractCandidate[]>> {
    return this.http.get<ApiResponse<ContractCandidate[]>>(
      `${this.base}/contracts/billing-candidates`,
    );
  }

  findPayments(
    billingAccountId: number,
    page = 0,
    size = 20,
  ): Observable<ApiResponse<APIPage<BillingChargePayment>>> {
    const params = new HttpParams()
      .set("billingAccountId", billingAccountId)
      .set("page", page)
      .set("size", size);
    return this.http.get<ApiResponse<APIPage<BillingChargePayment>>>(
      `${this.base}/billing-charge-payments`,
      { params },
    );
  }

  createPayment(
    billingAccountId: number,
    amount: number,
    paymentDate: string,
    file: File,
  ): Observable<ApiResponse<BillingChargePayment>> {
    const formData = new FormData();
    formData.append("billingAccountId", String(billingAccountId));
    formData.append("amount", String(amount));
    formData.append("paymentDate", paymentDate);
    formData.append("file", file);
    return this.http.post<ApiResponse<BillingChargePayment>>(
      `${this.base}/billing-charge-payments`,
      formData,
    );
  }

  deletePayment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/billing-charge-payments/${id}`,
    );
  }
}
