import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/storage`;

  uploadFile(bucketName: string, objectName: string, file: File): Observable<HttpEvent<ApiResponse<any>>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('objectName', objectName);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload/${bucketName}`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<ApiResponse<any>>(req);
  }

  downloadResource(path: string) {
    return this.http.get(`${this.apiUrl}`, { params: { path }, responseType: 'blob' },);
  }

  deleteFile(bucketName: string, objectName: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/delete/${bucketName}/${objectName}`);
  }
}
