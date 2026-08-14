import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

Chart.register(...registerables);

@Component({
  selector: 'app-monthly-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './monthly-bar-chart.component.html',
})
export class MonthlyBarChartComponent {
  readonly title = input<string>('');
  readonly values = input.required<number[]>();
  readonly label = input<string>('Planeado');
  readonly height = input<number>(260);

  readonly data = computed<ChartData<'bar'>>(() => ({
    labels: MONTH_LABELS,
    datasets: [
      {
        data: this.values(),
        label: this.label(),
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
      y: { beginAtZero: true },
    },
  };
}
