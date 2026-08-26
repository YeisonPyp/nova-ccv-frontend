import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  PatPlanningNotificationConfig,
  UpdatePatPlanningNotificationConfigDto,
} from '../../models/pat/pat-planning-notification-config.model';

/**
 * The four rows (one per planning type) are seeded by the migration, so only
 * listing and editing are exposed.
 */
@Injectable({ providedIn: 'root' })
export class PatPlanningNotificationConfigService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pat/v2/planning-notification-config`;

  findAll(): Observable<ApiResponse<PatPlanningNotificationConfig[]>> {
    return this.http.get<ApiResponse<PatPlanningNotificationConfig[]>>(
      this.baseUrl,
    );
  }

  update(
    id: string,
    dto: UpdatePatPlanningNotificationConfigDto,
  ): Observable<ApiResponse<PatPlanningNotificationConfig>> {
    return this.http.put<ApiResponse<PatPlanningNotificationConfig>>(
      `${this.baseUrl}/${id}`,
      dto,
    );
  }
}
