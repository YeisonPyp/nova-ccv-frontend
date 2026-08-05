import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, output, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HasPermissionDirective } from "@/app/shared/directives/has-permission.directive";
import { ImprovementActionService } from "@/app/core/services/improvement-plan/improvement-action.service";
import {
  approvalDecisionLabels,
  ImprovementActionApprovalDecision,
  ImprovementActionApprovalStepDto,
  ImprovementActionDto,
} from "@/app/core/models/improvement-plan/improvement-action.model";

@Component({
  selector: "app-approval-flow-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasPermissionDirective],
  templateUrl: "./approval-flow-modal.component.html",
})
export class ApprovalFlowModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly action = input.required<ImprovementActionDto>();

  readonly onClose = output<void>();
  readonly onUpdated = output<ImprovementActionDto>();

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ImprovementActionService);

  readonly decisionOptions = Object.entries(approvalDecisionLabels).map(
    ([value, label]) => ({
      value: value as ImprovementActionApprovalDecision,
      label,
    }),
  );

  steps = signal<ImprovementActionApprovalStepDto[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    observation: ["", Validators.required],
    decision: ["APPROVED" as ImprovementActionApprovalDecision, Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.error.set(null);
        this.form.reset({ observation: "", decision: "APPROVED" });
        this.loading.set(true);
        this.service.findApprovalSteps(this.action().id).subscribe((res) => {
          this.loading.set(false);
          if (res.success) this.steps.set(res.data);
        });
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
    this.service.createApprovalStep(this.action().id, v).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.steps.set([...this.steps(), res.data]);
          this.form.reset({ observation: "", decision: "APPROVED" });
        }
        this.submitting.set(false);
        this.service.findById(this.action().id).subscribe((r) => {
          if (r.success) this.onUpdated.emit(r.data);
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err.error?.message ?? "Error al registrar el paso de aprobación",
        );
      },
    });
  }
}
