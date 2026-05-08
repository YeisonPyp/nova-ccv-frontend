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
} from "../../../../../../core/models/filing/filing-workflow.model";
import { Workflow } from "../../../../../../core/models/filing/workflow.model";
import { AuthService } from "../../../../../../core/services/auth.service";
import { FilingWorkflowService } from "../../../../../../core/services/filing/filing-workflow.service";
import { WorkflowService } from "../../../../../../core/services/filing/workflow.service";
import { PaginationComponent } from "../../../../../../shared/components/pagination/pagination.component";
import { FilingStepCardComponent } from "../filing-step-card/filing-step-card.component";

const PAGE_SIZE = 3;

@Component({
  selector: "app-filing-workflows",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    FilingStepCardComponent,
  ],
  templateUrl: "./filing-workflows.component.html",
  styles: [
    `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
      }
      .modal-box {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        animation: slideUp 0.2s ease-out;
      }
    `,
  ],
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

  page = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.workflows().length / PAGE_SIZE)),
  );

  paginatedWorkflows = computed(() => {
    const p = this.page();
    const start = (p - 1) * PAGE_SIZE;
    return this.workflows().slice(start, start + PAGE_SIZE);
  });

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
          if (this.page() > this.totalPages()) this.page.set(1);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  canEditStep(step: FilingStepApproval): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    return user.isAdmin || user.employeeId === step.reviewerId;
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
            this.page.set(this.totalPages());
          }
          this.closeAddModal();
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }
}
