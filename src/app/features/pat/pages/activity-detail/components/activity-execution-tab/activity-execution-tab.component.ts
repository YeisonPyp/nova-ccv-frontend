import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  PatActivityExecution,
  PatActivityExecutionService,
  CreatePatActivityExecutionDto,
  PatActivityExecutionServiceByActivityId,
} from "@/app/core/services/pat/pat-activity-execution.service";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";
import {
  MonthCardMetric,
  MonthMetricCardComponent,
} from "../month-metric-card/month-metric-card.component";
import { PatActivityConsolidation } from "@/app/core/models/pat/pat-models";
import { FormFieldErrorDirective } from "@/app/shared/directives/form-field-error.directive";

interface MonthCard {
  month: number;
  label: string;
  execution: PatActivityExecution | null;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

@Component({
  selector: "app-activity-execution-tab",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyFormatDirective,
    FormFieldErrorDirective,
    MonthMetricCardComponent,
  ],
  templateUrl: "./activity-execution-tab.component.html",
})
export class ActivityExecutionTabComponent implements OnInit {
  activityId = input.required<number>();

  consolidation = input.required<PatActivityConsolidation>();

  private readonly baseService = inject(PatActivityExecutionService);
  private readonly fb = inject(FormBuilder);

  service!: PatActivityExecutionServiceByActivityId;

  executions = signal<PatActivityExecution[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  editingMonth = signal<number | null>(null);

  readonly cards = computed<MonthCard[]>(() => {
    const byMonth = new Map<number, PatActivityExecution>();
    for (const e of this.executions()) byMonth.set(e.month, e);
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: MONTH_NAMES[i],
      execution: byMonth.get(i + 1) ?? null,
    }));
  });

  cardMetrics(card: MonthCard): MonthCardMetric[] {
    return [
      {
        label: "Presupuesto",
        value: card.execution?.executedBudget ?? 0,
        isCurrency: true,
      },
      { label: "Beneficio", value: card.execution?.executedBenefit ?? 0 },
      {
        label: "Medición",
        value: card.execution?.executedMeasurementGoal ?? 0,
      },
      {
        label: "Indicador",
        value: card.execution?.executedIndicatorGoal ?? 0,
      },
    ];
  }

  readonly editingCard = computed<MonthCard | null>(() => {
    const m = this.editingMonth();
    if (m == null) return null;
    return this.cards().find((c) => c.month === m) ?? null;
  });

  readonly modalTitle = computed(() => {
    const c = this.editingCard();
    return c
      ? `${c.execution ? "Editar" : "Registrar"} ejecución — ${c.label}`
      : "";
  });

  form = this.fb.group({
    executedBudget: [0, [Validators.required, Validators.min(0)]],
    executedBenefit: [0, [Validators.required, Validators.min(0)]],
    executedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    executedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
    description: [""],
  });

  constructor() {
    effect(() => {
      const consolidation = this.consolidation();

      const executedBudgetControl = this.form.get("executedBudget");
      const executedBenefitControl = this.form.get("executedBenefit");
      const executedMeasurementControl = this.form.get(
        "executedMeasurementGoal",
      );
      const executedIndicatorControl = this.form.get("executedIndicatorGoal");

      if (executedBudgetControl) {
        executedBudgetControl.clearValidators();
        executedBudgetControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.approvedBudget - consolidation.executedBudget,
          ),
        ]);

        executedBudgetControl.updateValueAndValidity({ emitEvent: false });
      }

      if (executedBenefitControl) {
        executedBenefitControl.clearValidators();
        executedBenefitControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedBenefit - consolidation.executedBenefitGoal,
          ),
        ]);

        executedBenefitControl.updateValueAndValidity({ emitEvent: false });
      }

      if (executedMeasurementControl) {
        executedMeasurementControl.clearValidators();
        executedMeasurementControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedMeasurement -
              consolidation.executedMeasurementGoal,
          ),
        ]);

        executedMeasurementControl.updateValueAndValidity({ emitEvent: false });
      }

      if (executedIndicatorControl) {
        executedIndicatorControl.clearValidators();
        executedIndicatorControl.addValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(
            consolidation.plannedIndicator -
              consolidation.executedIndicatorGoal,
          ),
        ]);

        executedIndicatorControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.service = new PatActivityExecutionServiceByActivityId(
      this.baseService,
      this.activityId(),
    );
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.findAll({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data) this.executions.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openMonth(card: MonthCard) {
    this.editingMonth.set(card.month);
    this.error.set(null);
    if (card.execution) {
      this.form.reset({
        executedBudget: card.execution.executedBudget,
        executedBenefit: card.execution.executedBenefit,
        executedMeasurementGoal: card.execution.executedMeasurementGoal,
        executedIndicatorGoal: card.execution.executedIndicatorGoal,
        description: card.execution.description ?? "",
      });
    } else {
      this.form.reset({
        executedBudget: 0,
        executedBenefit: 0,
        executedMeasurementGoal: 0,
        executedIndicatorGoal: 0,
        description: "",
      });
    }
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingMonth.set(null);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const card = this.editingCard();
    if (!card) return;

    this.submitting.set(true);
    this.error.set(null);

    const dto: CreatePatActivityExecutionDto = {
      activityId: this.activityId(),
      month: card.month,
      executedBudget: this.form.value.executedBudget!,
      executedBenefit: this.form.value.executedBenefit!,
      executedMeasurement: this.form.value.executedMeasurementGoal!,
      executedIndicator: this.form.value.executedIndicatorGoal!,
      description: this.form.value.description || undefined,
    };
    // the backend service uses POST (create) method to do upsert
    this.baseService.create(dto).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.closeModal();
          const executionsMap = new Map(
            this.executions().map((e) => [e.id, e]),
          );
          executionsMap.set(res.data.id, res.data);
          this.executions.set(Array.from(executionsMap.values()));
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "Error al guardar la ejecución");
      },
    });
  }
}
