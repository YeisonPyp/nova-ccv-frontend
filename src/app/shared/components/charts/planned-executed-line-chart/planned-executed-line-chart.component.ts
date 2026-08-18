import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MONTH_NAMES_SHORT } from '@/app/shared/utils/month-names';

@Component({
  selector: 'app-planned-executed-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './planned-executed-line-chart.component.html',
})
export class PlannedExecutedLineChartComponent {
  readonly title = input<string>('');
  readonly plannedValues = input.required<number[]>();
  readonly executedValues = input.required<number[]>();
  readonly plannedLabel = input<string>('Planeado');
  readonly executedLabel = input<string>('Ejecutado');
  readonly height = input<number>(220);

  readonly data = computed<ChartData<'line'>>(() => ({
    labels: MONTH_NAMES_SHORT,
    datasets: [
      {
        data: this.plannedValues(),
        label: this.plannedLabel(),
        borderColor: '#94a3b8',
        backgroundColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      },
      {
        data: this.executedValues(),
        label: this.executedLabel(),
        borderColor: '#ed3237',
        backgroundColor: '#ed3237',
        fill: false,
        tension: 0.1,
      },
    ],
  }));

  readonly options: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };
}
