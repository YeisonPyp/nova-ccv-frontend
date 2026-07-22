import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TrainingProgramService } from '@/app/core/services/training/training-program.service';
import { ProgramMetrics } from '@/app/core/models/training/training-program.models';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-program-metrics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LoadingSpinnerComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './program-metrics.component.html',
})
export class ProgramMetricsComponent {
  private readonly service = inject(TrainingProgramService);

  programId = input.required<number>();

  metrics = signal<ProgramMetrics | null>(null);
  loading = signal(false);

  hasData = computed(() => (this.metrics()?.trainings?.length ?? 0) > 0);

  private labels(): string[] {
    return (this.metrics()?.trainings ?? []).map((t) =>
      new Date(t.scheduledDate).toLocaleDateString(),
    );
  }

  avgChart = computed<ChartData<'bar'>>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: (this.metrics()?.trainings ?? []).map((t) =>
          Number(t.avgScore ?? 0),
        ),
        label: 'Nota promedio',
        backgroundColor: '#4f46e5',
        borderRadius: 4,
      },
    ],
  }));

  participantsChart = computed<ChartData<'bar'>>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: (this.metrics()?.trainings ?? []).map((t) => t.participantCount),
        label: 'Participantes',
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  }));

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  constructor() {
    effect(() => {
      const id = this.programId();
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
