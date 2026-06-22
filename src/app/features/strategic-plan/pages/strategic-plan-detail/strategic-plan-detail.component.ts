import { StrategicPlan } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { StrategicPlanService } from "@/app/core/services/strategic-plan/strategic-plan.service";
import { PatPlanProcessService } from "@/app/core/services/pat/plan-process.service";
import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { PatPlanProcess } from "@/app/core/models/strategic-plan/strategic-plan.models";
import {
  PatSpecificObjective,
  PatStrategicObjective,
} from "@/app/core/models/pat/pat-models";
import { PlanProcessListComponent } from "./plan-process-list/plan-process-list.component";
import { PlanStrategicObjectivesComponent } from "./plan-process-list/plan-strategic-objectives/plan-strategic-objectives.component";
import { PlanSpecificObjectivesComponent } from "./plan-process-list/plan-strategic-objectives/plan-specific-objectives/plan-specific-objectives.component";
import { PlanTacticalActivitiesComponent } from "./plan-process-list/plan-strategic-objectives/plan-specific-objectives/plan-tactical-activities/plan-tactical-activities.component";

@Component({
  selector: "app-strategic-plan-detail",
  standalone: true,
  imports: [
    CommonModule,
    PlanProcessListComponent,
    PlanStrategicObjectivesComponent,
    PlanSpecificObjectivesComponent,
    PlanTacticalActivitiesComponent,
  ],
  templateUrl: "./strategic-plan-detail.component.html",
})
export class StrategicPlanDetailComponent {
  private readonly service = inject(StrategicPlanService);
  private readonly processService = inject(PatPlanProcessService);
  planId = input.required<number>();
  isLoading = signal(false);
  plan = signal<StrategicPlan | null>(null);
  processes = signal<PatPlanProcess[]>([]);

  selectedProcess = signal<PatPlanProcess | null>(null);
  selectedObjective = signal<PatStrategicObjective | null>(null);
  selectedSpecific = signal<PatSpecificObjective | null>(null);

  readonly planName = computed(() => this.plan()?.name ?? "");

  constructor() {
    effect(() => {
      const planId = this.planId();
      this.isLoading.set(true);
      this.service.findById(planId).subscribe({
        next: (res) => {
          this.plan.set(res.data);
          this.isLoading.set(false);
          if (res.data) this.loadProcesses(res.data.name);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  private loadProcesses(planName: string) {
    this.processService.findAllByPlanName(planName).subscribe({
      next: (processes) => this.processes.set(processes),
    });
  }

  onProcessSaved(process: PatPlanProcess) {
    this.processes.update((list) => [...list, process]);
  }

  onProcessDeleted(id: number) {
    this.processes.update((list) => list.filter((p) => p.id !== id));
    if (this.selectedProcess()?.id === id) {
      this.selectedProcess.set(null);
      this.selectedObjective.set(null);
      this.selectedSpecific.set(null);
    }
  }

  onProcessSelected(process: PatPlanProcess) {
    this.selectedProcess.set(process);
    this.selectedObjective.set(null);
    this.selectedSpecific.set(null);
  }

  onObjectiveSelected(objective: PatStrategicObjective | null) {
    this.selectedObjective.set(objective);
    this.selectedSpecific.set(null);
  }

  onSpecificSelected(specific: PatSpecificObjective | null) {
    this.selectedSpecific.set(specific);
  }
}
