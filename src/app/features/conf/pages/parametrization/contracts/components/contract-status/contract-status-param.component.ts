import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { ContractStatus } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-contract-status-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./contract-status-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class ContractStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  contractStatusItems = signal<ContractStatus[]>([]);
  contractStatusPage = signal(1);
  contractStatusSize = signal(10);
  contractStatusTotalPages = signal(0);
  contractStatusLoaded = signal(false);
  contractStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteContractStatusModal = signal(false);
  editingContractStatus = signal<ContractStatus | null>(null);

  contractStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    description: new FormControl(""),
  });

  contractStatusColumns: TableColumn<ContractStatus>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadContractStatus() { return this.auth.hasPermission("CONTRACT_STATUS_READ"); }
  get canCreateContractStatus() { return this.auth.hasPermission("CONTRACT_STATUS_CREATE"); }
  get canUpdateContractStatus() { return this.auth.hasPermission("CONTRACT_STATUS_UPDATE"); }
  get canDeleteContractStatus() { return this.auth.hasPermission("CONTRACT_STATUS_DELETE"); }

  onContractStatusToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.contractStatusLoaded()) this.loadContractStatus(1);
  }

  loadContractStatus(page: number) {
    this.contractStatusPage.set(page);
    this.contractStatusLoaded.set(true);
    this.contractParamsService.findContractStatuses({ page: page - 1, size: this.contractStatusSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.contractStatusItems.set(res.data.content); this.contractStatusTotalPages.set(res.data.totalPages); } },
      error: () => this.contractStatusLoaded.set(false),
    });
  }

  openCreateContractStatus() {
    this.contractStatusForm.reset({ name: "", description: "" });
    this.editingContractStatus.set(null);
    this.contractStatusModalMode.set("create");
  }

  openEditContractStatus(item: ContractStatus) {
    this.contractStatusForm.reset({ name: item.name, description: item.description ?? "" });
    this.editingContractStatus.set(item);
    this.contractStatusModalMode.set("update");
  }

  closeContractStatusModal() { this.contractStatusModalMode.set(null); }

  submitContractStatus() {
    if (this.contractStatusForm.invalid) return;
    const { name, description } = this.contractStatusForm.value;
    const mode = this.contractStatusModalMode();
    if (mode === "create") {
      this.contractParamsService.createContractStatus({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeContractStatusModal(); this.loadContractStatus(this.contractStatusPage()); },
      });
    } else if (mode === "update") {
      const item = this.editingContractStatus()!;
      this.contractParamsService.updateContractStatus(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeContractStatusModal(); this.loadContractStatus(this.contractStatusPage()); },
      });
    }
  }

  openDeleteContractStatus(item: ContractStatus) { this.editingContractStatus.set(item); this.showDeleteContractStatusModal.set(true); }
  closeDeleteContractStatusModal() { this.showDeleteContractStatusModal.set(false); this.editingContractStatus.set(null); }
  confirmDeleteContractStatus() {
    const item = this.editingContractStatus();
    if (!item) return;
    this.contractParamsService.deleteContractStatus(item.id).subscribe({
      next: () => { this.closeDeleteContractStatusModal(); this.loadContractStatus(this.contractStatusPage()); },
    });
  }
}
