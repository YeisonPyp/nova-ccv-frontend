import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityBenefitService } from '@/app/core/services/pat/pat-activity-benefit.service';
import { BenefitTypeService } from '@/app/core/services/pat/benefit-type.service';
import { PatActivityBenefit, PatBenefitType } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-pat-benefit-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './benefit-upsert-modal.component.html',
})
export class PatBenefitUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly activityId = input.required<number>();
  readonly benefit = input<PatActivityBenefit | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatActivityBenefit>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatActivityBenefitService);
  private readonly benefitTypeService = inject(BenefitTypeService);

  submitting = signal(false);
  error = signal<string | null>(null);
  benefitTypes = signal<PatBenefitType[]>([]);

  form: FormGroup = this.fb.group({
    benefitTypeId: [null, Validators.required],
    targetValue: [null],
  });

  constructor() {
    this.benefitTypeService.findAll({ size: 100 }).subscribe((res) => {
      if (res.success) this.benefitTypes.set(res.data.content);
    });

    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const b = this.benefit();
        this.form.reset({
          benefitTypeId: b?.benefitTypeId ?? null,
          targetValue: b?.targetValue ?? null,
        });
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const v = this.form.value;
    const b = this.benefit();

    const req$ = b
      ? this.service.update(b.id, v)
      : this.service.create(this.activityId(), v);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar el beneficio');
      },
    });
  }
}
