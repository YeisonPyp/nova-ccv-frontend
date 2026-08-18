import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractManagementPlanService } from '@/app/core/services/contract/contract-management-plan.service';
import { ContractParamsService } from '@/app/core/services/contract/contract-params.service';
import { ContractTypeService } from '@/app/core/services/contract/contract-type.service';
import { PatPresupuestalCategoryService } from '@/app/core/services/pat/pat-presupuestal-category.service';
import { PatActivityTaskService } from '@/app/core/services/pat/pat-activity-task.service';
import { AreaService } from '@/app/core/services/assessment/area.service';
import { PositionService } from '@/app/core/services/assessment/position.service';
import { CostCenterService } from '@/app/core/services/cost-center/cost-center.service';
import { SelectSearchComponent } from '@/app/shared/components/select-search/select-search.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { SearchSelectContextFactory } from '@/app/shared/components/search-select/on-search-select.interface';
import { Area } from '@/app/core/models/assessment/area.model';
import { Position } from '@/app/core/models/assessment/position.model';
import { CostCenter } from '@/app/core/models/cost-center/cost-center.models';
import { PatActivityTask } from '@/app/core/models/pat/pat-models';
import { ContractStatus } from '@/app/core/models/contract/contract-params.model';
import { ContractType } from '@/app/core/services/contract/contract-type.service';
import { PresupuestalCategory } from '@/app/core/services/pat/pat-presupuestal-category.service';
import { ContractManagementPlan } from '@/app/core/models/contract/contract-management-plan.model';
import { CurrencyFormatDirective } from '@/app/shared/directives/currency-format.directive';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-contract-management-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectSearchComponent,
    LoadingSpinnerComponent,
    CurrencyFormatDirective,
    EditIconComponent,
  ],
  templateUrl: './contract-management-plan-form.component.html',
})
export class ContractManagementPlanFormComponent implements OnInit {
  private readonly service = inject(ContractManagementPlanService);
  private readonly contractParamsService = inject(ContractParamsService);
  private readonly contractTypeService = inject(ContractTypeService);
  private readonly budgetCategoryService = inject(
    PatPresupuestalCategoryService,
  );
  private readonly taskService = inject(PatActivityTaskService);
  private readonly areaService = inject(AreaService);
  private readonly positionService = inject(PositionService);
  private readonly costCenterService = inject(CostCenterService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  planId = input<string | null>(null);
  saved = output<ContractManagementPlan>();

  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  /** Whether the form is unlocked for editing (always true when creating). */
  editing = signal(false);
  formValid = signal(false);

  get canUpdate(): boolean {
    return this.auth.hasPermission('CONTRACT_MANAGEMENT_PLAN_UPDATE');
  }

  statusOptions = signal<ContractStatus[]>([]);
  contractTypes = signal<ContractType[]>([]);
  budgetCategories = signal<PresupuestalCategory[]>([]);
  patTasks = signal<PatActivityTask[]>([]);

  areaCtx: SearchSelectContextFactory<Area>;
  positionCtx: SearchSelectContextFactory<Position>;
  costCenterCtx: SearchSelectContextFactory<CostCenter>;

  form = this.fb.group({
    statusName: ['', Validators.required],
    positionId: [null as number | null, Validators.required],
    areaId: [null as number | null, Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    task: ['', Validators.required],
    patTaskId: [null as number | null],
    costCenterId: [null as number | null, Validators.required],
    processType: ['', Validators.required],
    budgetCategoryId: [null as number | null, Validators.required],
    contractsAmount: [1, [Validators.required, Validators.min(1)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    months: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.areaCtx = this.areaService.newSearchSelectAreaContext((area) => {
      this.form.patchValue({ areaId: area.id });
    });
    this.positionCtx = this.positionService.newSearchSelectContext((pos) =>
      this.form.patchValue({ positionId: pos.id }),
    );
    this.costCenterCtx = this.costCenterService.newSearchSelectContext((cc) =>
      this.form.patchValue({ costCenterId: cc.id }),
    );

    this.form.get('areaId')?.valueChanges.subscribe(() => this.reloadTasks());
    this.form.get('year')?.valueChanges.subscribe(() => this.reloadTasks());
  }

  private reloadTasks(): void {
    const areaId = this.form.get('areaId')?.value;
    const year = this.form.get('year')?.value;
    if (areaId && year) {
      this.taskService
        .findByYearAndArea(year, areaId)
        .subscribe((res) => this.patTasks.set(res.data ?? []));
    } else {
      this.patTasks.set([]);
    }
  }

  ngOnInit(): void {
    this.contractParamsService
      .findContractStatuses()
      .subscribe((res) => this.statusOptions.set(res.data ?? []));
    this.contractTypeService
      .findAll()
      .subscribe((res) => this.contractTypes.set(res.data ?? []));
    this.budgetCategoryService
      .findAll({ page: 0, size: 200 })
      .subscribe((res) => this.budgetCategories.set(res.data?.content ?? []));

    const id = this.planId();
    if (id) {
      this.loading.set(true);
      this.service.findById(id).subscribe((res) => {
        this.loading.set(false);
        const plan = res.data;
        if (!plan) return;
        this.form.patchValue({
          statusName: plan.statusName,
          positionId: plan.position?.id ?? null,
          areaId: plan.areaId,
          year: plan.year,
          task: plan.task,
          patTaskId: plan.patTaskId?.id ?? null,
          costCenterId: plan.costCenter?.id ?? null,
          processType: plan.processType,
          budgetCategoryId: plan.budgetCategoryId,
          contractsAmount: plan.contractsAmount,
          unitCost: plan.unitCost,
          months: plan.months,
        });
        if (plan.position) this.positionCtx.selectResults([plan.position]);
        if (plan.areaId && plan.areaName) {
          this.areaCtx.selectResults([
            { id: plan.areaId, name: plan.areaName } as Area,
          ]);
        }
        if (plan.costCenter)
          this.costCenterCtx.selectResults([plan.costCenter]);
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.touched && c?.invalid);
  }

  onFieldRemove(
    field: string,
    ctx: SearchSelectContextFactory<any>,
    item: any,
  ): void {
    ctx.remove(item);
    this.form.patchValue({ [field]: null });
    this.form.get(field)?.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const v = this.form.value;

    const payload = {
      statusName: v.statusName!,
      positionId: v.positionId!,
      areaId: v.areaId!,
      patTaskId: v.patTaskId ?? null,
      clearPatTask: v.patTaskId == null,
      task: v.task!,
      costCenterId: v.costCenterId!,
      processType: v.processType!,
      budgetCategoryId: v.budgetCategoryId!,
      contractsAmount: v.contractsAmount!,
      unitCost: v.unitCost!,
      months: v.months!,
      year: v.year!,
    };

    const id = this.planId();
    const obs$ = id
      ? this.service.updatePlan(id, payload)
      : this.service.createPlan(payload);

    obs$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) this.saved.emit(res.data);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err.error?.message ?? 'No se pudo guardar la planeación',
        );
      },
    });
  }
}
