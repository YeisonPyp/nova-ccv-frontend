import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import {
  PatSpecificObjective,
  PatStrategicObjective,
  PatTacticalActivity,
} from "@/app/core/models/pat/pat-models";
import { PatStrategicObjectiveService } from "@/app/core/services/pat/strategic-objective.service";
import { PatTacticalActivityService } from "@/app/core/services/pat/tactical-activity.service";
import { UpsertSpecificObjectiveComponent } from "./upsert-specific-objective/upsert-specific-objective.component";
import { UpsertTacticalActivityComponent } from "./upsert-tactical-activity/upsert-tactical-activity.component";

@Component({
  selector: "app-objective-detail",
  standalone: true,
  imports: [
    CommonModule,
    UpsertSpecificObjectiveComponent,
    UpsertTacticalActivityComponent,
  ],
  templateUrl: "./objective-detail.component.html",
})
export class ObjectiveDetailComponent {
  readonly id = input.required<number, string | number>({
    transform: numberAttribute,
  });
  readonly year = input.required<number, string | number>({
    transform: numberAttribute,
  });

  private readonly router = inject(Router);
  private readonly strategicService = inject(PatStrategicObjectiveService);
  private readonly tacticalService = inject(PatTacticalActivityService);

  strategic = signal<PatStrategicObjective | null>(null);
  specifics = signal<PatSpecificObjective[]>([]);
  tacticals = signal<PatTacticalActivity[]>([]);

  specificObjectiveToEdit = signal<PatSpecificObjective | null>(null);
  specificObjectiveModalIsOpen = signal(false);

  tacticalActivityToEdit = signal<PatTacticalActivity | null>(null);
  tacticalActivityModalIsOpen = signal(false);

  selectedSpecificId = signal<number | null>(null);
  loadingStrategic = signal(false);
  loadingSpecifics = signal(false);
  loadingTacticals = signal(false);

  readonly selectedSpecific = computed(
    () =>
      this.specifics().find((s) => s.id === this.selectedSpecificId()) ?? null,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.loadStrategic(id);
    });

    effect(() => {
      const sid = this.selectedSpecificId();
      if (sid != null) this.loadTacticals(sid);
      else this.tacticals.set([]);
    });
  }

  private loadStrategic(id: number) {
    this.loadingStrategic.set(true);
    this.strategicService.findById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.strategic.set(res.data);
          this.specifics.set(res.data.specificObjectives ?? []);
        }

        this.loadingStrategic.set(false);
      },
      error: () => this.loadingStrategic.set(false),
    });
  }

  private loadTacticals(specificId: number) {
    this.loadingTacticals.set(true);
    this.tacticalService.findAllBySpecificObjectiveId(specificId).subscribe({
      next: (res) => {
        if (res.success && res.data) this.tacticals.set(res.data);
        this.loadingTacticals.set(false);
      },
      error: () => this.loadingTacticals.set(false),
    });
  }

  selectSpecific(s: PatSpecificObjective) {
    this.selectedSpecificId.set(s.id);
  }

  goBack() {
    this.router.navigate([`/pat/${this.year()}/dashboard`]);
  }

  openUpsertSpecific(s: PatSpecificObjective | null) {
    this.specificObjectiveToEdit.set(s);
    this.specificObjectiveModalIsOpen.set(true);
  }

  closeUpsertSpecific() {
    this.specificObjectiveModalIsOpen.set(false);
  }

  onSpecificSaved(s: PatSpecificObjective) {
    const specifics = this.specifics().reduce(
      (prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      },
      {} as Record<number, PatSpecificObjective>,
    );

    specifics[s.id] = s;
    this.specifics.set(Object.values(specifics));
    this.specificObjectiveModalIsOpen.set(false);
  }

  openUpsertTacticalActivity(t: PatTacticalActivity | null) {
    this.tacticalActivityToEdit.set(t);
    this.tacticalActivityModalIsOpen.set(true);
  }

  closeUpsertTacticalActivity() {
    this.tacticalActivityModalIsOpen.set(false);
  }

  onTacticalSaved(t: PatTacticalActivity) {
    const tacticals = this.tacticals().reduce(
      (prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      },
      {} as Record<number, PatTacticalActivity>,
    );

    tacticals[t.id] = t;
    this.tacticals.set(Object.values(tacticals));
    this.tacticalActivityModalIsOpen.set(false);
  }
}
