import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { ContractParamsService } from "@/app/core/services/contract/contract-params.service";
import { ContractStatus } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";

@Component({
  selector: "app-contract-status-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: "./contract-status-param.component.html",
})
export class ContractStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  contractStatusItems = signal<ContractStatus[]>([]);
  contractStatusLoaded = signal(false);
  contractStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteContractStatusModal = signal(false);
  editingContractStatus = signal<ContractStatus | null>(null);

  contractStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    description: new FormControl(""),
  });

  contractStatusColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadContractStatus() {
    return this.auth.hasPermission("CONTRACT_STATUS_READ");
  }
  get canCreateContractStatus() {
    return this.auth.hasPermission("CONTRACT_STATUS_CREATE");
  }
  get canUpdateContractStatus() {
    return this.auth.hasPermission("CONTRACT_STATUS_UPDATE");
  }
  get canDeleteContractStatus() {
    return this.auth.hasPermission("CONTRACT_STATUS_DELETE");
  }

  onContractStatusToggle(open: boolean) {
    if (open && !this.contractStatusLoaded()) {
      this.loadContractStatus();
    }
  }

  loadContractStatus() {
    this.contractParamsService.findContractStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.contractStatusLoaded.set(true);
          this.contractStatusItems.set(res.data);
        }
      },
      error: () => this.contractStatusLoaded.set(false),
    });
  }

  openCreateContractStatus() {
    this.contractStatusForm.reset({ name: "", description: "" });
    this.editingContractStatus.set(null);
    this.contractStatusModalMode.set("create");
  }

  openEditContractStatus(item: ContractStatus) {
    this.contractStatusForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingContractStatus.set(item);
    this.contractStatusModalMode.set("update");
  }

  closeContractStatusModal() {
    this.contractStatusModalMode.set(null);
  }

  submitContractStatus() {
    if (this.contractStatusForm.invalid) return;
    const { name, description } = this.contractStatusForm.value;
    const mode = this.contractStatusModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createContractStatus({
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeContractStatusModal();
            this.loadContractStatus();
          },
        });
    } else if (mode === "update") {
      const item = this.editingContractStatus()!;
      this.contractParamsService
        .updateContractStatus(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeContractStatusModal();
            this.loadContractStatus();
          },
        });
    }
  }

  openDeleteContractStatus(item: ContractStatus) {
    this.editingContractStatus.set(item);
    this.showDeleteContractStatusModal.set(true);
  }
  closeDeleteContractStatusModal() {
    this.showDeleteContractStatusModal.set(false);
    this.editingContractStatus.set(null);
  }
  confirmDeleteContractStatus() {
    const item = this.editingContractStatus();
    if (!item) return;
    this.contractParamsService.deleteContractStatus(item.id).subscribe({
      next: () => {
        this.closeDeleteContractStatusModal();
        this.loadContractStatus();
      },
    });
  }
}
