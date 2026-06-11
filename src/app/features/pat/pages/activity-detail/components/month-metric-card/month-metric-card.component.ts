import { CommonModule } from "@angular/common";
import { Component, input, output } from "@angular/core";

export interface MonthCardMetric {
  label: string;
  value: number;
  isCurrency?: boolean;
}

@Component({
  selector: "app-month-metric-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./month-metric-card.component.html",
})
export class MonthMetricCardComponent {
  readonly label = input.required<string>();
  readonly registered = input<boolean>(false);
  readonly metrics = input.required<MonthCardMetric[]>();
  readonly registeredLabel = input<string>("Registrado");
  readonly pendingLabel = input<string>("Pendiente");

  readonly cardClick = output<void>();
}
