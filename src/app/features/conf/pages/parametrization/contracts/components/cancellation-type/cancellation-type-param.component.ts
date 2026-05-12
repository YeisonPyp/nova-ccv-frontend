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
import { ContractCancellationType } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-cancellation-type-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./cancellation-type-param.component.html",
})
export class CancellationTypeParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  cancellationTypeItems = signal<ContractCancellationType[]>([]);
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

  get canReadCancellationType() {
    return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_READ");
  }
  get canCreateCancellationType() {
    return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_CREATE");
  }
  get canUpdateCancellationType() {
    return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_UPDATE");
  }
  get canDeleteCancellationType() {
    return this.auth.hasPermission("CONTRACT_CANCELLATION_TYPE_DELETE");
  }

  onCancellationTypeToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.cancellationTypeLoaded())
      this.loadCancellationType();
  }

  loadCancellationType() {
    this.cancellationTypeLoaded.set(true);
    this.contractParamsService.findCancellationTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cancellationTypeItems.set(res.data);
        }
      },
      error: () => this.cancellationTypeLoaded.set(false),
    });
  }

  openCreateCancellationType() {
    this.cancellationTypeForm.reset({ name: "", description: "" });
    this.editingCancellationType.set(null);
    this.cancellationTypeModalMode.set("create");
  }
  openEditCancellationType(item: ContractCancellationType) {
    this.cancellationTypeForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingCancellationType.set(item);
    this.cancellationTypeModalMode.set("update");
  }
  closeCancellationTypeModal() {
    this.cancellationTypeModalMode.set(null);
  }

  submitCancellationType() {
    if (this.cancellationTypeForm.invalid) return;
    const { name, description } = this.cancellationTypeForm.value;
    const mode = this.cancellationTypeModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createCancellationType({
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeCancellationTypeModal();
            this.loadCancellationType();
          },
        });
    } else if (mode === "update") {
      const item = this.editingCancellationType()!;
      this.contractParamsService
        .updateCancellationType(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeCancellationTypeModal();
            this.loadCancellationType();
          },
        });
    }
  }

  openDeleteCancellationType(item: ContractCancellationType) {
    this.editingCancellationType.set(item);
    this.showDeleteCancellationTypeModal.set(true);
  }
  closeDeleteCancellationTypeModal() {
    this.showDeleteCancellationTypeModal.set(false);
    this.editingCancellationType.set(null);
  }
  confirmDeleteCancellationType() {
    const item = this.editingCancellationType();
    if (!item) return;
    this.contractParamsService.deleteCancellationType(item.id).subscribe({
      next: () => {
        this.closeDeleteCancellationTypeModal();
        this.loadCancellationType();
      },
    });
  }
}
