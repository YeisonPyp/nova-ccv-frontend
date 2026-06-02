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
import { PatTacticalActivity } from "@/app/core/models/pat/pat-models";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";
import {
  CreatePatTacticalActivityDto,
  PatTacticalActivityService,
} from "@/app/core/services/pat/tactical-activity.service";

@Component({
  selector: "app-upsert-tactical-activity",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorDirective],
  templateUrl: "./upsert-tactical-activity.component.html",
})
export class UpsertTacticalActivityComponent {
  readonly isOpen = input<boolean>(false);
  readonly year = input.required<number>();
  readonly objectiveId = input.required<number>();

  readonly onClose = output<void>();
  readonly onSaved = output<PatTacticalActivity>();

  tacticalActivity = input<PatTacticalActivity | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PatTacticalActivityService);

  submitting = signal(false);
  error = signal<string | null>(null);

  readonly editing = computed(() => this.tacticalActivity() != null);
  readonly title = computed(() =>
    this.editing() ? "Editar actividad táctica" : "Nueva actividad táctica",
  );
  readonly submitLabel = computed(() =>
    this.editing() ? "Guardar cambios" : "Crear actividad táctica",
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
      const s = this.tacticalActivity();
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
    const dto: CreatePatTacticalActivityDto = {
      name: v.name!,
      code: v.code || undefined,
      description: v.description || undefined,
      year: this.year(),
      specificObjectiveId: this.objectiveId(),
    };

    const s = this.tacticalActivity();
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
