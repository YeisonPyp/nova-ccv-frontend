import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreatePatProgramDto,
  PatProgramService,
} from '@/app/core/services/pat/pat-program.service';
import { PatStrategicProgram } from '@/app/core/models/pat/pat-models';
import { FormFieldErrorDirective } from '@/app/shared/directives/form-field-error.directive';

@Component({
  selector: 'app-create-pat-program',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: './create-program.component.html',
})
export class CreatePatProgramComponent {
  readonly isOpen = input<boolean>(false);
  readonly program = input<PatStrategicProgram | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatStrategicProgram>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatProgramService);

  submitting = signal(false);
  year = input.required<number>();
  error = signal<string | null>(null);

  readonly editing = computed(() => this.program() != null);
  readonly title = computed(() =>
    this.editing()
      ? 'Editar programa estratégico'
      : 'Nuevo programa estratégico',
  );
  readonly submitLabel = computed(() =>
    this.editing() ? 'Guardar cambios' : 'Crear programa',
  );

  form = this.fb.group({
    description: ['', Validators.maxLength(1000)],
    startsAt: ['', Validators.required],
    endsAt: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.error.set(null);
      const p = this.program();
      if (p) {
        this.form.reset({
          description: p.description ?? '',
          startsAt: p.startsAt,
          endsAt: p.endsAt,
        });
      } else {
        this.form.reset({
          description: '',
          startsAt: '',
          endsAt: '',
        });
      }
    });
  }

  close() {
    this.onClose.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.value;
    const dto: CreatePatProgramDto = {
      year: this.year(),
      description: v.description ?? undefined,
      startsAt: v.startsAt!,
      endsAt: v.endsAt!,
    };

    const p = this.program();
    const req$ = p ? this.service.update(p.id, dto) : this.service.create(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Error al guardar el programa');
      },
    });
  }
}
