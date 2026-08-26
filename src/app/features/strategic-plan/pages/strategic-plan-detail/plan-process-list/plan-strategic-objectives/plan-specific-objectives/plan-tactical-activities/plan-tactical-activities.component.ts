import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import {
  PatSpecificObjective,
  PatTacticalActivity,
} from "@/app/core/models/pat/pat-models";
import { PatTacticalActivityService } from "@/app/core/services/pat/tactical-activity.service";
import { UpsertTacticalActivityComponent } from "./upsert-tactical-activity/upsert-tactical-activity.component";
import { EditIconComponent } from "@/app/shared/components/edit-icon/edit-icon.component";
import { TrashIconComponent } from "@/app/shared/components/edit-icon/trash-icon.component";

@Component({
  selector: "app-plan-tactical-activities",
  standalone: true,
  imports: [
    CommonModule,
    UpsertTacticalActivityComponent,
    EditIconComponent,
    TrashIconComponent,
  ],
  templateUrl: "./plan-tactical-activities.component.html",
})
export class PlanTacticalActivitiesComponent {
  specificObjective = input<PatSpecificObjective | null>(null);
  tacticals = signal<PatTacticalActivity[]>([]);
  isLoading = signal(false);
  upsertOpen = signal(false);
  toEdit = signal<PatTacticalActivity | null>(null);

  private readonly service = inject(PatTacticalActivityService);

  constructor() {
    effect(() => {
      const specific = this.specificObjective();
      if (specific) {
        this.load(specific.id);
      } else {
        this.tacticals.set([]);
      }
    });
  }

  private load(specificId: number) {
    this.isLoading.set(true);
    this.service.findAllBySpecificObjectiveId(specificId).subscribe({
      next: (res) => {
        this.tacticals.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openUpsert(t: PatTacticalActivity | null) {
    this.toEdit.set(t);
    this.upsertOpen.set(true);
  }

  onSaved(t: PatTacticalActivity) {
    const map = this.tacticals().reduce(
      (acc, cur) => ({ ...acc, [cur.id]: cur }),
      {} as Record<number, PatTacticalActivity>,
    );
    map[t.id] = t;
    this.tacticals.set(Object.values(map));
    this.upsertOpen.set(false);
  }

  deleteTactical(t: PatTacticalActivity, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar la actividad táctica "${t.name}"?`)) return;
    this.service.delete(t.id).subscribe({
      next: () => {
        this.tacticals.set(this.tacticals().filter((x) => x.id !== t.id));
      },
    });
  }
}
