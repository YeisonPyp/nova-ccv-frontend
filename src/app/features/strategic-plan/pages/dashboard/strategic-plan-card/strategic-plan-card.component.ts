import { StrategicPlan } from "@/app/core/models/strategic-plan/strategic-plan.models";
import { Component, input, computed, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-strategic-plan-card",
  standalone: true,
  templateUrl: "./strategic-plan-card.component.html",
})
export class StrategicPlanCardComponent {
  private readonly router = inject(Router);
  plan = input.required<StrategicPlan>();

  // computed signal with random color
  color = computed(() => {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
  });

  onClick() {
    this.router.navigate(["/strategic-plan", this.plan().id]);
  }
}
