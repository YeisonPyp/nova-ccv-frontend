import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HttpEventType } from "@angular/common/http";
import { AuthService } from "@/app/core/services/auth.service";
import { ContractAlertsConfigService } from "@/app/core/services/contract/contract-alerts-config.service";
import { StorageService } from "@/app/core/services/improvement-plan/storage.service";
import { ContractAlertsConfig } from "@/app/core/models/contract/contract-alerts-config.model";
import {
  DynamicTableComponent,
  TableColumn,
} from "@/app/shared/components/dynamic-table/dynamic-table.component";
import { ParametrizationSectionComponent } from "@/app/features/conf/components/parametrization-section.component";
import {
  FileItemComponent,
  FileResource,
} from "@/app/shared/components/file-item/file-item.component";

@Component({
  selector: "app-contract-alerts-config-param",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicTableComponent,
    ParametrizationSectionComponent,
    FileItemComponent,
  ],
  templateUrl: "./contract-alerts-config-param.component.html",
})
export class ContractAlertsConfigParamComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(ContractAlertsConfigService);
  private readonly storageService = inject(StorageService);

  items = signal<ContractAlertsConfig[]>([]);
  loaded = signal(false);
  modalMode = signal<"create" | "update" | null>(null);
  showDeleteModal = signal(false);
  editingItem = signal<ContractAlertsConfig | null>(null);

  bucketName = signal<string | null>(null);
  beforeEndsTemplateName = signal<string | null>(null);
  afterEndsTemplateName = signal<string | null>(null);
  uploadingBeforeEnds = signal(false);
  uploadingAfterEnds = signal(false);

  beforeEndsFile = computed<FileResource | null>(() => {
    const bucket = this.bucketName();
    const fileName = this.beforeEndsTemplateName();
    if (!bucket || !fileName) return null;
    return { id: fileName, bucketName: bucket, fileName };
  });

  afterEndsFile = computed<FileResource | null>(() => {
    const bucket = this.bucketName();
    const fileName = this.afterEndsTemplateName();
    if (!bucket || !fileName) return null;
    return { id: fileName, bucketName: bucket, fileName };
  });

  form = new FormGroup({
    daysBeforeEnd: new FormControl<number | null>(30, [
      Validators.required,
      Validators.min(1),
    ]),
    daysAfterEnd: new FormControl<number | null>(15, [
      Validators.required,
      Validators.min(1),
    ]),
    alertTime: new FormControl("08:00", [Validators.required]),
    timeZone: new FormControl("America/Bogota", [Validators.required]),
    isActive: new FormControl(true),
  });

  columns: TableColumn[] = [
    { key: "daysBeforeEnd", label: "Días antes de vencer" },
    { key: "daysAfterEnd", label: "Días después de vencer" },
    { key: "alertTime", label: "Hora de alerta" },
    { key: "timeZone", label: "Zona horaria" },
    {
      key: "isActive",
      label: "Activo",
      valueCallBack: (item: ContractAlertsConfig) =>
        item.isActive ? "Sí" : "No",
    },
  ];

  get canRead() {
    return this.auth.hasPermission("CONTRACT_ALERTS_CONFIG_READ");
  }
  get canCreate() {
    return this.auth.hasPermission("CONTRACT_ALERTS_CONFIG_CREATE");
  }
  get canUpdate() {
    return this.auth.hasPermission("CONTRACT_ALERTS_CONFIG_UPDATE");
  }
  get canDelete() {
    return this.auth.hasPermission("CONTRACT_ALERTS_CONFIG_DELETE");
  }

  onToggle(open: boolean) {
    if (open && !this.loaded()) {
      this.load();
    }
  }

  load() {
    this.service.findAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.loaded.set(true);
          this.items.set(res.data);
        }
      },
      error: () => this.loaded.set(false),
    });
  }

  private ensureBucketName(cb: () => void) {
    if (this.bucketName()) {
      cb();
      return;
    }
    this.service.getTemplatesBucketName().subscribe({
      next: (res) => {
        if (res.success && res.data) this.bucketName.set(res.data);
        cb();
      },
    });
  }

  openCreate() {
    this.form.reset({
      daysBeforeEnd: 30,
      daysAfterEnd: 15,
      alertTime: "08:00",
      timeZone: "America/Bogota",
      isActive: true,
    });
    this.editingItem.set(null);
    this.beforeEndsTemplateName.set(null);
    this.afterEndsTemplateName.set(null);
    this.ensureBucketName(() => this.modalMode.set("create"));
  }

  openEdit(item: ContractAlertsConfig) {
    this.form.reset({
      daysBeforeEnd: item.daysBeforeEnd,
      daysAfterEnd: item.daysAfterEnd,
      alertTime: item.alertTime,
      timeZone: item.timeZone,
      isActive: item.isActive,
    });
    this.editingItem.set(item);
    this.bucketName.set(item.bucketName);
    this.beforeEndsTemplateName.set(item.beforeEndsTemplateName);
    this.afterEndsTemplateName.set(item.afterEndsTemplateName);
    this.modalMode.set("update");
  }

  closeModal() {
    this.modalMode.set(null);
  }

  onBeforeEndsFileSelected(file: File) {
    const bucket = this.bucketName();
    if (!bucket) return;
    const objectName = `contract-alerts/${Date.now()}-before-ends-${file.name}`;
    this.uploadingBeforeEnds.set(true);
    this.storageService.uploadFile(bucket, objectName, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          this.uploadingBeforeEnds.set(false);
          this.beforeEndsTemplateName.set(
            event.body?.data?.objectName ?? objectName,
          );
        }
      },
      error: () => this.uploadingBeforeEnds.set(false),
    });
  }

  onAfterEndsFileSelected(file: File) {
    const bucket = this.bucketName();
    if (!bucket) return;
    const objectName = `contract-alerts/${Date.now()}-after-ends-${file.name}`;
    this.uploadingAfterEnds.set(true);
    this.storageService.uploadFile(bucket, objectName, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          this.uploadingAfterEnds.set(false);
          this.afterEndsTemplateName.set(
            event.body?.data?.objectName ?? objectName,
          );
        }
      },
      error: () => this.uploadingAfterEnds.set(false),
    });
  }

  get canSubmit(): boolean {
    return (
      this.form.valid &&
      !!this.beforeEndsTemplateName() &&
      !!this.afterEndsTemplateName()
    );
  }

  submit() {
    if (!this.canSubmit) return;
    const { daysBeforeEnd, daysAfterEnd, alertTime, timeZone, isActive } =
      this.form.value;
    const payload = {
      daysBeforeEnd: daysBeforeEnd!,
      daysAfterEnd: daysAfterEnd!,
      alertTime: alertTime!,
      timeZone: timeZone!,
      beforeEndsTemplateName: this.beforeEndsTemplateName()!,
      afterEndsTemplateName: this.afterEndsTemplateName()!,
      isActive: isActive ?? true,
    };

    const mode = this.modalMode();
    const obs$ =
      mode === "create"
        ? this.service.create(payload)
        : this.service.update(this.editingItem()!.id, payload);

    obs$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
      },
    });
  }

  openDelete(item: ContractAlertsConfig) {
    this.editingItem.set(item);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.editingItem.set(null);
  }

  confirmDelete() {
    const item = this.editingItem();
    if (!item) return;
    this.service.deleteById(item.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.load();
      },
    });
  }
}
