import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { MONTH_NAMES_SHORT } from '@/app/shared/utils/month-names';

Chart.register(...registerables);

/**
 * Grouped monthly bars: one planned and one executed bar per month. Same two
 * series and palette as {@link PlannedExecutedLineChartComponent}, for the
 * cases where the magnitudes are counts rather than a continuous trend.
 */
@Component({
  selector: 'app-planned-executed-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './planned-executed-bar-chart.component.html',
})
export class PlannedExecutedBarChartComponent {
  readonly title = input<string>('');
  readonly plannedValues = input.required<number[]>();
  readonly executedValues = input.required<number[]>();
  readonly plannedLabel = input<string>('Planeado');
  readonly executedLabel = input<string>('Ejecutado');
  readonly height = input<number>(260);

  readonly data = computed<ChartData<'bar'>>(() => ({
    labels: MONTH_NAMES_SHORT,
    datasets: [
      {
        data: this.plannedValues(),
        label: this.plannedLabel(),
        backgroundColor: '#94a3b8',
        borderRadius: 4,
      },
      {
        data: this.executedValues(),
        label: this.executedLabel(),
        backgroundColor: '#ed3237',
        borderRadius: 4,
      },
    ],
  }));

  readonly options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 10 } },
      },
    },
    scales: {
      // Counts of tasks: only whole numbers make sense on the axis.
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };
}
