import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../../../../core/services/auth.service";
import { ContractParamsService } from "../../../../../../../core/services/contract/contract-params.service";
import { PensionType } from "../../../../../../../core/models/contract/contract-params.model";
import { DynamicTableComponent, TableColumn } from "../../../../../../../shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "../../../../../../../shared/components/pagination/pagination.component";

@Component({
  selector: "app-pension-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent, PaginationComponent],
  templateUrl: "./pension-type-param.component.html",
  styles: [`
    @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    .modal-overlay { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); }
    .modal-box { background:#fff; border-radius:12px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15); animation:slideUp 0.2s ease-out; }
    .modal-title { font-size:1.1rem; font-weight:600; margin-bottom:16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:20px; }
  `],
})
export class PensionTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  pensionTypeItems = signal<PensionType[]>([]);
  pensionTypePage = signal(1);
  pensionTypeSize = signal(10);
  pensionTypeTotalPages = signal(0);
  pensionTypeLoaded = signal(false);
  pensionTypeModalMode = signal<"create" | "update" | null>(null);
  showDeletePensionTypeModal = signal(false);
  editingPensionType = signal<PensionType | null>(null);

  pensionTypeForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  pensionTypeColumns: TableColumn<PensionType>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadPensionType() { return this.auth.hasPermission("PENSION_TYPE_READ"); }
  get canCreatePensionType() { return this.auth.hasPermission("PENSION_TYPE_CREATE"); }
  get canUpdatePensionType() { return this.auth.hasPermission("PENSION_TYPE_UPDATE"); }
  get canDeletePensionType() { return this.auth.hasPermission("PENSION_TYPE_DELETE"); }

  onPensionTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.pensionTypeLoaded()) this.loadPensionType(1);
  }

  loadPensionType(page: number) {
    this.pensionTypePage.set(page);
    this.pensionTypeLoaded.set(true);
    this.contractParamsService.findPensionTypes({ page: page - 1, size: this.pensionTypeSize() }).subscribe({
      next: (res) => { if (res.success && res.data) { this.pensionTypeItems.set(res.data.content); this.pensionTypeTotalPages.set(res.data.totalPages); } },
      error: () => this.pensionTypeLoaded.set(false),
    });
  }

  openCreatePensionType() { this.pensionTypeForm.reset({ name: "", description: "" }); this.editingPensionType.set(null); this.pensionTypeModalMode.set("create"); }
  openEditPensionType(item: PensionType) { this.pensionTypeForm.reset({ name: item.name, description: item.description ?? "" }); this.editingPensionType.set(item); this.pensionTypeModalMode.set("update"); }
  closePensionTypeModal() { this.pensionTypeModalMode.set(null); }

  submitPensionType() {
    if (this.pensionTypeForm.invalid) return;
    const { name, description } = this.pensionTypeForm.value;
    const mode = this.pensionTypeModalMode();
    if (mode === "create") {
      this.contractParamsService.createPensionType({ name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closePensionTypeModal(); this.loadPensionType(this.pensionTypePage()); },
      });
    } else if (mode === "update") {
      const item = this.editingPensionType()!;
      this.contractParamsService.updatePensionType(item.id, { name: name!, description: description ?? undefined }).subscribe({
        next: () => { this.closePensionTypeModal(); this.loadPensionType(this.pensionTypePage()); },
      });
    }
  }

  openDeletePensionType(item: PensionType) { this.editingPensionType.set(item); this.showDeletePensionTypeModal.set(true); }
  closeDeletePensionTypeModal() { this.showDeletePensionTypeModal.set(false); this.editingPensionType.set(null); }
  confirmDeletePensionType() {
    const item = this.editingPensionType();
    if (!item) return;
    this.contractParamsService.deletePensionType(item.id).subscribe({
      next: () => { this.closeDeletePensionTypeModal(); this.loadPensionType(this.pensionTypePage()); },
    });
  }
}
