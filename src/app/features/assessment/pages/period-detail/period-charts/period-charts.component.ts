import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { PeriodChartsService } from '@/app/core/services/assessment/period-charts.service';
import { PeriodCharts } from '@/app/core/models/assessment/period-charts.model';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-period-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LoadingSpinnerComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './period-charts.component.html',
})
export class PeriodChartsComponent {
  private readonly service = inject(PeriodChartsService);

  periodId = input.required<number>();

  isLoading = signal(false);
  data = signal<PeriodCharts | null>(null);

  hasPositionData = computed(
    () => (this.data()?.positionAvgScores.length ?? 0) > 0,
  );
  hasSurveyData = computed(
    () => (this.data()?.surveyAvgScores.length ?? 0) > 0,
  );
  hasAreaData = computed(
    () => (this.data()?.areaAssessmentCounts.length ?? 0) > 0,
  );

  // Palette reused across charts
  private readonly palette = [
    '#4f46e5',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
  ];

  positionChartData = computed<ChartData<'bar'>>(() => {
    const rows = this.data()?.positionAvgScores ?? [];
    return {
      labels: rows.map((r) => r.positionName),
      datasets: [
        {
          data: rows.map((r) => Number(r.avgScore ?? 0)),
          label: 'Promedio',
          backgroundColor: '#4f46e5',
          borderRadius: 4,
        },
      ],
    };
  });

  surveyChartData = computed<ChartData<'bar'>>(() => {
    const rows = this.data()?.surveyAvgScores ?? [];
    return {
      labels: rows.map((r) => r.surveyName),
      datasets: [
        {
          data: rows.map((r) => Number(r.avgScore ?? 0)),
          label: 'Promedio',
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
      ],
    };
  });

  areaChartData = computed<ChartData<'pie'>>(() => {
    const rows = this.data()?.areaAssessmentCounts ?? [];
    return {
      labels: rows.map((r) => r.areaName),
      datasets: [
        {
          data: rows.map((r) => Number(r.totalAssessments ?? 0)),
          backgroundColor: rows.map(
            (_, i) => this.palette[i % this.palette.length],
          ),
        },
      ],
    };
  });

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Promedio' } },
    },
  };

  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
  };

  constructor() {
    effect(() => {
      const id = this.periodId();
      this.isLoading.set(true);
      this.service.getCharts(id).subscribe({
        next: (res) => {
          this.data.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    });
  }
}
