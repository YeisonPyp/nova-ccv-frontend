import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { PatStrategicObjective } from "@/app/core/models/pat/pat-models";
import { UpsertObjectiveComponent } from "./upsert-objective/upsert-objective.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";
import { StrategicPlanService } from "@/app/core/services/strategic-plan/strategic-plan.service";
import { LoadingSpinnerComponent } from "@/app/shared/components/loading-spinner/loading-spinner.component";
import { PatPlanProcessService } from "@/app/core/services/pat/plan-process.service";
import { PatStrategicObjectiveService } from "@/app/core/services/pat/strategic-objective.service";
import { PatPlanProcess } from "@/app/core/models/strategic-plan/strategic-plan.models";

@Component({
  selector: "app-plan-strategic-objectives",
  standalone: true,
  imports: [
    CommonModule,
    UpsertObjectiveComponent,
    EditIconComponent,
    TrashIconComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./plan-strategic-objectives.component.html",
})
export class PlanStrategicObjectivesComponent {
  private readonly service = inject(PatPlanProcessService);
  private readonly objectiveService = inject(PatStrategicObjectiveService);

  process = input.required<PatPlanProcess | null>();

  objectiveSelected = output<PatStrategicObjective | null>();

  selectedId = signal<number | null>(null);
  upsertOpen = signal(false);
  isLoading = signal(false);
  objectiveToUpsert = signal<PatStrategicObjective | null>(null);
  objectives = signal<PatStrategicObjective[]>([]);

  constructor() {
    effect(() => {
      const p = this.process();
      if (p) {
        this.isLoading.set(true);
        this.service.findObjectivesByProcessId(p.id).subscribe({
          next: (res) => {
            this.objectives.set(res.data);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      }
    });
  }

  select(o: PatStrategicObjective) {
    this.selectedId.set(o.id);
    this.objectiveSelected.emit(o);
  }

  openUpsert(o: PatStrategicObjective | null) {
    this.objectiveToUpsert.set(o);
    this.upsertOpen.set(true);
  }

  onSaved(o: PatStrategicObjective) {
    this.upsertOpen.set(false);
    const objMap = new Map(this.objectives().map((o) => [o.id, o]));
    objMap.set(o.id, o);
    this.objectives.set([...objMap.values()]);
  }

  deleteObjective(o: PatStrategicObjective, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar el objetivo "${o.name}"?`)) return;
    this.objectiveService.delete(o.id).subscribe({
      next: () => {
        this.objectives.set(this.objectives().filter((x) => x.id !== o.id));
        if (this.selectedId() === o.id) {
          this.selectedId.set(null);
          this.objectiveSelected.emit(null);
        }
      },
    });
  }
}
