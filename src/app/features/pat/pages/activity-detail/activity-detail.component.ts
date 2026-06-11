import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PatActivityService } from "@/app/core/services/pat/pat-activity.service";
import { ActivityExecutionTabComponent } from "./components/activity-execution-tab/activity-execution-tab.component";
import { ActivityPlanTabComponent } from "./components/activity-plan-tab/activity-plan-tab.component";
import {
  ActivityBudgetExecution,
  PatActivity,
  PatActivityBudget,
  PatActivityBudgetMatrix,
  PatActivityExecution,
} from "@/app/core/models/pat/pat-models";
import { BudgetTabComponent } from "./components/budget-tab/budget-tab.component";
import { PatActivityPlan } from "@/app/core/services/pat/pat-activity-plan.service";

export interface MonthCard {
  month: number;
  label: string;
  execution: PatActivityExecution | null;
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
  selector: "app-activity-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BudgetTabComponent,
    ActivityExecutionTabComponent,
    ActivityPlanTabComponent,
  ],
  templateUrl: "./activity-detail.component.html",
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private activityService = inject(PatActivityService);

  executionsByMonth = computed<Record<number, PatActivityExecution>>(() => {
    const executionsByMonth: Record<number, PatActivityExecution> = {};
    for (const e of this.executions()) executionsByMonth[e.month] = e;
    return executionsByMonth;
  });

  plansByMonth = computed<Record<number, PatActivityPlan>>(() => {
    const plansByMonth: Record<number, PatActivityPlan> = {};
    for (const p of this.plans()) plansByMonth[p.month] = p;
    return plansByMonth;
  });

  readonly cards = computed<MonthCard[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: MONTH_NAMES[i],
      execution: this.executionsByMonth()[i + 1] ?? null,
      plan: this.plansByMonth()[i + 1] ?? null,
    }));
  });

  activity = signal<PatActivity | null>(null);
  executions = signal<PatActivityExecution[]>([]);
  budgetMatrix = signal<PatActivityBudgetMatrix[]>([]);
  plans = signal<PatActivityPlan[]>([]);

  loading = signal(true);
  activeTab = signal<"execution" | "plan" | "budget">("execution");

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        this.loadActivity(Number(id));
      } else {
        this.loading.set(false);
      }
    });
  }

  loadActivity(id: number) {
    this.loading.set(true);
    this.activityService.findById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activity.set(res.data);
          this.executions.set(res.data.executions ?? []);
          this.plans.set(res.data.plans ?? []);
          this.budgetMatrix.set(res.data.budgetMatrix ?? []);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSaveBudget(m: PatActivityBudgetMatrix) {
    const consolidation = this.activity()?.consolidation;

    if (consolidation) {
      const matrix = this.budgetMatrix().reduce(
        (acc, curr) => {
          acc[curr.budgetCategory.id] = curr.patActivityBudget!;
          return acc;
        },
        {} as Record<number, PatActivityBudget>,
      );

      matrix[m.budgetCategory.id] = m.patActivityBudget!;
      const totalBudget = Object.values(matrix).reduce(
        (acc, curr) => acc + curr.totalBudget,
        0,
      );

      consolidation.approvedBudget = totalBudget;
      this.activity.set({
        ...this.activity()!,
        consolidation: { ...consolidation },
      });
    }
  }

  onSaveExecution(ex: PatActivityExecution) {
    this.executions.update((e) => {
      const executionsMap = e.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, PatActivityExecution>,
      );

      executionsMap[ex.id] = ex;

      return Object.values(executionsMap);
    });
  }

  onSavePlan(p: PatActivityPlan) {
    this.plans.update((i) => {
      const plansMap = i.reduce(
        (acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        },
        {} as Record<number, PatActivityPlan>,
      );
      plansMap[p.id] = p;
      return Object.values(plansMap);
    });
  }
}
