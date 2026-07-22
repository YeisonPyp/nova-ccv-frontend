import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

/** Name-only training catalog item (topic, modality, priority, type, status…). */
export interface TrainingCatalog {
  id: number;
  name: string;
}

export interface TrainingCatalogDto {
  name: string;
}

/**
 * Generic client for every name-only training catalog. The concrete catalog is
 * selected via the `path` argument (e.g. "training-topics").
 */
@Injectable({ providedIn: 'root' })
export class TrainingCatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list(path: string): Observable<ApiResponse<TrainingCatalog[]>> {
    return this.http.get<ApiResponse<TrainingCatalog[]>>(
      `${this.base}/${path}`,
    );
  }

  create(
    path: string,
    dto: TrainingCatalogDto,
  ): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.post<ApiResponse<TrainingCatalog>>(
      `${this.base}/${path}`,
      dto,
    );
  }

  update(
    path: string,
    id: number,
    dto: TrainingCatalogDto,
  ): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.put<ApiResponse<TrainingCatalog>>(
      `${this.base}/${path}/${id}`,
      dto,
    );
  }

  delete(path: string, id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${path}/${id}`);
  }
}

abstract class ITrainingCatalogService {
  protected readonly base = environment.apiUrl;

  constructor(
    protected readonly http: HttpClient,
    protected readonly path: string,
  ) {}

  list(): Observable<ApiResponse<TrainingCatalog[]>> {
    return this.http.get<ApiResponse<TrainingCatalog[]>>(
      `${this.base}/${this.path}`,
    );
  }

  create(dto: TrainingCatalogDto): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.post<ApiResponse<TrainingCatalog>>(
      `${this.base}/${this.path}`,
      dto,
    );
  }

  update(
    id: number,
    dto: TrainingCatalogDto,
  ): Observable<ApiResponse<TrainingCatalog>> {
    return this.http.put<ApiResponse<TrainingCatalog>>(
      `${this.base}/${this.path}/${id}`,
      dto,
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.base}/${this.path}/${id}`,
    );
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingTopicService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-topics');
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingModalityService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-modalities');
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingPriorityService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-priorities');
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingLevelService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-levels');
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingStatusService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-statuses');
  }
}

@Injectable({ providedIn: 'root' })
export class TrainingTypeService extends ITrainingCatalogService {
  constructor(http: HttpClient) {
    super(http, 'training-types');
  }
}
