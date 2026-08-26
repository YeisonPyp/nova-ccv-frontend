import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-execution-pie-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './execution-pie-chart.component.html',
})
export class ExecutionPieChartComponent {
  readonly title = input<string>('');
  readonly planned = input.required<number>();
  readonly executed = input.required<number>();
  readonly height = input<number>(220);

  readonly data = computed<ChartData<'doughnut'>>(() => {
    const planned = this.planned() ?? 0;
    const executed = this.executed() ?? 0;
    const remaining = Math.max(planned - executed, 0);

    return {
      labels: ['Ejecutado', 'Restante'],
      datasets: [
        {
          data: [executed, remaining],
          backgroundColor: ['#ed3237', '#e5e7eb'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly pct = computed<number>(() => {
    const planned = this.planned() ?? 0;
    const executed = this.executed() ?? 0;
    if (!planned) return 0;
    return Number(((executed / planned) * 100).toFixed(1));
  });

  readonly options: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
    },
  };
}
