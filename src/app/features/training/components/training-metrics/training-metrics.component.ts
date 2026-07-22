import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TrainingService } from '@/app/core/services/training/training.service';
import {
  SurveyAudience,
  TrainingMetrics,
  TrainingSurveyMetric,
} from '@/app/core/models/training/training.models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

interface ScopeGroup {
  scope: SurveyAudience;
  title: string;
  color: string;
  surveys: TrainingSurveyMetric[];
}

@Component({
  selector: 'app-training-metrics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LoadingSpinnerComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './training-metrics.component.html',
})
export class TrainingMetricsComponent {
  private readonly service = inject(TrainingService);

  trainingId = input.required<number>();

  metrics = signal<TrainingMetrics | null>(null);
  loading = signal(false);

  private readonly colors: Record<SurveyAudience, string> = {
    EMPLOYEES: '#4f46e5',
    TRAINING: '#10b981',
  };

  groups = computed<ScopeGroup[]>(() => {
    const surveys = this.metrics()?.surveys ?? [];
    const build = (scope: SurveyAudience, title: string): ScopeGroup => ({
      scope,
      title,
      color: this.colors[scope],
      surveys: surveys.filter((s) => s.aimedAt === scope),
    });
    return [
      build('EMPLOYEES', 'Evaluación de empleados'),
      build('TRAINING', 'Feedback de la capacitación'),
    ].filter((g) => g.surveys.length > 0);
  });

  hasData = computed(() => (this.metrics()?.surveys.length ?? 0) > 0);

  /** Bar: average score per survey within a scope. */
  scopeChart(group: ScopeGroup): ChartData<'bar'> {
    return {
      labels: group.surveys.map((s) => s.surveyName),
      datasets: [
        {
          data: group.surveys.map((s) => Number(s.avgScore ?? 0)),
          label: 'Promedio',
          backgroundColor: group.color,
          borderRadius: 4,
        },
      ],
    };
  }

  /** Bar: average score per question inside one survey. */
  questionChart(survey: TrainingSurveyMetric, color: string): ChartData<'bar'> {
    return {
      labels: survey.questions.map((_, i) => `P${i + 1}`),
      datasets: [
        {
          data: survey.questions.map((q) => Number(q.avgScore ?? 0)),
          label: 'Promedio',
          backgroundColor: color,
          borderRadius: 4,
        },
      ],
    };
  }

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Promedio' } },
    },
  };

  constructor() {
    effect(() => {
      const id = this.trainingId();
      this.loading.set(true);
      this.service.getMetrics(id).subscribe({
        next: (res) => {
          this.metrics.set(res.data ?? null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }
}
