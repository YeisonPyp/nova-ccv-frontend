import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PatStrategicObjective } from "@/app/core/models/pat/pat-models";
import {
  CreatePatStrategicObjectiveDto,
  PatStrategicObjectiveService,
} from "@/app/core/services/pat/strategic-objective.service";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";
import { PatPlanProcess } from "@/app/core/models/strategic-plan/strategic-plan.models";

@Component({
  selector: "app-upsert-objective",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: "./upsert-objective.component.html",
})
export class UpsertObjectiveComponent {
  readonly isOpen = input.required<boolean>();
  readonly process = input.required<PatPlanProcess>();
  readonly objective = input<PatStrategicObjective | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatStrategicObjective>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatStrategicObjectiveService);

  submitting = signal(false);
  error = signal<string | null>(null);

  readonly editing = computed(() => this.objective() != null);
  readonly title = computed(() =>
    this.editing()
      ? "Editar objetivo estratégico"
      : "Nuevo objetivo estratégico",
  );
  readonly submitLabel = computed(() =>
    this.editing() ? "Guardar cambios" : "Crear objetivo",
  );

  form = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(300)]],
    code: ["", Validators.maxLength(10)],
    description: ["", Validators.maxLength(1000)],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.error.set(null);
      const o = this.objective();
      if (o) {
        this.form.reset({
          name: o.name,
          code: o.code ?? "",
          description: o.description ?? "",
        });
      } else {
        this.form.reset({
          name: "",
          code: "",
          description: "",
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
    const dto: CreatePatStrategicObjectiveDto = {
      name: v.name!,
      code: v.code || undefined,
      processId: this.process().id,
      description: v.description || undefined,
    };

    const o = this.objective();
    const req$ = o ? this.service.update(o.id, dto) : this.service.create(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "Error al guardar el objetivo");
      },
    });
  }
}
