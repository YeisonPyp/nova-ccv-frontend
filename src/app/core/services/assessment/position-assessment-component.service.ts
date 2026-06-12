import { Injectable, inject } from "@angular/core";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import {
  AssessmentComponentRequirement,
  PositionAssessmentComponent,
} from "../../models/assessment/position.model";

export interface CreatePositionAssessmentComponentDto {
  positionId: number;
  name: string;
  description?: string;
  minValue: number;
  maxValue: number;
}

export interface CreateAssessmentComponentRequirementDto {
  componentId: number;
  name: string;
  description?: string;
  maxFiles?: number;
}

@Injectable({
  providedIn: "root",
})
export class PositionAssessmentComponentService extends FilterServiceSpecImpl<
  PositionAssessmentComponent,
  CreatePositionAssessmentComponentDto
> {
  constructor() {
    super("assessment/components");
  }
}

@Injectable({
  providedIn: "root",
})
export class AssessmentComponentRequirementService extends FilterServiceSpecImpl<
  AssessmentComponentRequirement,
  CreateAssessmentComponentRequirementDto
> {
  constructor() {
    super("assessment/requirements");
  }
}

@Injectable({
  providedIn: "root",
})
export class AssessmentComponentRequirementFileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/assessment/requirement-files`;

  create(requirementId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append("requirementId", requirementId.toString());
    formData.append("file", file);
    return this.http.post(this.baseUrl, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
