import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { ContractAssignmentStatus } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-assignment-status-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./assignment-status-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class AssignmentStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  assignmentStatusItems = signal<ContractAssignmentStatus[]>([]);
  assignmentStatusPage = signal(1);
  assignmentStatusSize = signal(10);
  assignmentStatusTotalPages = signal(0);
  assignmentStatusLoaded = signal(false);
  assignmentStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteAssignmentStatusModal = signal(false);
  editingAssignmentStatus = signal<ContractAssignmentStatus | null>(null);

  assignmentStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    color: new FormControl("", [Validators.required, Validators.maxLength(6)]),
  });

  assignmentStatusColumns: TableColumn<ContractAssignmentStatus>[] = [
    { key: "name", label: "Nombre" },
    { key: "color", label: "Color" },
  ];

  get canReadAssignmentStatus() { return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_READ"); }
  get canCreateAssignmentStatus() { return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_CREATE"); }
  get canUpdateAssignmentStatus() { return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_UPDATE"); }
  get canDeleteAssignmentStatus() { return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_DELETE"); }

  onAssignmentStatusToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.assignmentStatusLoaded()) this.loadAssignmentStatus(1);
  }

  loadAssignmentStatus(page: number) {
    this.assignmentStatusPage.set(page);
    this.assignmentStatusLoaded.set(true);
    this.contractParamsService.findAssignmentStatuses({ page: page - 1, size: this.assignmentStatusSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.assignmentStatusItems.set(res.data.content); this.assignmentStatusTotalPages.set(res.data.totalPages); } },
      error: () => this.assignmentStatusLoaded.set(false),
    });
  }

  openCreateAssignmentStatus() { this.assignmentStatusForm.reset({ name: "", color: "" }); this.editingAssignmentStatus.set(null); this.assignmentStatusModalMode.set("create"); }
  openEditAssignmentStatus(item: ContractAssignmentStatus) { this.assignmentStatusForm.reset({ name: item.name, color: item.color }); this.editingAssignmentStatus.set(item); this.assignmentStatusModalMode.set("update"); }
  closeAssignmentStatusModal() { this.assignmentStatusModalMode.set(null); }

  submitAssignmentStatus() {
    if (this.assignmentStatusForm.invalid) return;
    const { name, color } = this.assignmentStatusForm.value;
    const mode = this.assignmentStatusModalMode();
    if (mode === "create") {
      this.contractParamsService.createAssignmentStatus({ name: name!, color: color! }).subscribe({
        next: () => { this.closeAssignmentStatusModal(); this.loadAssignmentStatus(this.assignmentStatusPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingAssignmentStatus()!;
      this.contractParamsService.updateAssignmentStatus(item.id, { name: name!, color: color! }).subscribe({
        next: () => { this.closeAssignmentStatusModal(); this.loadAssignmentStatus(this.assignmentStatusPage()); },
      });
    }
  }

  openDeleteAssignmentStatus(item: ContractAssignmentStatus) { this.editingAssignmentStatus.set(item); this.showDeleteAssignmentStatusModal.set(true); }
  closeDeleteAssignmentStatusModal() { this.showDeleteAssignmentStatusModal.set(false); this.editingAssignmentStatus.set(null); }
  confirmDeleteAssignmentStatus() {
    const item = this.editingAssignmentStatus();
    if (!item) return;
    this.contractParamsService.deleteAssignmentStatus(item.id).subscribe({
      next: () => { this.closeDeleteAssignmentStatusModal(); this.loadAssignmentStatus(this.assignmentStatusPage()); },
    });
  }
}
