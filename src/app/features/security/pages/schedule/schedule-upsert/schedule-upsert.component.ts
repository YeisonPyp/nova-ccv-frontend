import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import {
  Schedule,
  ScheduleDay,
} from "@/app/core/models/assessment/schedule.model";
import { ScheduleService } from "@/app/core/services/assessment/schedule.service";
import {
  DAY_LABELS,
  ScheduleDayUpsertComponent,
} from "./schedule-day-upsert/schedule-day-upsert.component";

@Component({
  selector: "app-schedule-upsert",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScheduleDayUpsertComponent],
  templateUrl: "./schedule-upsert.component.html",
})
export class ScheduleUpsertComponent {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ScheduleService);

  schedule = input.required<Schedule>();
  autoSaving = signal(false);
  form = this.fb.group({
    name: [""],
    description: [""],
  });

  weekDays = Object.keys(DAY_LABELS).map(Number);

  scheduleDaysMap = signal<Record<number, ScheduleDay>>({});

  constructor() {
    effect(() => {
      const s = this.schedule();
      this.form.patchValue(
        { name: s.name, description: s.description ?? "" },
        { emitEvent: false },
      );

      this.scheduleDaysMap.set(
        s.days.reduce(
          (d, day) => {
            d[day.weekDay] = day;
            return d;
          },
          {} as Record<number, ScheduleDay>,
        ),
      );
    });

    this.form.valueChanges
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap(() => {
          const s = this.schedule();
          this.autoSaving.set(true);
          return this.scheduleService.update(s.id, {
            name: this.form.value.name ?? undefined,
            description: this.form.value.description ?? undefined,
          });
        }),
      )
      .subscribe({
        next: () => this.autoSaving.set(false),
        error: () => this.autoSaving.set(false),
      });
  }

  onScheduleDaySaved(day: ScheduleDay) {
    this.scheduleDaysMap.update((d) => {
      d[day.weekDay] = day;
      return d;
    });
  }

  onScheduleDayRemoved(day: number) {
    this.scheduleDaysMap.update((d) => {
      delete d[day];
      return d;
    });
  }
}
