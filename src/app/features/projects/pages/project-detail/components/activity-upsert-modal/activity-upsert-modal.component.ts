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
import { RISK_SCALE_OPTIONS } from "@/app/core/services/projects/project.service";
import { ProjectActivity } from "@/app/core/models/projects/project.model";
import { ColorPickerComponent } from "@/app/shared/components/color-picker/color-picker.component";
import {
  CreateActivityDto,
  ProjectActivitiesService,
} from "@/app/core/services/projects/project-activites.service";

@Component({
  selector: "app-activity-upsert-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ColorPickerComponent],
  templateUrl: "./activity-upsert-modal.component.html",
})
export class ActivityUpsertModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly projectId = input.required<number>();
  readonly activity = input<ProjectActivity | null>(null);
  readonly activities = input<ProjectActivity[]>([]);

  readonly onClose = output<void>();
  readonly onSaved = output<ProjectActivity>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectActivitiesService);

  readonly riskOptions = RISK_SCALE_OPTIONS;
  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: [""],
    parentId: [null],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    starts: [""],
    ends: [""],
    priority: [""],
    budgetAmount: [null],
    color: [""],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        const act = this.activity();
        if (act) {
          this.form.reset({
            name: act.name,
            description: act.description ?? "",
            parentId: act.parentId ?? null,
            displayOrder: act.displayOrder,
            starts: act.startsAt ?? "",
            ends: act.endsAt ?? "",
            priority: act.priority ?? "",
            budgetAmount: act.budgetAmount ?? null,
            color: act.colorHex ?? "",
          });
        } else {
          this.form.reset({
            name: "",
            description: "",
            parentId: null,
            displayOrder: this.activities().length + 1,
            starts: "",
            ends: "",
            priority: "",
            budgetAmount: null,
          });
        }
      }
    });
  }

  get parentOptions(): ProjectActivity[] {
    const current = this.activity();
    return this.activities().filter((a) => a.id !== current?.id);
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
    const dto: CreateActivityDto = {
      projectId: this.projectId(),
      parentId: v.parentId || null,
      name: v.name,
      description: v.description || undefined,
      displayOrder: v.displayOrder,
      starts: v.starts || undefined,
      ends: v.ends || undefined,
      priority: v.priority || undefined,
      budgetAmount: v.budgetAmount ?? null,
      colorHex: v.color || undefined,
    };

    const act = this.activity();
    const req$ = act
      ? this.projectService.updateActivity(act.id, dto)
      : this.projectService.createActivity(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.onSaved.emit(res.data);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? "Error al guardar la actividad");
      },
    });
  }
}
