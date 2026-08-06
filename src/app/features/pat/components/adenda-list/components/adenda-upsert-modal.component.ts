import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatAdendaService } from '@/app/core/services/pat/pat-adenda.service';
import { PatAdenda } from '@/app/core/models/pat/pat-models';

@Component({
  selector: 'app-adenda-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adenda-upsert-modal.component.html',
})
export class AdendaUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly adenda = input<PatAdenda | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatAdenda>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatAdendaService);

  submitting = signal(false);
  error = signal<string | null>(null);

  readonly editing = computed(() => this.adenda() != null);
  readonly title = computed(() => (this.editing() ? 'Editar adenda' : 'Nueva adenda'));
  readonly submitLabel = computed(() => (this.editing() ? 'Guardar cambios' : 'Crear adenda'));

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const a = this.adenda();
        this.form.reset({ name: a?.name ?? '' });
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
    const a = this.adenda();

    const req$ = a ? this.service.update(a.id, v) : this.service.create(v);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Error al guardar la adenda');
      },
    });
  }
}
