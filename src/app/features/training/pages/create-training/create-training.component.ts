import { AreaService } from '@/app/core/services/assessment/area.service';
import { TrainerService } from '@/app/core/services/training/trainer.service';
import {
  TrainingModalityService,
  TrainingPriorityService,
  TrainingStatusService,
  TrainingTopicService,
  TrainingTypeService,
} from '@/app/core/services/training/training-catalog.service';
import { CurrencyFormatDirective } from '@/app/shared/directives/currency-format.directive';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TrainingService } from '@/app/core/services/training/training.service';
import { CreateTrainingDto } from '@/app/core/models/training/training.models';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';

@Component({
  selector: 'app-create-training',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldErrorDirective,
    CurrencyFormatDirective,
    SelectorComponent,
    SearchSelectComponent,
  ],
  templateUrl: './create-training.component.html',
})
export class CreateTrainingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TrainingService);

  private readonly employeeService = inject(EmployeeService);
  private readonly topicService = inject(TrainingTopicService);
  private readonly typeService = inject(TrainingTypeService);
  private readonly modalityService = inject(TrainingModalityService);
  private readonly trainerService = inject(TrainerService);
  private readonly areaService = inject(AreaService);
  private readonly statusService = inject(TrainingStatusService);
  private readonly priorityService = inject(TrainingPriorityService);

  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (e) => {
      this.form.patchValue({ responsibleEmployeeId: e.id });
    },
    { isRequired: true, maxItems: 1 },
    (_) => {
      this.form.patchValue({ responsibleEmployeeId: null });
    },
  );

  topics = toSignal(
    this.topicService
      .list()
      .pipe(
        map((response) =>
          response.data.map((i) => ({ label: i.name, value: i.id }) as Option),
        ),
      ),
  );
  modalities = toSignal(
    this.modalityService
      .list()
      .pipe(
        map((response) =>
          response.data.map((i) => ({ label: i.name, value: i.id }) as Option),
        ),
      ),
  );
  trainers = toSignal(
    this.trainerService
      .list()
      .pipe(
        map((response) =>
          response.data.map(
            (i) =>
              ({ label: `${i.name} ${i.lastname}`, value: i.id }) as Option,
          ),
        ),
      ),
  );
  areas = toSignal(
    this.areaService
      .list()
      .pipe(
        map((response) =>
          response.data.map((i) => ({ label: i.name, value: i.id }) as Option),
        ),
      ),
  );
  priorities = toSignal(
    this.priorityService
      .list()
      .pipe(
        map((response) =>
          response.data.map((i) => ({ label: i.name, value: i.id }) as Option),
        ),
      ),
  );
  types = toSignal(
    this.typeService
      .list()
      .pipe(
        map((response) =>
          response.data.map(
            (i) => ({ label: i.name, value: i.name }) as Option,
          ),
        ),
      ),
  );
  statuses = toSignal(
    this.statusService
      .list()
      .pipe(
        map((response) =>
          response.data.map(
            (i) => ({ label: i.name, value: i.name }) as Option,
          ),
        ),
      ),
  );

  submitting = signal(false);

  form = this.fb.group({
    topicId: [null as number | null, Validators.required],
    modalityId: [null as number | null, Validators.required],
    responsibleEmployeeId: [null as number | null, Validators.required],
    trainerId: [null as number | null, Validators.required],
    priorityId: [null as number | null, Validators.required],
    areaId: [null as number | null, Validators.required],
    type: [null as string | null, Validators.required],
    location: [null as string | null, Validators.required],
    durationHours: [null as number | null, Validators.required],
    cost: [0, Validators.required],
    description: [null as string | null],
    status: [null as string | null, Validators.required],
    scheduledDate: [null as string | null, Validators.required],
  });

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value as CreateTrainingDto;
      this.submitting.set(true);
      this.service.create(value).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success) {
            this.router.navigate(['/training', res.data.id]);
          }
        },
        error: () => {
          this.submitting.set(false);
        },
      });
    }
  }
}
