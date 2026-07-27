import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { TrainingRequestService } from '@/app/core/services/training/training-request.service';
import { CreateTrainingRequestDto } from '@/app/core/models/training/training-request.models';
import {
  TrainingModalityService,
  TrainingPriorityService,
  TrainingTopicService,
  TrainingTypeService,
} from '@/app/core/services/training/training-catalog.service';
import { Employee } from '@/app/core/models/assessment/employee.model';
import {
  Option,
  SelectorComponent,
} from '@/app/shared/components/selector/selector.component';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectorComponent],
  templateUrl: './request-form.component.html',
})
export class RequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TrainingRequestService);

  private readonly topicService = inject(TrainingTopicService);
  private readonly modalityService = inject(TrainingModalityService);
  private readonly priorityService = inject(TrainingPriorityService);
  private readonly typeService = inject(TrainingTypeService);

  submitting = signal(false);

  /** Only the employees the current user is responsible for. */
  employees = signal<Employee[]>([]);
  selectedIds = signal<number[]>([]);

  private toOptions = map((res: { data: { id: number; name: string }[] }) =>
    res.data.map((i) => ({ label: i.name, value: i.id }) as Option),
  );

  topics = toSignal(this.topicService.list().pipe(this.toOptions));
  modalities = toSignal(this.modalityService.list().pipe(this.toOptions));
  priorities = toSignal(this.priorityService.list().pipe(this.toOptions));
  types = toSignal(
    this.typeService
      .list()
      .pipe(
        map((res) =>
          res.data.map((i) => ({ label: i.name, value: i.name }) as Option),
        ),
      ),
  );

  form = this.fb.group({
    trainingTopicId: [null as number | null, Validators.required],
    modalityId: [null as number | null, Validators.required],
    priorityId: [null as number | null, Validators.required],
    type: [null as string | null, Validators.required],
    topic: ['', Validators.required],
    justification: ['', Validators.required],
    duration: [null as number | null, [Validators.required, Validators.min(1)]],
    content: [''],
  });

  constructor() {
    this.service.requestableEmployees().subscribe((res) => {
      this.employees.set(res.data ?? []);
    });
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  toggleEmployee(id: number) {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  submit() {
    if (this.form.invalid || !this.selectedIds().length || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: CreateTrainingRequestDto = {
      trainingTopicId: v.trainingTopicId!,
      modalityId: v.modalityId!,
      priorityId: v.priorityId!,
      type: v.type!,
      topic: v.topic!,
      justification: v.justification!,
      duration: v.duration!,
      content: v.content || null,
      employeeIds: this.selectedIds(),
    };
    this.submitting.set(true);
    this.service.create(dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.router.navigate(['/training/requests', res.data.id]);
        }
      },
      error: () => this.submitting.set(false),
    });
  }

  goBack() {
    this.router.navigate(['/training/requests']);
  }
}
