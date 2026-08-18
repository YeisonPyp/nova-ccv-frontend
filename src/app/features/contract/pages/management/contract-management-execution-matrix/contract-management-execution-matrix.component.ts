import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContractManagementExecutionPlanService } from '@/app/core/services/contract/contract-management-execution-plan.service';
import {
  ContractManagementExecutionPlan,
  ContractManagementExecutionStatus,
  ContractManagementPlan,
} from '@/app/core/models/contract/contract-management-plan.model';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { TrashIconComponent } from '@/app/shared/components/edit-icon/trash-icon.component';
import { MONTH_NAMES } from '@/app/shared/utils/month-names';
import { ExecutionUpsertModalComponent } from './components/execution-upsert-modal/execution-upsert-modal.component';

interface MonthRow {
  month: number;
  label: string;
  execution: ContractManagementExecutionPlan;
}

@Component({
  selector: 'app-contract-management-execution-matrix',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    DynamicTableComponent,
    EditIconComponent,
    TrashIconComponent,
    ExecutionUpsertModalComponent,
  ],
  templateUrl: './contract-management-execution-matrix.component.html',
})
export class ContractManagementExecutionMatrixComponent implements OnInit {
  private readonly service = inject(ContractManagementExecutionPlanService);
  private readonly router = inject(Router);

  plan = input.required<ContractManagementPlan>();

  loading = signal(false);
  executions = signal<ContractManagementExecutionPlan[]>([]);

  modalOpen = signal(false);
  editingExecution = signal<ContractManagementExecutionPlan | null>(null);

  readonly statusOptions: {
    value: ContractManagementExecutionStatus;
    label: string;
  }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'MADE', label: 'Contrato creado' },
  ];

  columns: TableColumn[] = [
    { key: 'label', label: 'Mes' },
    { key: 'amount', label: 'Monto' },
    { key: 'status', label: 'Estado' },
  ];

  rows = computed<MonthRow[]>(() =>
    this.executions()
      .slice()
      .sort((a, b) => a.month - b.month)
      .map((execution) => ({
        month: execution.month,
        label: MONTH_NAMES[execution.month - 1] ?? '',
        execution,
      })),
  );

  usedMonths = computed(() => this.rows().map((r) => r.month));

  /** Each contract only runs for `months`, so the plan can't plan more distinct months than that. */
  monthLimitReached = computed(() => {
    const months = this.plan().months;
    return months > 0 && this.rows().length >= months;
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.findByPlanId(this.plan().id).subscribe((res) => {
      this.loading.set(false);
      if (res.success && res.data) this.executions.set(res.data);
    });
  }

  private upsertLocal(execution: ContractManagementExecutionPlan): void {
    this.executions.update((list) => [
      ...list.filter((e) => e.month !== execution.month),
      execution,
    ]);
  }

  openCreate(): void {
    this.editingExecution.set(null);
    this.modalOpen.set(true);
  }

  openEdit(row: MonthRow): void {
    this.editingExecution.set(row.execution);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onSaved(execution: ContractManagementExecutionPlan): void {
    this.upsertLocal(execution);
    this.modalOpen.set(false);
  }

  deleteExecution(row: MonthRow): void {
    if (!confirm(`¿Eliminar la ejecución de ${row.label}?`)) return;
    this.service.deleteById(row.execution.id).subscribe((res) => {
      if (res.success) {
        this.executions.update((list) =>
          list.filter((e) => e.id !== row.execution.id),
        );
      }
    });
  }

  changeStatus(row: MonthRow, status: ContractManagementExecutionStatus): void {
    this.service.updateStatus(row.execution.id, { status }).subscribe((res) => {
      if (res.success && res.data) this.upsertLocal(res.data);
    });
  }

  createContract(row: MonthRow): void {
    const plan = this.plan();

    this.router.navigate(['/contracts/create/employee'], {
      queryParams: {
        fromExecutionId: row.execution.id,
        areaId: plan.areaId,
        areaName: plan.areaName,
        costCenterId: plan.costCenter?.id,
        costCenterName: plan.costCenter?.name,
        positionId: plan.position?.id,
        positionName: plan.position?.name,
        contractTypeName: plan.contractTypeName,
        basePeriodAmount: plan.unitCost,
      },
    });
  }
}
