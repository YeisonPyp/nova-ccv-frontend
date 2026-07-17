import { CommonModule } from '@angular/common';
import { EvaluationPeriod } from '@/app/core/models/assessment/period.model';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBadgeDirective } from '@/app/shared/directives/status-badge.directive';

@Component({
  selector: 'app-period-card',
  templateUrl: './period-card.component.html',
  standalone: true,
  imports: [CommonModule, StatusBadgeDirective],
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

  onClick() {
    this.router.navigate(['/assessment/periods', this.period().id]);
  }
}
