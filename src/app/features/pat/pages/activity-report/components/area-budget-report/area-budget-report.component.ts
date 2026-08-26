import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  DynamicTableComponent,
  TableColumn,
} from '@/app/shared/components/dynamic-table/dynamic-table.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { PatReportService } from '@/app/core/services/pat/pat-report.service';
import { AreaBudgetSummary } from '@/app/core/models/pat/pat-report-models';

@Component({
  selector: 'app-area-budget-report',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DynamicTableComponent,
    LoadingSpinnerComponent,
    BaseChartDirective,
  ],
  templateUrl: './area-budget-report.component.html',
})
export class AreaBudgetReportComponent {
  private readonly service = inject(PatReportService);

  year = input<number | null>(null);
  selectedAreaIds = output<number[]>();

  areas = signal<AreaBudgetSummary[]>([]);
  isLoading = signal(false);
  checked = signal<Set<number>>(new Set());

  readonly columns: TableColumn[] = [
    { key: 'areaName', label: 'Área' },
    { key: 'plannedBudget', label: 'Planeado' },
    { key: 'approvedBudget', label: 'Aprobado' },
    { key: 'unplannedBudget', label: 'Sin planear' },
  ];

  chartData = computed<ChartData<'bar'>>(() => {
    const areas = this.areas();
    return {
      labels: areas.map((a) => a.areaName),
      datasets: [
        {
          data: areas.map((a) => a.plannedBudget),
          label: 'Planeado',
          backgroundColor: '#94a3b8',
          borderRadius: 4,
        },
        {
          data: areas.map((a) => a.approvedBudget),
          label: 'Aprobado',
          backgroundColor: '#ed3237',
          borderRadius: 4,
        },
        {
          data: areas.map((a) => a.unplannedBudget),
          label: 'Sin planear',
          backgroundColor: '#e5e7eb',
          borderRadius: 4,
        },
      ],
    };
  });

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service
        .findAreaBudgetSummary(null, this.year())
        .subscribe((res) => {
          this.isLoading.set(false);
          if (res.success) this.areas.set(res.data);
        });
    });
  }

  isChecked(areaId: number): boolean {
    return this.checked().has(areaId);
  }

  toggle(areaId: number): void {
    const next = new Set(this.checked());
    if (next.has(areaId)) next.delete(areaId);
    else next.add(areaId);
    this.checked.set(next);
    this.selectedAreaIds.emit(Array.from(next));
  }
}
