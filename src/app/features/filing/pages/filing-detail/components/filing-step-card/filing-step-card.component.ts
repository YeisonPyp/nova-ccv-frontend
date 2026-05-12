import { CommonModule } from "@angular/common";
import { Component, inject, input, output, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import {
  FilingStepApproval,
  StepStatus,
} from "@/app/core/models/filing/filing-workflow.model";
import { FilingWorkflowService } from "@/app/core/services/filing/filing-workflow.service";

@Component({
  selector: "app-filing-step-card",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./filing-step-card.component.html",
  styles: [
    `
      .status-pending {
        background: #fef9c3;
        color: #92400e;
        border: 1px solid #fde68a;
      }
      .status-approved {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
      }
      .status-rejected {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }
    `,
  ],
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
  };

  get statusClass() {
    return `status-${this.step().status}`;
  }

  get statusLabel() {
    return this.STATUS_LABELS[this.step().status] ?? this.step().status;
  }

  openEdit() {
    this.form.reset({
      status: this.step().status,
      review: this.step().review ?? "",
    });
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  save() {
    if (this.saving()) return;
    const { status, review } = this.form.value;
    const dto = { status: status ?? undefined, review: review ?? undefined };
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
  }
}
