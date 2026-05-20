import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "@/app/core/services/auth.service";
import { FilingProcessService } from "@/app/core/services/filing/filing-process.service";
import { FilingProcess } from "@/app/core/models/filing/filing.models";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";

@Component({
  selector: "app-filing-process-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    PaginationComponent,
  ],
  templateUrl: "./filing-process-param.component.html",
})
export class FilingProcessParamComponent {
  private readonly auth = inject(AuthService);
  private readonly filingProcessService = inject(FilingProcessService);

  fpItems = signal<FilingProcess[]>([]);
  fpPage = signal(1);
  fpSize = signal(10);
  fpTotalPages = signal(0);
  fpLoaded = signal(false);
  fpModalMode = signal<"create" | "update" | null>(null);
  showDeleteFpModal = signal(false);
  editingFp = signal<FilingProcess | null>(null);

  fpForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(20)]),
    canUpdate: new FormControl(false),
    canDelete: new FormControl(false),
  });

  fpColumns: TableColumn[] = [
    { key: "name", label: "Nombre" },
    { key: "canUpdate", label: "Puede modificar" },
    { key: "canDelete", label: "Puede eliminar" },
  ];

  get canReadFp() {
    return this.auth.hasPermission("FILING_PROCESS_READ");
  }
  get canCreateFp() {
    return this.auth.hasPermission("FILING_PROCESS_CREATE");
  }
  get canUpdateFp() {
    return this.auth.hasPermission("FILING_PROCESS_UPDATE");
  }
  get canDeleteFp() {
    return this.auth.hasPermission("FILING_PROCESS_DELETE");
  }

  onFpToggle(e: Event) {
    if ((e.target as HTMLDetailsElement).open && !this.fpLoaded())
      this.loadFp(1);
  }

  loadFp(page: number) {
    this.fpPage.set(page);
    this.fpLoaded.set(true);
    this.filingProcessService
      .findAll({ page: page - 1, size: this.fpSize() })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.fpItems.set(res.data.content);
            this.fpTotalPages.set(res.data.totalPages);
          }
        },
        error: () => this.fpLoaded.set(false),
      });
  }

  openCreateFp() {
    this.fpForm.reset({ name: "", canUpdate: false, canDelete: false });
    this.editingFp.set(null);
    this.fpModalMode.set("create");
  }

  openEditFp(fp: FilingProcess) {
    this.fpForm.reset({
      name: fp.name,
      canUpdate: (fp as any).canUpdate ?? false,
      canDelete: (fp as any).canDelete ?? false,
    });
    this.editingFp.set(fp);
    this.fpModalMode.set("update");
  }

  closeFpModal() {
    this.fpModalMode.set(null);
  }

  submitFp() {
    if (this.fpForm.invalid) return;
    const { name, canUpdate, canDelete } = this.fpForm.value;
    const dto = {
      name: name!,
      canUpdate: canUpdate ?? false,
      canDelete: canDelete ?? false,
    };
    const mode = this.fpModalMode();
    if (mode === "create") {
      this.filingProcessService.create(dto).subscribe({
        next: () => {
          this.closeFpModal();
          this.loadFp(this.fpPage());
        },
      });
    } else {
      this.filingProcessService.update(this.editingFp()!.id, dto).subscribe({
        next: () => {
          this.closeFpModal();
          this.loadFp(this.fpPage());
        },
      });
    }
  }

  openDeleteFp(fp: FilingProcess) {
    this.editingFp.set(fp);
    this.showDeleteFpModal.set(true);
  }

  closeDeleteFpModal() {
    this.showDeleteFpModal.set(false);
    this.editingFp.set(null);
  }

  confirmDeleteFp() {
    const fp = this.editingFp();
    if (!fp) return;
    this.filingProcessService.delete(fp.id).subscribe({
      next: () => {
        this.closeDeleteFpModal();
        this.loadFp(this.fpPage());
      },
    });
  }
}
