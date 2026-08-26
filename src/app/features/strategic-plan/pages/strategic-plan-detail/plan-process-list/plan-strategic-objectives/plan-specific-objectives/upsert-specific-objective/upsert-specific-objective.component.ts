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
import { PatSpecificObjective } from "@/app/core/models/pat/pat-models";
import {
  CreatePatSpecificObjectiveDto,
  PatSpecificObjectiveService,
} from "@/app/core/services/pat/pat-specific-objective.service";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";

@Component({
  selector: "app-upsert-specific-objective",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: "./upsert-specific-objective.component.html",
})
export class UpsertSpecificObjectiveComponent {
  readonly isOpen = input<boolean>(false);
  readonly strategicObjectiveId = input.required<number>();
  readonly specific = input<PatSpecificObjective | null>(null);

  readonly onClose = output<void>();
  readonly onSaved = output<PatSpecificObjective>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatSpecificObjectiveService);

  submitting = signal(false);
  error = signal<string | null>(null);

  readonly editing = computed(() => this.specific() != null);
  readonly title = computed(() =>
    this.editing() ? "Editar objetivo específico" : "Nuevo objetivo específico",
  );
  readonly submitLabel = computed(() =>
    this.editing() ? "Guardar cambios" : "Crear objetivo específico",
  );

  form = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(300)]],
    code: ["", Validators.maxLength(15)],
    description: ["", Validators.maxLength(1000)],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.error.set(null);
      const s = this.specific();
      if (s) {
        this.form.reset({
          name: s.name,
          code: s.code ?? "",
          description: s.description ?? "",
        });
      } else {
        this.form.reset({ name: "", code: "", description: "" });
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
    const dto: CreatePatSpecificObjectiveDto = {
      name: v.name!,
      code: v.code || undefined,
      description: v.description || undefined,
      strategicObjectiveId: this.strategicObjectiveId(),
    };

    const s = this.specific();
    const req$ = s ? this.service.update(s.id, dto) : this.service.create(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "Error al guardar");
      },
    });
  }
}
