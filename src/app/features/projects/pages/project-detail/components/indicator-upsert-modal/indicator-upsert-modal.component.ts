import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  CreateProjectIndicatorDto,
  ProjectService,
  UpdateProjectIndicatorDto,
} from '@/app/core/services/projects/project.service';
import { ProjectIndicator } from '@/app/core/models/projects/project.model';

const INDICATOR_TYPE_OPTIONS = [
  { value: 'management', label: 'Gestión' },
  { value: 'result', label: 'Resultado' },
] as const;

@Component({
  selector: 'app-indicator-upsert-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './indicator-upsert-modal.component.html',
})
export class IndicatorUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly projectId = input.required<number>();
  readonly indicator = input<ProjectIndicator | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<ProjectIndicator>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  readonly typeOptions = INDICATOR_TYPE_OPTIONS;
  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    type: ['management', Validators.required],
    name: ['', Validators.required],
    targetValue: [null],
    currentValue: [null],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const i = this.indicator();
        if (i) {
          this.form.reset({
            type: i.type,
            name: i.name,
            targetValue: i.targetValue ?? null,
            currentValue: i.currentValue ?? null,
          });
        } else {
          this.form.reset({
            type: 'management',
            name: '',
            targetValue: null,
            currentValue: null,
          });
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

    if (i) {
      const dto: UpdateProjectIndicatorDto = {
        type: v.type,
        name: v.name,
        targetValue: v.targetValue ?? null,
        currentValue: v.currentValue ?? null,
      };
      this.projectService.updateIndicator(i.id, dto).subscribe({
        next: (res) => {
          this.submitting.set(false);
          if (res.success && res.data) this.onSaved.emit(res.data);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? 'Error al guardar el indicador');
        },
      });
      return;
    }

    const dto: CreateProjectIndicatorDto = {
      type: v.type,
      name: v.name,
      targetValue: v.targetValue ?? null,
    };

    this.projectService.createIndicator(this.projectId(), dto).subscribe({
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
