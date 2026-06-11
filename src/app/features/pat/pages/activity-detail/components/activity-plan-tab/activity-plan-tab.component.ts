import { Component, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PatActivityPlan } from "@/app/core/services/pat/pat-activity-plan.service";
import {
  MonthCardMetric,
  MonthMetricCardComponent,
} from "../month-metric-card/month-metric-card.component";
import {
  ActivityPlanModalComponent,
  MonthCardModalData,
} from "./activity-plan-modal/activity-plan-modal.component";
import { MonthCard } from "../../activity-detail.component";

@Component({
  selector: "app-activity-plan-tab",
  standalone: true,
  imports: [CommonModule, MonthMetricCardComponent, ActivityPlanModalComponent],
  templateUrl: "./activity-plan-tab.component.html",
})
export class ActivityPlanTabComponent {
  activityId = input.required<number>();
  cards = input.required<MonthCard[]>();
  modalOpen = signal(false);
  editingCardData = signal<MonthCardModalData | null>(null);

  onSaved = output<PatActivityPlan>();

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

  openMonth(card: MonthCard) {
    this.editingCardData.set(card);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingCardData.set(null);
  }
}
