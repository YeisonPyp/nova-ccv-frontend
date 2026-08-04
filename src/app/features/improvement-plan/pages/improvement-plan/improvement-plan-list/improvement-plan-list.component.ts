import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from "ng2-charts";
import { Chart, registerables, ChartConfiguration, ChartData } from "chart.js";
import { PaginatorComponent } from "@/app/shared/components/paginator/paginator.component";
import { ImprovementPlanService } from "@/app/core/services/improvement-plan/improvement-plan.service";
import { ImprovementPlan } from "@/app/core/models/improvement-plan/improvement-plan.model";
import { ImprovementPlanMetricsCardsComponent } from "../components/improvement-plan-metrics-cards/improvement-plan-metrics-cards.component";
import { Router } from "@angular/router";
import { HasPermissionDirective } from "@/app/shared/directives/has-permission.directive";

Chart.register(...registerables);

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  RUNNING: "En ejecución",
  COMPLETED: "Completada",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#94a3b8",
  RUNNING: "#3b82f6",
  COMPLETED: "#22c55e",
  OVERDUE: "#ed3237",
  CANCELLED: "#6b7280",
};

@Component({
  selector: "app-improvement-plan-list",
  standalone: true,
  imports: [
    CommonModule,
    PaginatorComponent,
    ImprovementPlanMetricsCardsComponent,
    HasPermissionDirective,
    BaseChartDirective,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: "./improvement-plan-list.component.html",
  styleUrls: ["./improvement-plan-list.component.scss"],
})
export class ImprovementPlanListComponent implements OnInit {
  private improvementPlanService = inject(ImprovementPlanService);
  private readonly router = inject(Router);

  plans = signal<ImprovementPlan[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(10);

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(page: number = 1): void {
    this.loading.set(true);
    this.improvementPlanService
      .findElements(page - 1, this.pageSize())
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.plans.set(response.data.content);
            this.currentPage.set(response.data.pageable.pageNumber + 1);
            this.totalPages.set(Math.max(1, response.data.totalPages));
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set("Error loading improvement plans");
          this.loading.set(false);
          console.error(err);
        },
      });
  }

  onPageChange(page: number): void {
    this.loadPlans(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.loadPlans(1);
  }

  openPlan(plan?: ImprovementPlan): void {
    if (plan) {
      this.router.navigate(["/improvement-plan", plan.id]);
    } else {
      this.router.navigate(["/improvement-plan/create"]);
    }
  }

  deletePlan(plan: ImprovementPlan): void {
    if (confirm(`¿Estás seguro de eliminar el plan "${plan.name}"?`)) {
      this.improvementPlanService.deleteById(plan.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadPlans(this.currentPage());
          }
        },
        error: (err) => console.error("Error deleting plan:", err),
      });
    }
  }

  isAdmin(): boolean {
    return true;
  }

  hasActions(plan: ImprovementPlan): boolean {
    return (plan.actionStatusCounts?.length ?? 0) > 0;
  }

  chartData(plan: ImprovementPlan): ChartData<"doughnut"> {
    const rows = plan.actionStatusCounts ?? [];
    return {
      labels: rows.map((r) => STATUS_LABELS[r.status] ?? r.status),
      datasets: [
        {
          data: rows.map((r) => r.count),
          backgroundColor: rows.map(
            (r) => STATUS_COLORS[r.status] ?? "#d1d5db",
          ),
          borderWidth: 0,
        },
      ],
    };
  }

  readonly chartOptions: ChartConfiguration<"doughnut">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } },
    },
  };
}
