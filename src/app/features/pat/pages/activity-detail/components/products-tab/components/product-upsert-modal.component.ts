import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatActivityProductService } from '@/app/core/services/pat/pat-activity-product.service';
import { PatActivityProduct } from '@/app/core/models/pat/pat-models';
import { PatProductService } from '@/app/core/services/pat/pat-product.service';
import { PatUnitMeasureService } from '@/app/core/services/pat/pat-unit-measure.service';
import { ContextSearchSelectComponent } from '@/app/shared/components/context-search-select/context-search-select.component';

@Component({
  selector: 'app-pat-product-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ContextSearchSelectComponent],
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
  private readonly productCatalogService = inject(PatProductService);
  private readonly unitMeasureService = inject(PatUnitMeasureService);

  submitting = signal(false);
  error = signal<string | null>(null);

  productCtx = this.productCatalogService.newSearchSelectContext(
    (p) => this.form.patchValue({ productId: p.id }),
    { isRequired: true, label: 'Producto' },
    () => this.form.patchValue({ productId: null }),
  );

  unitMeasureCtx = this.unitMeasureService.newSearchSelectContext(
    (u) => this.form.patchValue({ unitMeasureId: u.id }),
    { isRequired: false, label: 'Unidad de medida' },
    () => this.form.patchValue({ unitMeasureId: null }),
  );

  form: FormGroup = this.fb.group({
    productId: [null, Validators.required],
    targetQuantity: [0, [Validators.required, Validators.min(0)]],
    unitMeasureId: [null],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const p = this.product();
        this.form.reset({
          productId: p?.product?.id ?? null,
          targetQuantity: p?.targetQuantity ?? 0,
          unitMeasureId: p?.unitMeasure?.id ?? null,
        });
        if (p?.product) this.productCtx.selectResults([p.product]);
        if (p?.unitMeasure) this.unitMeasureCtx.selectResults([p.unitMeasure]);
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
