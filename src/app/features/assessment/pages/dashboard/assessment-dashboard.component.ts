import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationPeriod } from '@/app/core/models/assessment/period.model';
import { AssessmentTableComponent } from '../period-detail/assessment-table/assessment-table.component';
import { Router, RouterLink } from '@angular/router';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { PeriodService } from '@/app/core/services/assessment/period.service';
import { PeriodCardComponent } from './period-card/period-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { AssessmentYearMetricsComponent } from './assessment-year-metrics/assessment-year-metrics.component';

@Component({
  selector: 'app-assessment-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    PaginatorComponent,
    PeriodCardComponent,
    LoadingSpinnerComponent,
    AssessmentYearMetricsComponent,
  ],
  templateUrl: './assessment-dashboard.component.html',
})
export class AssessmentDashboardComponent {
  private readonly service = inject(PeriodService);

  periods = signal<EvaluationPeriod[]>([]);
  size = signal<number>(10);
  page = signal<number>(1);
  pages = signal<number>(0);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const page = this.page();
      const size = this.size();
      this.isLoading.set(true);
      this.service
        .findPeriodsWithMetrics({ page: page - 1, size })
        .subscribe((res) => {
          this.periods.set(res.data.content);
          this.pages.set(res.data.totalPages);
          this.isLoading.set(false);
        });
    });
  }
}
