import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse } from "@/app/core/models/api-response.model";
import { PatPlanProcess } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { PatStrategicObjective } from "../../models/pat/pat-models";
import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";

export interface CreatePatPlanProcessDto {
  name: string;
  planName: string;
}

@Injectable({ providedIn: "root" })
export class PatPlanProcessService extends FilterServiceSpecImpl<
  PatPlanProcess,
  CreatePatPlanProcessDto
> {
  constructor() {
    super("/pat/v2/plan-processes");
  }

  findAllByPlanName(planName: string): Observable<PatPlanProcess[]> {
    return this.http
      .get<ApiResponse<PatPlanProcess[]>>(`${this.baseUrl}/by-plan/${planName}`)
      .pipe(map((res) => res.data ?? []));
  }

  findObjectivesByProcessId(
    processId: number,
  ): Observable<ApiResponse<PatStrategicObjective[]>> {
    return this.http.get<ApiResponse<PatStrategicObjective[]>>(
      `${this.baseUrl}/${processId}/objectives`,
    );
  }
}
