import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImprovementPlanMetricsService } from "@/app/core/services/improvement-plan/improvement-plan-metrics.service";

@Component({
  selector: "app-improvement-plan-metrics-cards",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./improvement-plan-metrics-cards.component.html",
  styleUrl: "./improvement-plan-metrics-cards.component.scss",
})
export class ImprovementPlanMetricsCardsComponent implements OnInit {
  private metricsService = inject(ImprovementPlanMetricsService);

  activePlans = signal<number>(0);
  totalActions = signal<number>(0);
  completedActions = signal<number>(0);
  completionRate = signal<number>(0);

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.metricsService.getMetrics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;

          let activePlansCount = 0;
          if (data.planMetrics) {
            activePlansCount = data.planMetrics
              .filter((m) => m.status !== "COMPLETED")
              .reduce((acc, m) => acc + m.count, 0);
          }
          this.activePlans.set(activePlansCount);

          let totalActionsCount = 0;
          let completedActionsCount = 0;
          if (data.actionMetrics) {
            totalActionsCount = data.actionMetrics.reduce(
              (acc, m) => acc + m.count,
              0,
            );
            completedActionsCount = data.actionMetrics
              .filter((m) => m.status === "COMPLETED")
              .reduce((acc, m) => acc + m.count, 0);
          }

          this.totalActions.set(totalActionsCount);
          this.completedActions.set(completedActionsCount);

          if (totalActionsCount > 0) {
            this.completionRate.set(
              Math.round((completedActionsCount / totalActionsCount) * 100),
            );
          } else {
            this.completionRate.set(0);
          }
        }
      },
      error: (err) => console.error("Error loading metrics:", err),
    });
  }
}
