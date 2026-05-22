// pat/pages/program-detail/program-detail.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Subject, forkJoin, takeUntil } from "rxjs";
import { PatApiService } from "../../../../core/services/pat-api.service";
import {
  Program,
  ActivityWithMetrics,
  BudgetItem,
  ScheduleRow,
  BudgetSummary,
} from "../../models/pat.models";
import {
  getProgramStatusLabel,
  getProgramStatusClass,
  MONTH_NAMES,
} from "../../utils/pat-status.utils";
import { StatusBadgeComponent } from "../../components/status-badge/status-badge.component";
import { PatProgressBarComponent } from "../../components/progress-bar/progress-bar.component";
import { StrategicGoalsPanelComponent } from "../../components/strategic-goals-panel/strategic-goals-panel.component";

type TabType =
  | "info"
  | "activities"
  | "budget"
  | "schedule"
  | "goals"
  | "execution";

@Component({
  selector: "app-program-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    StatusBadgeComponent,
    PatProgressBarComponent,
    StrategicGoalsPanelComponent,
  ],
  templateUrl: "./program-detail.component.html",
  styleUrl: "./program-detail.component.scss",
})
export class ProgramDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly patApi = inject(PatApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // ── Estado ────────────────────────────────────────────────
  programId = signal<number>(0);
  program = signal<Program | null>(null);
  activities = signal<ActivityWithMetrics[]>([]);
  budgetItems = signal<BudgetItem[]>([]);
  schedule = signal<ScheduleRow[]>([]);
  loading = signal(true);
  activeTab = signal<TabType>("info");

  submitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  readonly monthNames = MONTH_NAMES;

  currentMonth = new Date().getMonth() + 1;
  availableMonths = MONTH_NAMES.map((name, idx) => ({
    value: idx + 1,
    label: name,
  })).filter((m) => m.value <= this.currentMonth);

  executionForm = this.fb.group({
    activityId: ["", Validators.required],
    month: ["", Validators.required],
    executedGoal: ["", [Validators.required, Validators.min(0)]],
    executedAmount: ["", [Validators.required, Validators.min(0)]],
    notes: [""],
  });

  // ── Métricas computadas ───────────────────────────────────
  totalMeta = computed(() =>
    this.activities().reduce((s, a) => s + a.goalTotal, 0),
  );
  totalMetaEjecutada = computed(() =>
    this.activities().reduce((s, a) => s + a.executedGoal, 0),
  );
  metaProgress = computed(() => {
    const t = this.totalMeta();
    return t > 0 ? Math.round((this.totalMetaEjecutada() / t) * 100) : 0;
  });

  totalBudgetPlanned = computed(() =>
    this.budgetItems().reduce((s, b) => s + b.planned, 0),
  );
  totalBudgetExecuted = computed(() =>
    this.budgetItems().reduce((s, b) => s + b.executed, 0),
  );
  budgetProgress = computed(() => {
    const t = this.totalBudgetPlanned();
    return t > 0 ? Math.round((this.totalBudgetExecuted() / t) * 100) : 0;
  });
  budgetAvailable = computed(
    () => this.totalBudgetPlanned() - this.totalBudgetExecuted(),
  );

  // ── Por rubro presupuestal ────────────────────────────────
  budgetByRubric = computed<
    Array<{ rubric: string; planned: number; executed: number; pct: number }>
  >(() => {
    const map = new Map<string, { planned: number; executed: number }>();
    this.budgetItems().forEach((b) => {
      const key = b.budgetRubric || "Sin rubro";
      const curr = map.get(key) ?? { planned: 0, executed: 0 };
      map.set(key, {
        planned: curr.planned + b.planned,
        executed: curr.executed + b.executed,
      });
    });
    return Array.from(map.entries()).map(([rubric, v]) => ({
      rubric,
      planned: v.planned,
      executed: v.executed,
      pct: v.planned > 0 ? Math.round((v.executed / v.planned) * 100) : 0,
    }));
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = +params["id"];
      this.programId.set(id);
      this.loadProgram(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProgram(id: number): void {
    this.loading.set(true);

    // Reemplaza las subscripciones anidadas con forkJoin
    this.patApi
      .getProgramById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (program) => {
          this.program.set(program);

          forkJoin({
            activities: this.patApi.getActivitiesWithMetrics(id),
            budget: this.patApi.getBudgetByProgram(id),
            schedule: this.patApi.getScheduleByProgram(id),
          })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: ({ activities, budget, schedule }) => {
                this.activities.set(activities);
                this.budgetItems.set(budget);
                this.schedule.set(schedule);
                this.loading.set(false);
              },
              error: () => this.loading.set(false),
            });
        },
        error: () => {
          this.program.set(null);
          this.loading.set(false);
        },
      });
  }

  setTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }

  getBudgetPct(item: BudgetItem): number {
    return item.planned > 0
      ? Math.round((item.executed / item.planned) * 100)
      : 0;
  }

  getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? `Mes ${month}`;
  }

  getMonthStatusClass(row: ScheduleRow): string {
    if (row.plannedGoal === 0) return "pending";
    const pct = (row.executedGoal / row.plannedGoal) * 100;
    if (pct >= 100) return "completed";
    if (pct >= 50) return "partial";
    return "delayed";
  }

  submitExecution(): void {
    if (this.executionForm.invalid) {
      this.executionForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    const v = this.executionForm.value;

    this.patApi
      .createExecution({
        activityId: +v.activityId!,
        month: +v.month!,
        executedGoal: +v.executedGoal!,
        executedAmount: +v.executedAmount!,
        notes: v.notes ?? undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitSuccess.set(true);
          this.submitting.set(false);
          this.executionForm.reset();
          this.loadProgram(this.programId());
        },
        error: (err) => {
          this.submitError.set(
            err.error?.message ?? "Error al registrar ejecución",
          );
          this.submitting.set(false);
        },
      });
  }

  // Delegación a utils (sin duplicación)
  getStatusLabel = getProgramStatusLabel;
  getStatusClass = getProgramStatusClass;
}
