import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { CreateTrainingProgramDto } from '@/app/core/models/training/training-program.models';
import {
  TrainingModalityService,
  TrainingPriorityService,
  TrainingTopicService,
  TrainingTypeService,
} from '@/app/core/services/training/training-catalog.service';
import { TrainerService } from '@/app/core/services/training/trainer.service';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';

import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';

interface ScheduleRowForm {
  weekDay: number;
  startTime: string; // HH:mm
  endTime: string;
}

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SelectorComponent,
    SearchSelectComponent,
  ],
  templateUrl: './program-form.component.html',
})
export class ProgramFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TrainingProgramService);

  private readonly topicService = inject(TrainingTopicService);
  private readonly typeService = inject(TrainingTypeService);
  private readonly modalityService = inject(TrainingModalityService);
  private readonly priorityService = inject(TrainingPriorityService);
  private readonly trainerService = inject(TrainerService);
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);

  submitting = signal(false);

  readonly weekDays: Option[] = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 7 },
  ];

  private toOptions = map((res: { data: { id: number; name: string }[] }) =>
    res.data.map((i) => ({ label: i.name, value: i.id }) as Option),
  );

  topics = toSignal(this.topicService.list().pipe(this.toOptions));
  modalities = toSignal(this.modalityService.list().pipe(this.toOptions));
  types = toSignal(this.typeService.list().pipe(this.toOptions));
  priorities = toSignal(this.priorityService.list().pipe(this.toOptions));
  areas = toSignal(this.areaService.list().pipe(this.toOptions));
  trainers = toSignal(
    this.trainerService
      .list()
      .pipe(
        map((res) =>
          res.data.map(
            (i) =>
              ({ label: `${i.name} ${i.lastname}`, value: i.id }) as Option,
          ),
        ),
      ),
  );

  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.form.patchValue({ responsibleEmployeeId: e.id }),
    { isRequired: true, maxItems: 1 },
    () => this.form.patchValue({ responsibleEmployeeId: null }),
  );

  schedule = signal<ScheduleRowForm[]>([]);

  form = this.fb.group({
    topicId: [null as number | null, Validators.required],
    modalityId: [null as number | null, Validators.required],
    trainingTypeId: [null as number | null, Validators.required],
    responsibleEmployeeId: [null as number | null, Validators.required],
    trainerId: [null as number | null, Validators.required],
    priorityId: [null as number | null],
    areaId: [null as number | null],
    durationHours: [
      null as number | null,
      [Validators.required, Validators.min(1)],
    ],
    sessionHours: [
      null as number | null,
      [Validators.required, Validators.min(1)],
    ],
    startsAt: [null as string | null, Validators.required],
    endsAt: [null as string | null, Validators.required],
    objective: [null as string | null],
    content: [null as string | null],
    staffCount: [null as number | null],
  });

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  addScheduleRow() {
    this.schedule.update((rows) => [
      ...rows,
      { weekDay: 1, startTime: '08:00', endTime: '10:00' },
    ]);
  }

  removeScheduleRow(index: number) {
    this.schedule.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateRow(index: number, patch: Partial<ScheduleRowForm>) {
    this.schedule.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  submit() {
    if (this.form.invalid || !this.schedule().length || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: CreateTrainingProgramDto = {
      topicId: v.topicId!,
      modalityId: v.modalityId!,
      trainingTypeId: v.trainingTypeId!,
      responsibleEmployeeId: v.responsibleEmployeeId!,
      trainerId: v.trainerId!,
      priorityId: v.priorityId ?? null,
      areaId: v.areaId ?? null,
      durationHours: v.durationHours!,
      sessionHours: v.sessionHours!,
      startsAt: v.startsAt!,
      endsAt: v.endsAt!,
      objective: v.objective ?? null,
      content: v.content ?? null,
      staffCount: v.staffCount ?? null,
      schedule: this.schedule().map((r) => ({
        weekDay: r.weekDay,
        startsMinutes: this.toMinutes(r.startTime),
        endsMinutes: this.toMinutes(r.endTime),
      })),
    };
    this.submitting.set(true);
    this.service.create(dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.router.navigate(['/training/programs', res.data.id]);
        }
      },
      error: () => this.submitting.set(false),
    });
  }

  goBack() {
    this.router.navigate(['/training/programs']);
  }
}
