import {
  AreaAssessmentStats,
  AssessmentYearStats,
} from '@/app/core/models/assessment/assessment-metrics.model';
import { AssessmentService } from '@/app/core/services/assessment/assessment.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { ChartExporterComponent } from '@/app/shared/components/chart-exporter/chart-exporter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';

@Component({
  selector: 'app-assessment-year-metrics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseChartDirective,
    LoadingSpinnerComponent,
    DynamicTableComponent,
    ChartExporterComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './assessment-year-metrics.component.html',
})
export class AssessmentYearMetricsComponent {
  private readonly service = inject(AssessmentService);

  statuses = signal<string[]>(['COMPLETED', 'PENDING']);
  status = signal<string>(this.statuses()[0]);

  selectedYear = signal<number | null>(null);

  isLoading = signal(false);
  isLoadingAreas = signal(false);

  yearStats = signal<AssessmentYearStats[]>([]);
  areaStats = signal<AreaAssessmentStats[]>([]);

  /** Reference line drawn on the line chart (e.g. the expected score). */
  targetScore = signal<number>(80);

  // ── Tables ────────────────────────────────────────────────────────────────

  private readonly pct = (v: number | null | undefined) =>
    v === null || v === undefined ? '-' : `${Number(v).toFixed(2)}%`;

  yearColumns: TableColumn[] = [
    { key: 'year', label: 'Año' },
    { key: 'totalAssessments', label: 'Evaluaciones' },
    { key: 'totalEvaluatees', label: 'Evaluados' },
    { key: 'totalEvaluators', label: 'Evaluadores' },
    { key: 'totalPeriods', label: 'Periodos' },
    {
      key: 'avgPctScore',
      label: 'Promedio',
      valueCallBack: (s: AssessmentYearStats) => this.pct(s.avgPctScore),
    },
  ];

  areaColumns: TableColumn[] = [
    { key: 'areaName', label: 'Área' },
    { key: 'totalAssessments', label: 'Evaluaciones' },
    { key: 'totalEvaluatees', label: 'Evaluados' },
    { key: 'totalEvaluators', label: 'Evaluadores' },
    {
      key: 'avgPctScore',
      label: 'Promedio',
      valueCallBack: (s: AreaAssessmentStats) => this.pct(s.avgPctScore),
    },
  ];

  // ── Charts ────────────────────────────────────────────────────────────────

  /** Years sorted ascending so the line reads left to right. */
  private sortedYearStats = computed(() =>
    [...this.yearStats()].sort((a, b) => a.year - b.year),
  );

  hasYearData = computed(() => this.sortedYearStats().length > 0);
  hasAreaData = computed(() => this.areaStats().length > 0);

  lineChartData = computed<ChartData<'line'>>(() => {
    const rows = this.sortedYearStats();
    const target = this.targetScore();
    return {
      labels: rows.map((r) => String(r.year)),
      datasets: [
        {
          data: rows.map((r) => Number(r.avgPctScore ?? 0)),
          label: 'Promedio (%)',
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          pointBackgroundColor: '#4f46e5',
          pointRadius: 4,
          tension: 0.3,
          fill: true,
        },
        {
          // constant reference line built from the numeric input
          data: rows.map(() => target),
          label: `Meta (${target}%)`,
          borderColor: '#ef4444',
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  });

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        title: { display: true, text: 'Promedio (%)' },
      },
    },
  };

  areaChartData = computed<ChartData<'bar'>>(() => {
    const rows = this.areaStats();
    return {
      labels: rows.map((r) => r.areaName),
      datasets: [
        {
          data: rows.map((r) => Number(r.avgPctScore ?? 0)),
          label: 'Promedio (%)',
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
      ],
    };
  });

  areaChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        title: { display: true, text: 'Promedio (%)' },
      },
    },
  };

  // ── Data loading ──────────────────────────────────────────────────────────

  constructor() {
    effect(() => {
      const status = this.status();
      this.isLoading.set(true);
      this.service.findAssessmentYearMetrics(status).subscribe({
        next: (res) => {
          this.yearStats.set(res.data.stats ?? []);
          this.areaStats.set(res.data.areaStats ?? []);
          // the backend seeds area stats with the first year it returned
          this.selectedYear.set(res.data.stats?.[0]?.year ?? null);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    });
  }

  /** Selecting a year in the table refreshes the area metrics. */
  selectYear(stats: AssessmentYearStats) {
    this.selectedYear.set(stats.year);
    this.loadMetricsStats(stats.year);
  }

  loadMetricsStats(year: number) {
    this.isLoadingAreas.set(true);
    this.service.findAssessmentAreaMetrics(year, this.status()).subscribe({
      next: (res) => {
        this.areaStats.set(res.data ?? []);
        this.isLoadingAreas.set(false);
      },
      error: () => this.isLoadingAreas.set(false),
    });
  }

  setTarget(value: number) {
    this.targetScore.set(Number(value) || 0);
  }
}
