import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { TrainingRequestService } from '@/app/core/services/training/training-request.service';
import { TrainingRequestDetail } from '@/app/core/models/training/training-request.models';
import { TrainerService } from '@/app/core/services/training/trainer.service';
import { TrainingStatusService } from '@/app/core/services/training/training-catalog.service';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { EmployeeService } from '@/app/core/services/assessment/employee.service';
import { AuthService } from '@/app/core/services/auth.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { SearchSelectComponent } from '@/app/shared/components/search-select/search-select.component';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    SearchSelectComponent,
    SelectorComponent,
  ],
  templateUrl: './request-detail.component.html',
})
export class RequestDetailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TrainingRequestService);
  private readonly auth = inject(AuthService);

  private readonly trainerService = inject(TrainerService);
  private readonly statusService = inject(TrainingStatusService);
  private readonly areaService = inject(AreaService);
  private readonly employeeService = inject(EmployeeService);

  requestId = input.required<number>();

  detail = signal<TrainingRequestDetail | null>(null);
  loading = signal(false);
  saving = signal(false);

  respondOpen = signal(false);
  convertOpen = signal(false);

  get canManage() {
    return this.auth.hasPermission('TRAINING_REQUEST_UPDATE');
  }
  get canConvert() {
    return this.auth.hasPermission('TRAINING_CREATE');
  }

  private toOptions = map((res: { data: { id: number; name: string }[] }) =>
    res.data.map((i) => ({ label: i.name, value: i.id }) as Option),
  );

  areas = toSignal(this.areaService.list().pipe(this.toOptions));
  statuses = toSignal(
    this.statusService
      .list()
      .pipe(
        map((res) =>
          res.data.map((i) => ({ label: i.name, value: i.name }) as Option),
        ),
      ),
  );
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

  respondForm = this.fb.group({
    status: ['APROBADA', Validators.required],
    response: ['', Validators.required],
  });

  convertForm = this.fb.group({
    responsibleEmployeeId: [null as number | null, Validators.required],
    trainerId: [null as number | null, Validators.required],
    areaId: [null as number | null],
    location: ['', Validators.required],
    cost: [0, Validators.required],
    scheduledDate: ['', Validators.required],
    status: ['PROGRAMADA', Validators.required],
  });

  employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
    (e) => this.convertForm.patchValue({ responsibleEmployeeId: e.id }),
    { isRequired: true, maxItems: 1, label: 'Responsable' },
    () => this.convertForm.patchValue({ responsibleEmployeeId: null }),
  );

  constructor() {
    effect(() => {
      this.load(this.requestId());
    });
  }

  load(id: number) {
    this.loading.set(true);
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.detail.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  redirect() {
    this.service.redirect(this.requestId()).subscribe((res) => {
      if (res.success) this.detail.set(res.data);
    });
  }

  submitRespond() {
    if (this.respondForm.invalid || this.saving()) return;
    this.saving.set(true);
    this.service
      .respond(this.requestId(), {
        status: this.respondForm.value.status!,
        response: this.respondForm.value.response!,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.success) {
            this.detail.set(res.data);
            this.respondOpen.set(false);
          }
        },
        error: () => this.saving.set(false),
      });
  }

  submitConvert() {
    if (this.convertForm.invalid || this.saving()) return;
    const v = this.convertForm.value;
    this.saving.set(true);
    this.service
      .convertToTraining(this.requestId(), {
        responsibleEmployeeId: v.responsibleEmployeeId!,
        trainerId: v.trainerId!,
        areaId: v.areaId ?? null,
        location: v.location!,
        cost: v.cost ?? 0,
        scheduledDate: v.scheduledDate!,
        status: v.status!,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.success) {
            this.convertOpen.set(false);
            this.router.navigate(['/training', res.data.id]);
          }
        },
        error: () => this.saving.set(false),
      });
  }

  goBack() {
    this.router.navigate(['/training/requests']);
  }
}
