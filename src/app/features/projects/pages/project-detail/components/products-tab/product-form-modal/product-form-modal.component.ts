import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreateProjectProductDto,
  ProjectProductService,
} from '@/app/core/services/projects/project-product.service';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form-modal.component.html',
})
export class ProductFormModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProjectProductService);

  projectId = input.required<number>();

  onClose = output<void>();
  onSaved = output<void>();

  saving = signal(false);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    unitMeasure: ['', [Validators.required, Validators.maxLength(100)]],
    targetQuantity: [
      0,
      [Validators.required, Validators.min(0)],
    ],
    description: [''],
  });

  close() {
    this.onClose.emit();
  }

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: CreateProjectProductDto = {
      projectId: this.projectId(),
      code: v.code!,
      name: v.name!,
      unitMeasure: v.unitMeasure!,
      targetQuantity: v.targetQuantity ?? 0,
      description: v.description || undefined,
    };
    this.saving.set(true);
    this.service.create(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.onSaved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
