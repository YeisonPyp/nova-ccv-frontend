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
  PatActivityPlan,
  PatActivityPlanService,
  CreatePatActivityPlanDto,
  PatActivityPlanServiceByActivityId,
} from "@/app/core/services/pat/pat-activity-plan.service";
import { CurrencyFormatDirective } from "@/app/shared/directives/currency-format.directive";
import {
  MonthCardMetric,
  MonthMetricCardComponent,
} from "../month-metric-card/month-metric-card.component";

interface MonthCard {
  month: number;
  label: string;
  plan: PatActivityPlan | null;
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
  selector: "app-activity-plan-tab",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyFormatDirective,
    MonthMetricCardComponent,
  ],
  templateUrl: "./activity-plan-tab.component.html",
})
export class ActivityPlanTabComponent implements OnInit {
  activityId = input.required<number>();

  private readonly baseService = inject(PatActivityPlanService);
  private readonly fb = inject(FormBuilder);

  service!: PatActivityPlanServiceByActivityId;

  plans = signal<PatActivityPlan[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  modalOpen = signal(false);
  editingMonth = signal<number | null>(null);

  readonly cards = computed<MonthCard[]>(() => {
    const byMonth = new Map<number, PatActivityPlan>();
    for (const p of this.plans()) byMonth.set(p.month, p);
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: MONTH_NAMES[i],
      plan: byMonth.get(i + 1) ?? null,
    }));
  });

  cardMetrics(card: MonthCard): MonthCardMetric[] {
    return [
      {
        label: "Presupuesto",
        value: card.plan?.plannedBudget ?? 0,
        isCurrency: true,
      },
      { label: "Beneficio", value: card.plan?.plannedBenefit ?? 0 },
      { label: "Medición", value: card.plan?.plannedMeasurementGoal ?? 0 },
      { label: "Indicador", value: card.plan?.plannedIndicatorGoal ?? 0 },
    ];
  }

  readonly editingCard = computed<MonthCard | null>(() => {
    const m = this.editingMonth();
    if (m == null) return null;
    return this.cards().find((c) => c.month === m) ?? null;
  });

  readonly modalTitle = computed(() => {
    const c = this.editingCard();
    return c ? `${c.plan ? "Editar" : "Registrar"} plan — ${c.label}` : "";
  });

  form = this.fb.group({
    plannedBudget: [0, [Validators.required, Validators.min(0)]],
    plannedBenefit: [0, [Validators.required, Validators.min(0)]],
    plannedMeasurementGoal: [0, [Validators.required, Validators.min(0)]],
    plannedIndicatorGoal: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.service = new PatActivityPlanServiceByActivityId(
      this.baseService,
      this.activityId(),
    );
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.findAll({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data) this.plans.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openMonth(card: MonthCard) {
    this.editingMonth.set(card.month);
    this.error.set(null);
    if (card.plan) {
      this.form.reset({
        plannedBudget: card.plan.plannedBudget,
        plannedBenefit: card.plan.plannedBenefit,
        plannedMeasurementGoal: card.plan.plannedMeasurementGoal,
        plannedIndicatorGoal: card.plan.plannedIndicatorGoal,
      });
    } else {
      this.form.reset({
        plannedBudget: 0,
        plannedBenefit: 0,
        plannedMeasurementGoal: 0,
        plannedIndicatorGoal: 0,
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

    const dto: CreatePatActivityPlanDto = {
      activityId: this.activityId(),
      month: card.month,
      plannedBudget: this.form.value.plannedBudget!,
      plannedBenefit: this.form.value.plannedBenefit!,
      plannedMeasurementGoal: this.form.value.plannedMeasurementGoal!,
      plannedIndicatorGoal: this.form.value.plannedIndicatorGoal!,
    };

    const req$ = card.plan
      ? this.baseService.update(card.plan.id, dto)
      : this.baseService.create(dto);

    req$.subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.closeModal();
          const planificationsMap = new Map(this.plans().map((e) => [e.id, e]));
          planificationsMap.set(res.data.id, res.data);
          this.plans.set(Array.from(planificationsMap.values()));
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? "Error al guardar el plan");
      },
    });
  }
}
