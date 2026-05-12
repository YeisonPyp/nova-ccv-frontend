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
import { EpsEntity } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-eps-entity-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./eps-entity-param.component.html",
})
export class EpsEntityParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  epsEntityItems = signal<EpsEntity[]>([]);
  epsEntityLoaded = signal(false);
  epsEntityModalMode = signal<"create" | "update" | null>(null);
  showDeleteEpsEntityModal = signal(false);
  editingEpsEntity = signal<EpsEntity | null>(null);

  epsEntityForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(40)]),
    description: new FormControl(""),
  });

  epsEntityColumns: TableColumn<EpsEntity>[] = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canReadEpsEntity() {
    return this.auth.hasPermission("EPS_ENTITY_READ");
  }
  get canCreateEpsEntity() {
    return this.auth.hasPermission("EPS_ENTITY_CREATE");
  }
  get canUpdateEpsEntity() {
    return this.auth.hasPermission("EPS_ENTITY_UPDATE");
  }
  get canDeleteEpsEntity() {
    return this.auth.hasPermission("EPS_ENTITY_DELETE");
  }

  onEpsEntityToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.epsEntityLoaded())
      this.loadEpsEntity();
  }

  loadEpsEntity() {
    this.epsEntityLoaded.set(true);
    this.contractParamsService.findEpsEntities().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.epsEntityItems.set(res.data);
        }
      },
      error: () => this.epsEntityLoaded.set(false),
    });
  }

  openCreateEpsEntity() {
    this.epsEntityForm.reset({ name: "", description: "" });
    this.editingEpsEntity.set(null);
    this.epsEntityModalMode.set("create");
  }
  openEditEpsEntity(item: EpsEntity) {
    this.epsEntityForm.reset({
      name: item.name,
      description: item.description ?? "",
    });
    this.editingEpsEntity.set(item);
    this.epsEntityModalMode.set("update");
  }
  closeEpsEntityModal() {
    this.epsEntityModalMode.set(null);
  }

  submitEpsEntity() {
    if (this.epsEntityForm.invalid) return;
    const { name, description } = this.epsEntityForm.value;
    const mode = this.epsEntityModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createEpsEntity({ name: name!, description: description ?? undefined })
        .subscribe({
          next: () => {
            this.closeEpsEntityModal();
            this.loadEpsEntity();
          },
        });
    } else if (mode === "update") {
      const item = this.editingEpsEntity()!;
      this.contractParamsService
        .updateEpsEntity(item.id, {
          name: name!,
          description: description ?? undefined,
        })
        .subscribe({
          next: () => {
            this.closeEpsEntityModal();
            this.loadEpsEntity();
          },
        });
    }
  }

  openDeleteEpsEntity(item: EpsEntity) {
    this.editingEpsEntity.set(item);
    this.showDeleteEpsEntityModal.set(true);
  }
  closeDeleteEpsEntityModal() {
    this.showDeleteEpsEntityModal.set(false);
    this.editingEpsEntity.set(null);
  }
  confirmDeleteEpsEntity() {
    const item = this.editingEpsEntity();
    if (!item) return;
    this.contractParamsService.deleteEpsEntity(item.id).subscribe({
      next: () => {
        this.closeDeleteEpsEntityModal();
        this.loadEpsEntity();
      },
    });
  }
}
