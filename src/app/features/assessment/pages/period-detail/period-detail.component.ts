import { EvaluationPeriod } from '@/app/core/models/assessment/period.model';
import { Component, effect, inject, input, signal } from '@angular/core';
import { AssessmentTableComponent } from './assessment-table/assessment-table.component';
import { PeriodService } from '@/app/core/services/assessment/period.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PeriodCardComponent } from '../dashboard/period-card/period-card.component';

@Component({
  selector: 'app-period-detail',
  standalone: true,
  imports: [
    AssessmentTableComponent,
    LoadingSpinnerComponent,
    PeriodCardComponent,
  ],
  template: './period-detail.component.html',
})
export class PeriodDetailComponent {
  private readonly service = inject(PeriodService);
  periodId = input.required<number>();

  isLoading = signal(false);
  period = signal<EvaluationPeriod | null>(null);

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service
        .findById(this.periodId())
        .subscribe((res) => this.period.set(res.data));
    });
  }
}
