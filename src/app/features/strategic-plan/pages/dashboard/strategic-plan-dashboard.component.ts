import { StrategicPlan } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { StrategicPlanService } from "@/app/core/services/strategic-plan/strategic-plan.service";
import { PaginationComponent } from "@/app/shared/components/pagination/pagination.component";
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { StrategicPlanCardComponent } from "./strategic-plan-card/strategic-plan-card.component";
import { StrategicPlanModalComponent } from "./strategic-plan-modal/strategic-plan-modal.component";
import { LoadingSpinnerComponent } from "@/app/shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: "app-strategic-plan-dashboard",
  imports: [
    CommonModule,
    PaginationComponent,
    StrategicPlanCardComponent,
    StrategicPlanModalComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: "./strategic-plan-dashboard.component.html",
  standalone: true,
})
export class StrategicPlanDashboardComponent implements OnInit {
  private readonly service = inject(StrategicPlanService);
  isLoading = signal(false);
  plans = signal<StrategicPlan[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  showModal = signal(false);

  load(page: number) {
    this.isLoading.set(true);
    this.service.findAll({ page: page - 1, size: this.pageSize() }).subscribe({
      next: (res) => {
        this.plans.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.currentPage.set(page);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onPlanCreated(plan: StrategicPlan): void {
    this.plans.update((list) => [plan, ...list]);
  }

  ngOnInit(): void {
    this.load(this.currentPage());
  }
}
