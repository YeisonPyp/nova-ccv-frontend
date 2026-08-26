import { CommonModule } from "@angular/common";
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import {
  FilingStepApproval,
  StepStatus,
} from "@/app/core/models/filing/filing-workflow.model";
import { FilingWorkflowService } from "@/app/core/services/filing/filing-workflow.service";
import { EmployeeCardComponent } from "@/app/features/contract/pages/employees/employee-card/employee-card.component";
import { debounceTime, distinctUntilChanged } from "rxjs";

@Component({
  selector: "app-filing-step-card",
  standalone: true,
  imports: [CommonModule, EmployeeCardComponent, ReactiveFormsModule],
  templateUrl: "./filing-step-card.component.html",
  styleUrl: "./filing-step-card.component.css",
})
export class FilingStepCardComponent {
  private readonly service = inject(FilingWorkflowService);

  step = input.required<FilingStepApproval>();
  filingId = input.required<number>();
  workflowId = input.required<number>();
  canEdit = input<boolean>(false);

  updated = output<FilingStepApproval>();

  editing = signal(false);
  saving = signal(false);

  form = new FormGroup({
    status: new FormControl<StepStatus | null>(null),
    review: new FormControl(""),
  });

  readonly STATUS_LABELS: Record<StepStatus, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    onhold: "En Espera",
  };

  constructor() {
    effect(() => {
      const step = this.step();
      this.form.patchValue(
        {
          status: step.status == "approved" ? null : step.status,
          review: step.review,
        },
        { emitEvent: false },
      );

      const canEdit = this.canEdit();
      if (!canEdit) {
        this.form.get("review")?.disable();
      }

      this.form.valueChanges
        .pipe(distinctUntilChanged(), debounceTime(500))
        .subscribe((value) => {
          if (this.saving()) return;
          const { status, review } = value;
          const dto = {
            status: status ?? undefined,
            review: review ?? undefined,
          };
          this.saving.set(true);
          this.service
            .updateStep(this.filingId(), this.workflowId(), this.step().id, dto)
            .subscribe({
              next: (res) => {
                if (res.success && res.data) {
                  this.updated.emit(res.data);
                  this.editing.set(false);
                }
                this.saving.set(false);
              },
              error: () => this.saving.set(false),
            });
        });
    });
  }

  get statusClass() {
    return `status-${this.step().status}`;
  }

  get statusLabel() {
    return this.STATUS_LABELS[this.step().status] ?? this.step().status;
  }

  onStatusChange(status: StepStatus) {
    this.form.patchValue({ status });
  }
}
