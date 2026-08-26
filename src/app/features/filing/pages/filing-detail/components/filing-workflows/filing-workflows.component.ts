import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  FilingWorkflow,
  FilingStepApproval,
} from "@/app/core/models/filing/filing-workflow.model";
import { Workflow } from "@/app/core/models/filing/workflow.model";
import { AuthService } from "@/app/core/services/auth.service";
import { FilingWorkflowService } from "@/app/core/services/filing/filing-workflow.service";
import { WorkflowService } from "@/app/core/services/filing/workflow.service";
import { FilingStepCardComponent } from "../filing-step-card/filing-step-card.component";

@Component({
  selector: "app-filing-workflows",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilingStepCardComponent],
  templateUrl: "./filing-workflows.component.html",
})
export class FilingWorkflowsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly filingWorkflowService = inject(FilingWorkflowService);
  private readonly workflowService = inject(WorkflowService);

  filingId = input.required<number>();

  workflows = signal<FilingWorkflow[]>([]);
  availableWorkflows = signal<Workflow[]>([]);
  loading = signal(false);
  showAddModal = signal(false);
  saving = signal(false);

  addForm = new FormGroup({
    workflowId: new FormControl<number | null>(null, Validators.required),
    alertTimeInterval: new FormControl("1 day"),
  });

  ngOnInit() {
    this.load();
    this.workflowService.findAll({ size: 100 }).subscribe((res) => {
      if (res.success && res.data)
        this.availableWorkflows.set(res.data.content);
    });
  }

  load() {
    this.loading.set(true);
    this.filingWorkflowService.getWorkflows(this.filingId()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.workflows.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  canEditStep(
    steps: FilingStepApproval[],
    index: number,
    step: FilingStepApproval,
  ): boolean {
    if (index > 0) {
      const previousStep = steps[index - 1];
      if (previousStep.status != "approved") return false;
    }

    const user = this.auth.currentUser();
    if (!user) return false;
    return user.isAdmin || user.employeeId === step.step.employeeId;
  }

  onStepUpdated(workflowId: number, updated: FilingStepApproval) {
    this.workflows.update((wfs) =>
      wfs.map((wf) =>
        wf.id !== workflowId
          ? wf
          : {
              ...wf,
              steps: wf.steps.map((s) => (s.id === updated.id ? updated : s)),
            },
      ),
    );
  }

  openAddModal() {
    this.addForm.reset({ workflowId: null, alertTimeInterval: "1 day" });
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  submitAdd() {
    if (this.addForm.invalid || this.saving()) return;
    const { workflowId, alertTimeInterval } = this.addForm.value;
    this.saving.set(true);
    this.filingWorkflowService
      .create(this.filingId(), {
        workflowId: workflowId!,
        alertTimeInterval: alertTimeInterval || undefined,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.workflows.update((wfs) => [...wfs, res.data]);
          }
          this.closeAddModal();
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }
}
