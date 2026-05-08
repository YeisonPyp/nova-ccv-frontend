import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { ContractCancellationType } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-cancellation-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./cancellation-type-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class CancellationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  cancellationTypeItems = signal<ContractCancellationType[]>([]);
  cancellationTypePage = signal(1);
  cancellationTypeSize = signal(10);
  cancellationTypeTotalPages = signal(0);
  cancellationTypeLoaded = signal(false);
  cancellationTypeModalMode = signal<"create" | "update" | null>(null);
  showDeleteCancellationTypeModal = signal(false);
  editingCancellationType = signal<ContractCancellationType | null>(null);

  cancellationTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  cancellationTypeColumns: TableColumn<ContractCancellationType>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadCancellationType() { return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_READ"); }
  get canCreateCancellationType() { return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_CREATE"); }
  get canUpdateCancellationType() { return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_UPDATE"); }
  get canDeleteCancellationType() { return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_DELETE"); }

  onCancellationTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.cancellationTypeLoaded()) this.loadCancellationType(1);
  }

  loadCancellationType(page: number) {
    this.cancellationTypePage.set(page);
    this.cancellationTypeLoaded.set(true);
    this.contractParamsService.findCancellationTypes({ page: page - 1, size: this.cancellationTypeSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.cancellationTypeItems.set(res.data.content); this.cancellationTypeTotalPages.set(res.data.totalPages); } },
      error: () => this.cancellationTypeLoaded.set(false),
    });
  }

  openCreateCancellationType() { this.cancellationTypeForm.reset({ name: "", description: "" }); this.editingCancellationType.set(null); this.cancellationTypeModalMode.set("create"); }
  openEditCancellationType(item: ContractCancellationType) { this.cancellationTypeForm.reset({ name: item.name, description: item.description ?? "" }); this.editingCancellationType.set(item); this.cancellationTypeModalMode.set("update"); }
  closeCancellationTypeModal() { this.cancellationTypeModalMode.set(null); }

  submitCancellationType() {
    if (this.cancellationTypeForm.invalid) return;
    const { name, description } = this.cancellationTypeForm.value;
    const mode = this.cancellationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService.createCancellationType({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCancellationTypeModal(); this.loadCancellationType(this.cancellationTypePage()); },
      });
    } else if (mode === "update") {
      const item = this.editingCancellationType()!;
      this.contractParamsService.updateCancellationType(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closeCancellationTypeModal(); this.loadCancellationType(this.cancellationTypePage()); },
      });
    }
  }

  openDeleteCancellationType(item: ContractCancellationType) { this.editingCancellationType.set(item); this.showDeleteCancellationTypeModal.set(true); }
  closeDeleteCancellationTypeModal() { this.showDeleteCancellationTypeModal.set(false); this.editingCancellationType.set(null); }
  confirmDeleteCancellationType() {
    const item = this.editingCancellationType();
    if (!item) return;
    this.contractParamsService.deleteCancellationType(item.id).subscribe({
      next: () => { this.closeDeleteCancellationTypeModal(); this.loadCancellationType(this.cancellationTypePage()); },
    });
  }
}
