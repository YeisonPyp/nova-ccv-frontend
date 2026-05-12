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
import { CompensationEntity } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-compensation-entity-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./compensation-entity-param.component.html",
})
export class CompensationEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  compensationEntityItems = signal<CompensationEntity[]>([]);
  compensationEntityLoaded = signal(false);
  compensationEntityModalMode = signal<"create" | "update" | null>(null);
  showDeleteCompensationEntityModal = signal(false);
  editingCompensationEntity = signal<CompensationEntity | null>(null);

  compensationEntityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(40)]),
    description: new FormControl(""),
  });

  compensationEntityColumns: TableColumn<CompensationEntity>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadCompensationEntity() {
    return this.auth.hasPermission("COMPENSATION_ENTITY_READ");
  }
  get canCreateCompensationEntity() {
    return this.auth.hasPermission("COMPENSATION_ENTITY_CREATE");
  }
  get canUpdateCompensationEntity() {
    return this.auth.hasPermission("COMPENSATION_ENTITY_UPDATE");
  }
  get canDeleteCompensationEntity() {
    return this.auth.hasPermission("COMPENSATION_ENTITY_DELETE");
  }

  onCompensationEntityToggle(e: Event) {
    if (
      (e.target as HTMLDetailsElement).open &&
      !this.compensationEntityLoaded()
    )
      this.loadCompensationEntity();
  }

  loadCompensationEntity() {
    this.compensationEntityLoaded.set(true);
    this.contractParamsService.findCompensationEntities().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.compensationEntityItems.set(res.data);
        }
      },
      error: () => this.compensationEntityLoaded.set(false),
    });
  }

  openCreateCompensationEntity() {
    this.compensationEntityForm.reset({ name: "", description: "" });
    this.editingCompensationEntity.set(null);
    this.compensationEntityModalMode.set("create");
  }
  openEditCompensationEntity(item: CompensationEntity) {
    this.compensationEntityForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingCompensationEntity.set(item);
    this.compensationEntityModalMode.set("update");
  }
  closeCompensationEntityModal() {
    this.compensationEntityModalMode.set(null);
  }

  submitCompensationEntity() {
    if (this.compensationEntityForm.invalid) return;
    const { name, description } = this.compensationEntityForm.value;
    const mode = this.compensationEntityModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createCompensationEntity({
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeCompensationEntityModal();
            this.loadCompensationEntity();
          },
        });
    } else if (mode === "update") {
      const item = this.editingCompensationEntity()!;
      this.contractParamsService
        .updateCompensationEntity(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeCompensationEntityModal();
            this.loadCompensationEntity();
          },
        });
    }
  }

  openDeleteCompensationEntity(item: CompensationEntity) {
    this.editingCompensationEntity.set(item);
    this.showDeleteCompensationEntityModal.set(true);
  }
  closeDeleteCompensationEntityModal() {
    this.showDeleteCompensationEntityModal.set(false);
    this.editingCompensationEntity.set(null);
  }
  confirmDeleteCompensationEntity() {
    const item = this.editingCompensationEntity();
    if (!item) return;
    this.contractParamsService.deleteCompensationEntity(item.id).subscribe({
      next: () => {
        this.closeDeleteCompensationEntityModal();
        this.loadCompensationEntity();
      },
    });
  }
}
