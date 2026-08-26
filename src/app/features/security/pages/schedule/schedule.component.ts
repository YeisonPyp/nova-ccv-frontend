import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Schedule } from "@/app/core/models/assessment/schedule.model";
import { ScheduleService } from "@/app/core/services/assessment/schedule.service";
import { ScheduleUpsertComponent } from "./schedule-upsert/schedule-upsert.component";

@Component({
  selector: "app-schedule",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScheduleUpsertComponent],
  templateUrl: "./schedule.component.html",
})
export class ScheduleComponent implements OnInit {
  private scheduleService = inject(ScheduleService);
  private fb = inject(FormBuilder);

  schedules = signal<Schedule[]>([]);
  selected = signal<Schedule | null>(null);
  loading = signal(false);
  showModal = signal(false);
  creating = signal(false);
  deleteTargetId = signal<number | null>(null);
  deleting = signal(false);

  createForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: [""],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.scheduleService.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.schedules.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  select(schedule: Schedule): void {
    this.selected.set(schedule);
  }

  openModal(): void {
    this.createForm.reset();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onCreate(): void {
    if (this.createForm.invalid || this.creating()) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    const val = this.createForm.getRawValue();
    this.scheduleService
      .create({
        name: val.name!,
        description: val.description ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.creating.set(false);
          if (res.success && res.data) {
            this.schedules.update((list) => [res.data!, ...list]);
            this.selected.set(res.data);
            this.showModal.set(false);
          }
        },
        error: () => this.creating.set(false),
      });
  }

  confirmDelete(id: number, event: Event): void {
    event.stopPropagation();
    this.deleteTargetId.set(id);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }

  doDelete(): void {
    const id = this.deleteTargetId();
    if (!id || this.deleting()) return;
    this.deleting.set(true);
    this.scheduleService.delete(id).subscribe({
      next: () => {
        this.schedules.update((list) => list.filter((s) => s.id !== id));
        if (this.selected()?.id === id) this.selected.set(null);
        this.deleteTargetId.set(null);
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false),
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.createForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
