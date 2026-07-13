import { CommonModule } from "@angular/common";
import { EvaluationPeriod } from "@/app/core/models/assessment/period.model";
import { Component, computed, inject, input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-period-card",
  templateUrl: "./period-card.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class PeriodCardComponent {
  private readonly router = inject(Router);
  period = input.required<EvaluationPeriod>();

  readonly score = computed(
    () => this.period().avgScore ?? this.period().averageScore ?? 0,
  );

  readonly statusMap = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const s of this.period().statusCounts ?? []) {
      map[s.status] = s.count;
    }
    return map;
  });

  statusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "COMPLETADA":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
      case "EN_PROGRESO":
        return "bg-yellow-100 text-yellow-700";
      case "PENDING":
      case "PENDIENTE":
        return "bg-gray-100 text-gray-700";
      case "CANCELLED":
      case "CANCELADA":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  onClick() {
    this.router.navigate(["/assessment/periods", this.period().id]);
  }
}
