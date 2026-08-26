import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import {
  ProjectService,
  CreateRiskDto,
  RISK_SCALE_OPTIONS,
} from "@/app/core/services/projects/project.service";
import { ProjectRisk } from "@/app/core/models/projects/project.model";

@Component({
  selector: "app-risk-upsert-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./risk-upsert-modal.component.html",
})
export class RiskUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly projectId = input.required<number>();
  readonly risk = input<ProjectRisk | null>(null);
  readonly risks = input<ProjectRisk[]>([]);

  readonly onClose = output<void>();
  readonly onSaved = output<ProjectRisk>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  readonly riskOptions = RISK_SCALE_OPTIONS;
  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    estimatedCostAmount: [null],
    estimatedHours: [null],
    probability: ["low"],
    priority: ["medium"],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const r = this.risk();
        if (r) {
          this.form.reset({
            name: r.name,
            description: r.description ?? "",
            displayOrder: r.displayOrder,
            estimatedCostAmount: r.estimatedCostAmount ?? null,
            estimatedHours: r.estimatedHours ?? null,
            probability: r.probability ?? "low",
            priority: r.priority ?? "medium",
          });
        } else {
          this.form.reset({
            name: "",
            description: "",
            displayOrder: this.risks().length + 1,
            estimatedCostAmount: null,
            estimatedHours: null,
            probability: "low",
            priority: "medium",
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
    const dto: CreateRiskDto = {
      projectId: this.projectId(),
      name: v.name,
      description: v.description || undefined,
      displayOrder: v.displayOrder,
      estimatedCostAmount: v.estimatedCostAmount ?? null,
      estimatedHours: v.estimatedHours ?? null,
      probability: v.probability || undefined,
      priority: v.priority || undefined,
    };

    const r = this.risk();
    const req$ = r
      ? this.projectService.updateRisk(r.id, dto)
      : this.projectService.createRisk(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.onSaved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? "Error al guardar el riesgo");
      },
    });
  }
}
