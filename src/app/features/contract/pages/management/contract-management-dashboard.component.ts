import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import { ContractManagementPlanService } from '@/app/core/services/contract/contract-management-plan.service';
import { ContractManagementExecutionPlanService } from '@/app/core/services/contract/contract-management-execution-plan.service';
import { ContractManagementNotificationConfigService } from '@/app/core/services/contract/contract-management-notification-config.service';
import { ContractAlertsConfigService } from '@/app/core/services/contract/contract-alerts-config.service';
import { StorageService } from '@/app/core/services/improvement-plan/storage.service';
import {
  ContractManagementNotificationConfig,
  ContractManagementPlan,
  ContractManagementSeedResult,
} from '@/app/core/models/contract/contract-management-plan.model';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';
import { FileItemComponent, FileResource } from '@/app/shared/components/file-item/file-item.component';
import { MonthlyBarChartComponent } from '@/app/shared/components/charts/monthly-bar-chart/monthly-bar-chart.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-contract-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationTableComponent,
    ParametrizationSectionComponent,
    FileItemComponent,
    MonthlyBarChartComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './contract-management-dashboard.component.html',
})
export class ContractManagementDashboardComponent {
  private readonly auth = inject(AuthService);
  protected readonly service = inject(ContractManagementPlanService);
  private readonly executionPlanService = inject(ContractManagementExecutionPlanService);
  private readonly configService = inject(ContractManagementNotificationConfigService);
  private readonly alertsConfigService = inject(ContractAlertsConfigService);
  private readonly storageService = inject(StorageService);

  year = signal<number>(new Date().getFullYear());
  baseRsqlQuery = computed(() => `year==${this.year()}`);

  readonly columns: TableColumn[] = [
    {
      key: 'position',
      label: 'Cargo responsable',
      valueCallBack: (item: ContractManagementPlan) => item.position?.name ?? '',
    },
    { key: 'task', label: 'Tarea' },
    { key: 'processType', label: 'Tipo de proceso' },
    { key: 'contractsAmount', label: 'Cantidad' },
    { key: 'unitCost', label: 'Valor unitario' },
    { key: 'months', label: 'Meses' },
  ];

  uploading = signal(false);
  uploadError = signal<string | null>(null);
  seedResult = signal<ContractManagementSeedResult | null>(null);

  selectedPlan = signal<ContractManagementPlan | null>(null);
  monthlyValues = signal<number[]>(new Array(12).fill(0));
  loadingExecutions = signal(false);

  get canRead() {
    return this.auth.hasPermission('CONTRACT_MANAGEMENT_PLAN_READ');
  }
  get canCreate() {
    return this.auth.hasPermission('CONTRACT_MANAGEMENT_PLAN_CREATE');
  }

  onYearInputChange(value: number | null): void {
    this.year.set(value ?? new Date().getFullYear());
    this.selectedPlan.set(null);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.seedResult.set(null);

    this.service.seedFromExcel(this.year(), file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        (event.target as HTMLInputElement).value = '';
        if (res.success && res.data) {
          this.seedResult.set(res.data);
        }
      },
      error: (err) => {
        this.uploading.set(false);
        (event.target as HTMLInputElement).value = '';
        this.uploadError.set(
          err.error?.message ?? 'No se pudo procesar el archivo.',
        );
      },
    });
  }

  selectPlan(plan: ContractManagementPlan): void {
    this.selectedPlan.set(plan);
    this.loadingExecutions.set(true);
    this.executionPlanService.findByPlanId(plan.id).subscribe((res) => {
      this.loadingExecutions.set(false);
      const values = new Array(12).fill(0);
      if (res.success && res.data) {
        for (const execution of res.data) {
          values[execution.month - 1] = execution.amount;
        }
      }
      this.monthlyValues.set(values);
    });
  }

  closeDetail(): void {
    this.selectedPlan.set(null);
  }

  // ── Configuración de notificaciones ──

  get canConfigRead() {
    return this.auth.hasPermission(
      'CONTRACT_MANAGEMENT_NOTIFICATION_CONFIG_READ',
    );
  }
  get canConfigCreate() {
    return this.auth.hasPermission(
      'CONTRACT_MANAGEMENT_NOTIFICATION_CONFIG_CREATE',
    );
  }
  get canConfigUpdate() {
    return this.auth.hasPermission(
      'CONTRACT_MANAGEMENT_NOTIFICATION_CONFIG_UPDATE',
    );
  }

  configLoaded = signal(false);
  existingConfig = signal<ContractManagementNotificationConfig | null>(null);
  configEditing = signal(false);

  bucketName = signal<string | null>(null);
  templateName = signal<string | null>(null);
  uploadingTemplate = signal(false);

  templateFile = computed<FileResource | null>(() => {
    const bucket = this.bucketName();
    const fileName = this.templateName();
    if (!bucket || !fileName) return null;
    return { id: fileName, bucketName: bucket, fileName };
  });

  configForm = new FormGroup({
    daysBeforeEnd: new FormControl<number | null>(5, [
      Validators.required,
      Validators.min(1),
    ]),
    alertTime: new FormControl('08:00', [Validators.required]),
    timeZone: new FormControl('America/Bogota', [Validators.required]),
    isActive: new FormControl(true),
  });

  onConfigToggle(open: boolean): void {
    if (open && !this.configLoaded()) this.loadConfig();
  }

  private loadConfig(): void {
    this.configService.findAll().subscribe((res) => {
      this.configLoaded.set(true);
      if (res.success && res.data && res.data.length > 0) {
        const config = res.data[0];
        this.existingConfig.set(config);
        this.templateName.set(config.templateName);
        this.configForm.reset({
          daysBeforeEnd: config.daysBeforeEnd,
          alertTime: config.alertTime,
          timeZone: config.timeZone,
          isActive: config.isActive,
        });
      }
    });
  }

  private ensureBucketName(cb: () => void): void {
    if (this.bucketName()) {
      cb();
      return;
    }
    this.alertsConfigService.getTemplatesBucketName().subscribe((res) => {
      if (res.success && res.data) this.bucketName.set(res.data);
      cb();
    });
  }

  editConfig(): void {
    this.ensureBucketName(() => this.configEditing.set(true));
  }

  cancelConfigEdit(): void {
    this.configEditing.set(false);
    const config = this.existingConfig();
    if (config) {
      this.templateName.set(config.templateName);
      this.configForm.reset({
        daysBeforeEnd: config.daysBeforeEnd,
        alertTime: config.alertTime,
        timeZone: config.timeZone,
        isActive: config.isActive,
      });
    }
  }

  onTemplateFileSelected(file: File): void {
    const bucket = this.bucketName();
    if (!bucket) return;
    const objectName = `contract-management/${Date.now()}-${file.name}`;
    this.uploadingTemplate.set(true);
    this.storageService.uploadFile(bucket, objectName, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          this.uploadingTemplate.set(false);
          this.templateName.set(event.body?.data?.objectName ?? objectName);
        }
      },
      error: () => this.uploadingTemplate.set(false),
    });
  }

  get canSubmitConfig(): boolean {
    return this.configForm.valid && !!this.templateName();
  }

  submitConfig(): void {
    if (!this.canSubmitConfig) return;
    const { daysBeforeEnd, alertTime, timeZone, isActive } =
      this.configForm.value;
    const payload = {
      daysBeforeEnd: daysBeforeEnd!,
      alertTime: alertTime!,
      timeZone: timeZone!,
      templateName: this.templateName()!,
      isActive: isActive ?? true,
    };

    const existing = this.existingConfig();
    const obs$ = existing
      ? this.configService.update(existing.id, payload)
      : this.configService.create(payload);

    obs$.subscribe((res) => {
      if (res.success && res.data) {
        this.existingConfig.set(res.data);
        this.configEditing.set(false);
      }
    });
  }
}
