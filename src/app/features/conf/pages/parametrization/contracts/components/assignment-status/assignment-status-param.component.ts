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
import { ContractAssignmentStatus } from "@/app/core/models/contract/contract-params.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ColorPickerComponent } from "@/app/shared/components/color-picker/color-picker.component";

@Component({
  selector: "app-assignment-status-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ColorPickerComponent,
  ],
  templateUrl: "./assignment-status-param.component.html",
})
export class AssignmentStatusParamComponent {
  private readonly auth = inject(AuthService);
  private readonly contractParamsService = inject(ContractParamsService);

  assignmentStatusItems = signal<ContractAssignmentStatus[]>([]);

  assignmentStatusLoaded = signal(false);
  assignmentStatusModalMode = signal<"create" | "update" | null>(null);
  showDeleteAssignmentStatusModal = signal(false);
  editingAssignmentStatus = signal<ContractAssignmentStatus | null>(null);

  assignmentStatusForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    color: new FormControl("", [Validators.required, Validators.maxLength(6)]),
  });

  assignmentStatusColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "color", label: "Color" },
  ];

  get canReadAssignmentStatus() {
    return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_READ");
  }
  get canCreateAssignmentStatus() {
    return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_CREATE");
  }
  get canUpdateAssignmentStatus() {
    return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_UPDATE");
  }
  get canDeleteAssignmentStatus() {
    return this.auth.hasPermission("CONTRACT_ASSIGNMENT_STATUS_DELETE");
  }

  onAssignmentStatusToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.assignmentStatusLoaded())
      this.loadAssignmentStatus();
  }

  loadAssignmentStatus() {
    this.assignmentStatusLoaded.set(true);
    this.contractParamsService.findAssignmentStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.assignmentStatusItems.set(res.data);
        }
      },
      error: () => this.assignmentStatusLoaded.set(false),
    });
  }

  openCreateAssignmentStatus() {
    this.assignmentStatusForm.reset({ name: "", color: "" });
    this.editingAssignmentStatus.set(null);
    this.assignmentStatusModalMode.set("create");
  }
  openEditAssignmentStatus(item: ContractAssignmentStatus) {
    this.assignmentStatusForm.reset({ name: item.name, color: item.color });
    this.editingAssignmentStatus.set(item);
    this.assignmentStatusModalMode.set("update");
  }
  closeAssignmentStatusModal() {
    this.assignmentStatusModalMode.set(null);
  }

  submitAssignmentStatus() {
    if (this.assignmentStatusForm.invalid) return;
    const { name, color } = this.assignmentStatusForm.value;
    const mode = this.assignmentStatusModalMode();
    if (mode === "create") {
      this.contractParamsService
        .createAssignmentStatus({ name: name!, color: color! })
        .subscribe({
          next: () => {
            this.closeAssignmentStatusModal();
            this.loadAssignmentStatus();
          },
        });
    } else if (mode === "update") {
      const item = this.editingAssignmentStatus()!;
      this.contractParamsService
        .updateAssignmentStatus(item.id, { name: name!, color: color! })
        .subscribe({
          next: () => {
            this.closeAssignmentStatusModal();
            this.loadAssignmentStatus();
          },
        });
    }
  }

  openDeleteAssignmentStatus(item: ContractAssignmentStatus) {
    this.editingAssignmentStatus.set(item);
    this.showDeleteAssignmentStatusModal.set(true);
  }
  closeDeleteAssignmentStatusModal() {
    this.showDeleteAssignmentStatusModal.set(false);
    this.editingAssignmentStatus.set(null);
  }
  confirmDeleteAssignmentStatus() {
    const item = this.editingAssignmentStatus();
    if (!item) return;
    this.contractParamsService.deleteAssignmentStatus(item.id).subscribe({
      next: () => {
        this.closeDeleteAssignmentStatusModal();
        this.loadAssignmentStatus();
      },
    });
  }
}
