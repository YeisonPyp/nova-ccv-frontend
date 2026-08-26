import { FilterServiceSpecImpl } from "@/app/shared/services/filter-service-spec.service";
import {
  CreateStrategicPlanDto,
  StrategicPlan,
} from "../../models/strategic-plan/strategic-plan.models";
import { Injectable } from "@angular/core";
import { ApiResponse } from "../../models/api-response.model";
import { PatStrategicObjective } from "../../models/pat/pat-models";

@Injectable({ providedIn: "root" })
export class StrategicPlanService extends FilterServiceSpecImpl<
  StrategicPlan,
  CreateStrategicPlanDto
> {
  constructor() {
    super("pat/v2/strategic-plans");
  }

  findObjectivesByPlanName(planName: string) {
    return this.http.get<ApiResponse<PatStrategicObjective[]>>(
      `${this.baseUrl}/${planName}/objectives`,
    );
  }
}
