import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "../../models/api-response.model";
import { FilingFile } from "../../models/filing/filing.models";

@Injectable({ providedIn: "root" })
export class FilingFileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/filing-files`;

  findByFilingId(filingId: number): Observable<ApiResponse<FilingFile[]>> {
    return this.http.get<ApiResponse<FilingFile[]>>(this.apiUrl, {
      params: { filingId: filingId.toString() },
    });
  }

  create(filingId: number, file: File): Observable<ApiResponse<FilingFile>> {
    const formData = new FormData();
    formData.append("filingId", filingId.toString());
    formData.append("file", file);
    formData.append("origin", "");
    formData.append("destination", "");
    console.log(formData);
    return this.http.post<ApiResponse<FilingFile>>(this.apiUrl, formData);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
