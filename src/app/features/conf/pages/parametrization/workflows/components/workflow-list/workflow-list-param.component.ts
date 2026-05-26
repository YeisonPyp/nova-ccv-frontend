import { CommonModule } from "@angular/common";
import { Component, inject, output, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { WorkflowService } from "@/app/core/services/filing/workflow.service";
import { Workflow } from "@/app/core/models/filing/workflow.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-workflow-list-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./workflow-list-param.component.html",
})
export class WorkflowListParamComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(WorkflowService);

  onSelect = output<Workflow | null>();

  workflows = signal<Workflow[]>([]);
  workflowPage = signal(1);
  workflowSize = signal(10);
  workflowTotalPages = signal(0);
  workflowsLoaded = signal(false);

  selectedWorkflowId = signal<number | null>(null);

  workflowModalMode = signal<"create" | "update" | null>(null);
  showDeleteWorkflowModal = signal(false);
  editingWorkflow = signal<Workflow | null>(null);

  workflowForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(255)]),
    description: new FormControl(""),
  });

  workflowColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canRead() {
    return this.auth.hasPermission("WORKFLOW_READ");
  }
  get canCreate() {
    return this.auth.hasPermission("WORKFLOW_CREATE");
  }
  get canUpdate() {
    return this.auth.hasPermission("WORKFLOW_UPDATE");
  }
  get canDelete() {
    return this.auth.hasPermission("WORKFLOW_DELETE");
  }
  get canReadStep() {
    return this.auth.hasPermission("WORKFLOW_STEP_READ");
  }

  onWorkflowsToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open && !this.workflowsLoaded()) {
      this.loadWorkflows(1);
    }
  }

  loadWorkflows(page: number) {
    this.workflowPage.set(page);
    this.workflowsLoaded.set(true);
    this.service
      .findAll({ page: page - 1, size: this.workflowSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.workflows.set(res.data.content);
            this.workflowTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.workflowsLoaded.set(false),
      });
  }

  selectWorkflow(wf: Workflow) {
    if (this.selectedWorkflowId() === wf.id) return;
    this.selectedWorkflowId.set(wf.id);
    this.onSelect.emit(wf);
  }

  // ── Workflow modal ──────────────────────────────────────────────────────────

  openCreateWorkflow() {
    this.workflowForm.reset({ name: "", description: "" });
    this.editingWorkflow.set(null);
    this.workflowModalMode.set("create");
  }

  openEditWorkflow(wf: Workflow) {
    this.workflowForm.reset({
      name: wf.name,
      description: wf.description ?? "",
    });
    this.editingWorkflow.set(wf);
    this.workflowModalMode.set("update");
  }

  closeWorkflowModal() {
    this.workflowModalMode.set(null);
  }

  submitWorkflow() {
    if (this.workflowForm.invalid) return;
    const { name, description } = this.workflowForm.value;
    const dto = { name: name!, description: description ?? undefined };
    const mode = this.workflowModalMode();

    if (mode === "create") {
      this.service.create(dto).subscribe({
        next: () => {
          this.closeWorkflowModal();
          this.loadWorkflows(this.workflowPage());
        },
      });
    } else if (mode === "update") {
      const wf = this.editingWorkflow()!;
      this.service.update(wf.id, dto).subscribe({
        next: () => {
          this.closeWorkflowModal();
          this.loadWorkflows(this.workflowPage());
        },
      });
    }
  }

  openDeleteWorkflow(wf: Workflow) {
    this.editingWorkflow.set(wf);
    this.showDeleteWorkflowModal.set(true);
  }

  closeDeleteWorkflowModal() {
    this.showDeleteWorkflowModal.set(false);
    this.editingWorkflow.set(null);
  }

  confirmDeleteWorkflow() {
    const wf = this.editingWorkflow();
    if (!wf) return;
    this.service.delete(wf.id).subscribe({
      next: () => {
        this.closeDeleteWorkflowModal();
        if (this.selectedWorkflowId() === wf.id) {
          this.selectedWorkflowId.set(null);
          this.onSelect.emit(null);
        }
        this.loadWorkflows(this.workflowPage());
      },
    });
  }
}
