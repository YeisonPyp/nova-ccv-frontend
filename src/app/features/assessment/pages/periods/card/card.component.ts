import { Component, computed, input, output } from "@angular/core";
import { Period } from "../../../../../core/models/assessment/period.model";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-period-card",
  imports: [CommonModule],
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
})
export class PeriodCardComponent {
  period = input.required<Period>();

  onSelectPeriod = output<Period>();

  progress = computed<number>(() => {
    return 0;
  });

  title = computed<String>(() => {
    const period = this.period();
    const starts = new Date(period.startDate);
    const ends = new Date(period.endDate);

    return `${starts.getDate() + ""} - ${ends.getDate() + ""}`;
  });

  status = computed<String>(() => {
    const ends = new Date(this.period().endDate);

    return ends > new Date() ? "Activo" : "Finalizado";
  });

  selectPeriod() {
    this.onSelectPeriod.emit(this.period());
  }
}
