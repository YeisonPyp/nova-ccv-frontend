import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { ScheduleDay } from "@/app/core/models/assessment/schedule.model";
import { ScheduleService } from "@/app/core/services/assessment/schedule.service";
import { toObservable } from "@angular/core/rxjs-interop";

export const DAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

@Component({
  selector: "app-schedule-day-upsert",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./schedule-day-upsert.component.html",
})
export class ScheduleDayUpsertComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scheduleService = inject(ScheduleService);

  scheduleId = input.required<number>();
  weekDay = input.required<number>();
  scheduleDay = input<ScheduleDay>();

  onSaved = output<ScheduleDay>();
  onRemove = output<number>();

  dayName = computed(() => DAY_LABELS[this.weekDay()]);

  isActive = signal(false);
  saving = signal(false);
  scheduleDayId = signal<number | undefined>(undefined);

  form = this.fb.group({
    starts: [""],
    ends: [""],
  });

  timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  constructor() {
    toObservable(this.scheduleDay).subscribe((day) => {
      if (day) {
        this.isActive.set(true);
        this.scheduleDayId.set(day.id);
        this.form.patchValue(
          {
            starts: this.minutesToTime(day.utcStartsMinutes),
            ends: this.minutesToTime(day.utcEndsMinutes),
          },
          { emitEvent: false },
        );
      }
    });
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((p) => {
        const starts = p.starts;
        const ends = p.ends;
        const id = this.scheduleDayId();
        if (typeof starts === "string" && typeof ends === "string") {
          this.saving.set(true);
          const startsTime = this.timeToMinutes(starts);
          const endsTime = this.timeToMinutes(ends);
          const sub = id
            ? this.scheduleService.updateDay(id, {
                utcStartsMinutes: startsTime,
                utcEndsMinutes: endsTime,
              })
            : this.scheduleService.createDay({
                scheduleId: this.scheduleId(),
                utcStartsMinutes: startsTime,
                utcEndsMinutes: endsTime,
                weekDay: this.weekDay(),
              });
          sub.subscribe((res) => {
            this.saving.set(false);
            this.onSaved.emit(res.data);
          });
        }
      });
  }

  activate() {
    this.isActive.set(true);
  }

  remove() {
    const id = this.scheduleDayId();
    if (id) {
      this.scheduleService.deleteDay(id).subscribe(() => {
        this.onRemove.emit(this.weekDay());
        this.scheduleDayId.set(undefined);
      });
    }
    this.isActive.set(false);
  }
}
