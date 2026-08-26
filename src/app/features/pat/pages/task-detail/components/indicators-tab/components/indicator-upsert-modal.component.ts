import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityIndicatorService } from '@/app/core/services/pat/pat-activity-indicator.service';
import { PatActivityIndicator } from '@/app/core/models/pat/pat-models';
import { PatManagementIndicatorService } from '@/app/core/services/pat/pat-management-indicator.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';

@Component({
  selector: 'app-indicator-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ContextSearchSelectComponent],
  templateUrl: './indicator-upsert-modal.component.html',
})
export class IndicatorUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly taskId = input.required<number>();
  readonly indicator = input<PatActivityIndicator | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatActivityIndicator>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatActivityIndicatorService);
  private readonly managementIndicatorService = inject(
    PatManagementIndicatorService,
  );

  submitting = signal(false);
  error = signal<string | null>(null);

  managementIndicatorCtx = this.managementIndicatorService.newSearchSelectContext(
    (mi) => this.form.patchValue({ managementIndicatorId: mi.id }),
    { isRequired: true, label: 'Indicador de gestión' },
    () => this.form.patchValue({ managementIndicatorId: null }),
  );

  form: FormGroup = this.fb.group({
    managementIndicatorId: [null, Validators.required],
    baseValue: [null],
    goalValue: [null],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const i = this.indicator();
        this.form.reset({
          managementIndicatorId: i?.managementIndicator?.id ?? null,
          baseValue: i?.baseValue ?? null,
          goalValue: i?.goalValue ?? null,
        });
        if (i?.managementIndicator) {
          this.managementIndicatorCtx.selectResults([i.managementIndicator]);
        }
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
    const i = this.indicator();

    const req$ = i
      ? this.service.update(i.id, v)
      : this.service.create(this.taskId(), v);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar el indicador');
      },
    });
  }
}
