import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PatActivityService } from "@/app/core/services/pat/pat-activity.service";
import { ActivityExecutionTabComponent } from "./components/activity-execution-tab/activity-execution-tab.component";
import { ActivityPlanTabComponent } from "./components/activity-plan-tab/activity-plan-tab.component";
import { NestedValuePipe } from "@/app/shared/pipes/nested-value.pipe";
import { PatActivity } from "@/app/core/models/pat/pat-models";
import { BudgetTabComponent } from "./components/budget-tab/budget-tab.component";

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

  activity = signal<PatActivity | null>(null);
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
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSaveBudget(totalBudget: number) {
    const consolidation = this.activity()?.consolidation;
    if (consolidation) {
      consolidation.approvedBudget = totalBudget;
      this.activity.set({
        ...this.activity()!,
        consolidation: { ...consolidation },
      });
    }
  }
}
