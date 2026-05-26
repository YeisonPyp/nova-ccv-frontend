import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { WorkflowService } from "@/app/core/services/filing/workflow.service";
import {
  Workflow,
  WorkflowStep,
} from "@/app/core/models/filing/workflow.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { EmployeeService } from "@/app/core/services/assessment/employee.service";
import { SearchSelectContextFactory } from "@/app/shared/components/search-select/on-search-select.interface";
import { Employee } from "@/app/core/models/assessment/employee.model";
import { SearchSelectComponent } from "@/app/shared/components/search-select/search-select.component";

@Component({
  selector: "app-workflow-steps-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    SearchSelectComponent,
  ],
  templateUrl: "./workflow-steps-param.component.html",
})
export class WorkflowStepsParamComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(WorkflowService);
  private readonly employeeService = inject(EmployeeService);

  workflow = input<Workflow | null>(null);

  steps = signal<WorkflowStep[]>([]);
  stepsLoaded = signal(false);

  stepModalMode = signal<"create" | "update" | null>(null);
  showDeleteStepModal = signal(false);
  editingStep = signal<WorkflowStep | null>(null);

  stepForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(255)]),
    description: new FormControl(""),
    stepOrder: new FormControl<number>(1, [
      Validators.required,
      Validators.min(1),
    ]),
    employeeId: new FormControl<number | null>(null, [Validators.required]),
  });

  stepColumns: TableColumn[] = [
    { key: "stepOrder", label: "Orden" },
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "employee.email", label: "Empleado" },
  ];

  employeeCtx: SearchSelectContextFactory<Employee>;

  constructor() {
    this.employeeCtx = this.employeeService.newSearchSelectEmployeeContext(
      (emp) => this.stepForm.patchValue({ employeeId: emp.id }),
    );

    effect(() => {
      const w = this.workflow();
      if (w) {
        this.loadSteps(w.id);
      }
    });
  }

  onFieldRemove(
    field: string,
    ctx: SearchSelectContextFactory<any>,
    item: any,
  ) {
    ctx.remove(item);
    this.stepForm.patchValue({ [field]: null });
    this.stepForm.get(field)?.markAsTouched();
  }

  isFieldInvalid(field: string): boolean {
    const c = this.stepForm.get(field);
    return !!(c?.touched && c?.invalid);
  }

  get canReadStep() {
    return this.auth.hasPermission("WORKFLOW_STEP_READ");
  }
  get canCreateStep() {
    return this.auth.hasPermission("WORKFLOW_STEP_CREATE");
  }
  get canUpdateStep() {
    return this.auth.hasPermission("WORKFLOW_STEP_UPDATE");
  }
  get canDeleteStep() {
    return this.auth.hasPermission("WORKFLOW_STEP_DELETE");
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
    this.stepForm.reset({
      name: "",
      description: "",
      stepOrder: 1,
      employeeId: null,
    });
    this.editingStep.set(null);
    this.stepModalMode.set("create");
  }

  openEditStep(step: WorkflowStep) {
    this.stepForm.reset({
      name: step.name,
      description: step.description ?? "",
      stepOrder: step.stepOrder,
      employeeId: step.employeeId,
    });
    if (step.employee) this.employeeCtx.selectResults([step.employee]);
    this.editingStep.set(step);
    this.stepModalMode.set("update");
  }

  closeStepModal() {
    this.stepModalMode.set(null);
    this.employeeCtx.clear();
  }

  submitStep() {
    if (this.stepForm.invalid) return;
    const { name, description, stepOrder, employeeId } = this.stepForm.value;
    const mode = this.stepModalMode();
    const wf = this.workflow()!;

    if (mode === "create") {
      this.service
        .createStep({
          workflowId: wf.id,
          name: name!,
          description: description ?? undefined,
          stepOrder: stepOrder!,
          employeeId: employeeId ?? null,
        })
        .subscribe({
          next: () => {
            this.closeStepModal();
            this.loadSteps(wf.id);
          },
        });
    } else if (mode === "update") {
      const step = this.editingStep()!;
      this.service
        .updateStep(step.id, {
          name: name!,
          description: description ?? undefined,
          stepOrder: stepOrder!,
          employeeId: employeeId ?? null,
        })
        .subscribe({
          next: () => {
            this.closeStepModal();
            this.loadSteps(wf.id);
          },
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
      next: () => {
        this.closeDeleteStepModal();
        this.loadSteps(wf.id);
      },
    });
  }
}
