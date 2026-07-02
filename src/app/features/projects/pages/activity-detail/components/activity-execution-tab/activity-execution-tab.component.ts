import { Component, computed, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import {
  MonthCardMetric,
  MonthMetricCardComponent,
} from "../month-metric-card/month-metric-card.component";
import {
  PatActivityBudgetMatrix,
  PatActivityConsolidation,
  PatActivityExecution,
} from "@/app/core/models/pat/pat-models";
import { MonthCard } from "../../activity-detail.component";
import { ActivityExecutionModalComponent } from "./activity-execution-modal/activity-execution-modal.component";

@Component({
  selector: "app-activity-execution-tab",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MonthMetricCardComponent,
    ActivityExecutionModalComponent,
  ],
  templateUrl: "./activity-execution-tab.component.html",
})
export class ActivityExecutionTabComponent {
  activityId = input.required<number>();
  consolidation = input.required<PatActivityConsolidation>();
  cards = input.required<MonthCard[]>();
  modalOpen = signal(false);
  onSave = output<PatActivityExecution>();
  budgetMatrix = input.required<PatActivityBudgetMatrix[]>();

  editingMonth = signal<MonthCard | null>(null);

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

  readonly modalTitle = computed(() => {
    const c = this.editingMonth();
    return c
      ? `${c.execution ? "Editar" : "Registrar"} ejecución — ${c.label}`
      : "";
  });

  openMonth(card: MonthCard) {
    this.editingMonth.set(card);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editingMonth.set(null);
  }
}
