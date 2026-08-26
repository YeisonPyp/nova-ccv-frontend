import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  PatSpecificObjective,
  PatStrategicObjective,
} from "@/app/core/models/pat/pat-models";
import { PatStrategicObjectiveService } from "@/app/core/services/pat/strategic-objective.service";
import { PatSpecificObjectiveService } from "@/app/core/services/pat/pat-specific-objective.service";
import { UpsertSpecificObjectiveComponent } from "./upsert-specific-objective/upsert-specific-objective.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";

@Component({
  selector: "app-plan-specific-objectives",
  standalone: true,
  imports: [
    CommonModule,
    UpsertSpecificObjectiveComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: "./plan-specific-objectives.component.html",
})
export class PlanSpecificObjectivesComponent {
  strategicObjective = input<PatStrategicObjective | null>(null);
  specificSelected = output<PatSpecificObjective | null>();
  selectedId = signal<number | null>(null);
  specifics = signal<PatSpecificObjective[]>([]);
  isLoading = signal(false);
  upsertOpen = signal(false);
  toEdit = signal<PatSpecificObjective | null>(null);

  private readonly service = inject(PatStrategicObjectiveService);
  private readonly specificService = inject(PatSpecificObjectiveService);

  readonly selectedSpecific = computed(
    () => this.specifics().find((s) => s.id === this.selectedId()) ?? null,
  );

  constructor() {
    effect(() => {
      const objective = this.strategicObjective();
      if (objective) {
        this.loadSpecifics(objective.id);
      } else {
        this.specifics.set([]);
        this.selectedId.set(null);
      }
    });
  }

  private loadSpecifics(id: number) {
    this.isLoading.set(true);
    this.service.findById(id).subscribe({
      next: (res) => {
        this.specifics.set(res.data?.specificObjectives ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  select(s: PatSpecificObjective) {
    this.selectedId.set(s.id);
    this.specificSelected.emit(s);
  }

  openUpsert(s: PatSpecificObjective | null) {
    this.toEdit.set(s);
    this.upsertOpen.set(true);
  }

  onSaved(s: PatSpecificObjective) {
    const map = this.specifics().reduce(
      (acc, cur) => ({ ...acc, [cur.id]: cur }),
      {} as Record<number, PatSpecificObjective>,
    );
    map[s.id] = s;
    this.specifics.set(Object.values(map));
    this.upsertOpen.set(false);
  }

  deleteSpecific(s: PatSpecificObjective, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar el objetivo específico "${s.name}"?`)) return;
    this.specificService.delete(s.id).subscribe({
      next: () => {
        this.specifics.set(this.specifics().filter((x) => x.id !== s.id));
        if (this.selectedId() === s.id) {
          this.selectedId.set(null);
          this.specificSelected.emit(null);
        }
      },
    });
  }
}
