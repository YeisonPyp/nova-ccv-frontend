import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import {
  ContractType,
  ContractTypeService,
  CreateContractTypeDto,
} from "@/app/core/services/contract/contract-type.service";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";

@Component({
  selector: "app-contract-types-param",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicTableComponent],
  templateUrl: "./contract-types-param.component.html",
})
export class ContractTypesParamComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(ContractTypeService);

  items = signal<ContractType[]>([]);
  loaded = signal(false);
  modalMode = signal<"create" | "update" | null>(null);
  showDeleteModal = signal(false);
  editing = signal<ContractType | null>(null);

  form = new FormGroup({
    id: new FormControl("", [Validators.required, Validators.maxLength(5)]),
    name: new FormControl("", [Validators.required, Validators.maxLength(80)]),
    description: new FormControl(""),
  });

  columns: TableColumn<ContractType>[] = [
    { key: "id", label: "Código" },
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
  ];

  get canRead() {
    return this.auth.hasPermission("CONTRACT_TYPE_READ");
  }
  get canCreate() {
    return this.auth.hasPermission("CONTRACT_TYPE_CREATE");
  }
  get canUpdate() {
    return this.auth.hasPermission("CONTRACT_TYPE_UPDATE");
  }
  get canDelete() {
    return this.auth.hasPermission("CONTRACT_TYPE_DELETE");
  }

  onToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.loaded()) this.load();
  }

  load() {
    this.loaded.set(true);
    this.service.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.items.set(res.data);
        }
      },
      error: () => this.loaded.set(false),
    });
  }

  openCreate() {
    this.form.reset({ id: "", name: "", description: "" });
    this.form.get("id")!.enable();
    this.editing.set(null);
    this.modalMode.set("create");
  }

  openEdit(item: ContractType) {
    this.form.reset({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
    });
    this.form.get("id")!.disable();
    this.editing.set(item);
    this.modalMode.set("update");
  }

  closeModal() {
    this.modalMode.set(null);
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CreateContractTypeDto = {
      id: v.id!,
      name: v.name!,
      description: v.description || undefined,
    };
    const mode = this.modalMode();
    if (mode === "create") {
      this.service.create(dto).subscribe({
        next: () => {
          this.closeModal();
          this.load();
        },
      });
    } else if (mode === "update") {
      this.service.update(this.editing()!.id, dto).subscribe({
        next: () => {
          this.closeModal();
          this.load();
        },
      });
    }
  }

  openDelete(item: ContractType) {
    this.editing.set(item);
    this.showDeleteModal.set(true);
  }
  closeDelete() {
    this.showDeleteModal.set(false);
    this.editing.set(null);
  }
  confirmDelete() {
    const item = this.editing();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.closeDelete();
        this.load();
      },
    });
  }
}
