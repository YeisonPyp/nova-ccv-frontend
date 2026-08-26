import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@/app/core/services/auth.service';
import { ContractManagementPlanService } from '@/app/core/services/contract/contract-management-plan.service';
import { ContractManagementNotificationConfigService } from '@/app/core/services/contract/contract-management-notification-config.service';
import {
  CONTRACT_MANAGEMENT_EXECUTION_STATUS_LABELS,
  ContractManagementExecutionStatus,
  ContractManagementNotificationConfig,
  ContractManagementPlan,
  ContractManagementSeedResult,
} from '@/app/core/models/contract/contract-management-plan.model';
import { PaginationTableComponent } from '@/app/shared/components/pagination-table/pagination-table.component';
import { TableColumn } from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ParametrizationSectionComponent } from '@/app/features/conf/components/parametrization-section.component';

@Component({
  selector: 'app-contract-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    PaginationTableComponent,
    ParametrizationSectionComponent,
  ],
  templateUrl: './contract-management-dashboard.component.html',
})
export class ContractManagementDashboardComponent {
  private readonly auth = inject(AuthService);
  protected readonly service = inject(ContractManagementPlanService);
  private readonly configService = inject(
    ContractManagementNotificationConfigService,
  );

  year = signal<number>(new Date().getFullYear());
  baseRsqlQuery = computed(() => `year==${this.year()}`);

  // ── Filtros por planeación mensual ──
  readonly executionStatuses: ContractManagementExecutionStatus[] = [
    'PENDING',
    'MADE',
  ];
  readonly statusLabels = CONTRACT_MANAGEMENT_EXECUTION_STATUS_LABELS;

  /** Cut-off dates over the monthly execution rows of each plan. */
  since = signal<string | null>(null);
  before = signal<string | null>(null);
  selectedStatuses = signal<Set<ContractManagementExecutionStatus>>(new Set());

  /**
   * Forwarded to the listing endpoint: keeps plans holding at least one
   * monthly execution matching the dates and/or the selected statuses.
   */
  extraParams = computed<Record<string, unknown>>(() => {
    const params: Record<string, unknown> = {};
    if (this.since()) params['since'] = this.since();
    if (this.before()) params['before'] = this.before();
    const statuses = Array.from(this.selectedStatuses());
    if (statuses.length > 0) params['statuses'] = statuses;
    return params;
  });

  hasFilters = computed(
    () => !!this.since() || !!this.before() || this.selectedStatuses().size > 0,
  );

  onCutOffChange(field: 'since' | 'before', event: Event): void {
    const value = (event.target as HTMLInputElement).value || null;
    if (field === 'since') this.since.set(value);
    else this.before.set(value);
  }

  isStatusActive(status: ContractManagementExecutionStatus): boolean {
    return this.selectedStatuses().has(status);
  }

  toggleStatus(status: ContractManagementExecutionStatus): void {
    const next = new Set(this.selectedStatuses());
    if (next.has(status)) next.delete(status);
    else next.add(status);
    this.selectedStatuses.set(next);
  }

  clearFilters(): void {
    this.since.set(null);
    this.before.set(null);
    this.selectedStatuses.set(new Set());
  }

  readonly columns: TableColumn[] = [
    {
      key: 'position',
      label: 'Cargo responsable',
      valueCallBack: (item: ContractManagementPlan) =>
        item.position?.name ?? '',
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

  get canRead() {
    return this.auth.hasPermission('CONTRACT_MANAGEMENT_PLAN_READ');
  }
  get canCreate() {
    return this.auth.hasPermission('CONTRACT_MANAGEMENT_PLAN_CREATE');
  }

  onYearInputChange(value: number | null): void {
    this.year.set(value ?? new Date().getFullYear());
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
        this.configForm.reset({
          daysBeforeEnd: config.daysBeforeEnd,
          alertTime: config.alertTime,
          timeZone: config.timeZone,
          isActive: config.isActive,
        });
      }
    });
  }

  editConfig(): void {
    this.configEditing.set(true);
  }

  cancelConfigEdit(): void {
    this.configEditing.set(false);
    const config = this.existingConfig();
    if (config) {
      this.configForm.reset({
        daysBeforeEnd: config.daysBeforeEnd,
        alertTime: config.alertTime,
        timeZone: config.timeZone,
        isActive: config.isActive,
      });
    }
  }

  get canSubmitConfig(): boolean {
    return this.configForm.valid;
  }

  submitConfig(): void {
    if (!this.canSubmitConfig) return;
    const { daysBeforeEnd, alertTime, timeZone, isActive } =
      this.configForm.value;
    const payload = {
      daysBeforeEnd: daysBeforeEnd!,
      alertTime: alertTime!,
      timeZone: timeZone!,
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
