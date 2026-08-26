import { EvaluationPeriod } from '@/app/core/models/assessment/period.model';
import { Component, effect, inject, input, signal } from '@angular/core';
import { AssessmentTableComponent } from './assessment-table/assessment-table.component';
import { PeriodService } from '@/app/core/services/assessment/period.service';
import { PeriodCardComponent } from '../dashboard/period-card/period-card.component';
import { PeriodChartsComponent } from './period-charts/period-charts.component';
import { AssessmentStatusesComponent } from './assessment-statuses/assessment-statuses.component';

@Component({
  selector: 'app-period-detail',
  standalone: true,
  imports: [
    AssessmentTableComponent,
    PeriodCardComponent,
    PeriodChartsComponent,
    AssessmentStatusesComponent,
  ],
  templateUrl: './period-detail.component.html',
})
export class PeriodDetailComponent {
  private readonly service = inject(PeriodService);
  periodId = input.required<number>();

  isLoading = signal(false);
  period = signal<EvaluationPeriod | null>(null);
  status = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service
        .findById(this.periodId())
        .subscribe((res) => this.period.set(res.data));
    });
  }
}
