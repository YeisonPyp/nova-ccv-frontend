import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityProductService } from '@/app/core/services/pat/pat-activity-product.service';
import { PatActivityProduct } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-pat-product-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-upsert-modal.component.html',
})
export class PatProductUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly activityId = input.required<number>();
  readonly product = input<PatActivityProduct | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatActivityProduct>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatActivityProductService);

  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    targetQuantity: [0, [Validators.required, Validators.min(0)]],
    unitMeasure: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const p = this.product();
        this.form.reset({
          code: p?.code ?? '',
          name: p?.name ?? '',
          description: p?.description ?? '',
          targetQuantity: p?.targetQuantity ?? 0,
          unitMeasure: p?.unitMeasure ?? '',
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
    const p = this.product();

    const req$ = p
      ? this.service.update(p.id, v)
      : this.service.create(this.activityId(), v);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar el producto');
      },
    });
  }
}
