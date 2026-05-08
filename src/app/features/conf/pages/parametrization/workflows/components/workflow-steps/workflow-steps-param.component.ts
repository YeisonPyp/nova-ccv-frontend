import { CommonModule } from "@angular/common";
import { Component, inject, input, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { WorkflowService } from "../../../../../../../core/services/filing/workflow.service";
import {
  Workflow,
  WorkflowStep,
} from "../../../../../../../core/models/filing/workflow.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-workflow-steps-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./workflow-steps-param.component.html",
  styles: [
    `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-overlay {
        position: fixed; inset: 0; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff; border-radius: 12px; padding: 24px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: slideUp 0.2s ease-out;
      }
      .modal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
      .modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
    `,
  ],
})
export class WorkflowStepsParamComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(WorkflowService);

  workflow = input<Workflow | null>(null);

  steps = signal<WorkflowStep[]>([]);
  stepsLoaded = signal(false);

  stepModalMode = signal<"create" | "update" | null>(null);
  showDeleteStepModal = signal(false);
  editingStep = signal<WorkflowStep | null>(null);

  stepForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(255)]),
    description: new FormControl(""),
    stepOrder: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    positionId: new FormControl<number | null>(null),
  });

  stepColumns: TableColumn<WorkflowStep>[] = [
    { key: "stepOrder", label: "Orden" },
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "positionId", label: "ID Cargo" },
  ];

  get canReadStep() { return this.auth.hasPermission("WORKFLOW_STEP_READ"); }
  get canCreateStep() { return this.auth.hasPermission("WORKFLOW_STEP_CREATE"); }
  get canUpdateStep() { return this.auth.hasPermission("WORKFLOW_STEP_UPDATE"); }
  get canDeleteStep() { return this.auth.hasPermission("WORKFLOW_STEP_DELETE"); }

  onStepsToggle(event: Event) {
    const wf = this.workflow();
    if ((event.target as HTMLDetailsElement).open && wf && !this.stepsLoaded()) {
      this.loadSteps(wf.id);
    }
  }

  loadSteps(workflowId: number) {
    this.stepsLoaded.set(true);
    this.service.findSteps(workflowId).subscribe({
      next: (res) => {
        if (res.success && res.data) this.steps.set(res.data);
      },
      error: () => this.stepsLoaded.set(false),
    });
  }

  openCreateStep() {
    this.stepForm.reset({ name: "", description: "", stepOrder: 1, positionId: null });
    this.editingStep.set(null);
    this.stepModalMode.set("create");
  }

  openEditStep(step: WorkflowStep) {
    this.stepForm.reset({
      name: step.name,
      description: step.description ?? "",
      stepOrder: step.stepOrder,
      positionId: step.positionId,
    });
    this.editingStep.set(step);
    this.stepModalMode.set("update");
  }

  closeStepModal() { this.stepModalMode.set(null); }

  submitStep() {
    if (this.stepForm.invalid) return;
    const { name, description, stepOrder, positionId } = this.stepForm.value;
    const mode = this.stepModalMode();
    const wf = this.workflow()!;

    if (mode === "create") {
      this.service
        .createStep({
          workflowId: wf.id,
          name: name!,
          description: description ?? undefined,
          stepOrder: stepOrder!,
          positionId: positionId ?? null,
        })
        .subscribe({
          next: () => { this.closeStepModal(); this.loadSteps(wf.id); },
        });
    } else if (mode === "update") {
      const step = this.editingStep()!;
      this.service
        .updateStep(step.id, {
          name: name!,
          description: description ?? undefined,
          stepOrder: stepOrder!,
          positionId: positionId ?? null,
        })
        .subscribe({
          next: () => { this.closeStepModal(); this.loadSteps(wf.id); },
        });
    }
  }

  openDeleteStep(step: WorkflowStep) {
    this.editingStep.set(step);
    this.showDeleteStepModal.set(true);
  }

  closeDeleteStepModal() {
    this.showDeleteStepModal.set(false);
    this.editingStep.set(null);
  }

  confirmDeleteStep() {
    const step = this.editingStep();
    const wf = this.workflow();
    if (!step || !wf) return;
    this.service.deleteStep(step.id).subscribe({
      next: () => { this.closeDeleteStepModal(); this.loadSteps(wf.id); },
    });
  }
}
