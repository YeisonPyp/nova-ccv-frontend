import {
  Component,
  input,
  effect,
  inject,
  signal,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  PatPerformanceKpiService,
  PatPerformanceKpiResponse,
} from "@/app/core/services/pat/pat-performance-kpi.service";
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from "ng2-charts";
import { Chart, registerables, ChartConfiguration, ChartData } from "chart.js";

Chart.register(...registerables);

@Component({
  selector: "app-performance-indicators-panel",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: "./performance-indicators-panel.component.html",
  styleUrl: "./performance-indicators-panel.component.scss",
})
export class PerformanceIndicatorsPanelComponent implements OnInit {
  year = input.required<number>();
  private readonly service = inject(PatPerformanceKpiService);

  loading = signal(true);

  // Data sets
  executionTrendData: ChartData<"line"> = { datasets: [], labels: [] };
  executionTrendOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: "Tendencia de Ejecución del Plan (%)",
        font: { size: 16 },
      },
    },
    scales: {
      y: { min: 0, max: 100, title: { display: true, text: "Porcentaje (%)" } },
    },
  };

  areaPerformanceData: ChartData<"bar"> = { datasets: [], labels: [] };
  areaPerformanceOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Desempeño por Área (%)",
        font: { size: 16 },
      },
    },
    scales: {
      y: { min: 0, max: 100, title: { display: true, text: "Desempeño (%)" } },
    },
  };

  budgetTrendData: ChartData<"line"> = { datasets: [], labels: [] };
  budgetTrendOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: "Presupuesto Planeado vs Ejecutado ($)",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Monto ($)" },
        ticks: { callback: (value) => "$" + Number(value).toLocaleString() },
      },
    },
  };

  constructor() {
    effect(() => {
      const year = this.year();
      this.loadData(year);
    });
  }

  ngOnInit() {
    // If input is not set right away, it will trigger via effect.
  }

  private loadData(year: number) {
    this.loading.set(true);
    this.service.getPerformanceByYear(year).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.buildCharts(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildCharts(data: PatPerformanceKpiResponse) {
    const monthLabels = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // 1. Line Chart: Execution Trend (%)
    const mapPercentage = (planned: number, executed: number) => {
      if (!planned) return 0;
      return Number(((executed / planned) * 100).toFixed(2));
    };

    const sortedMonthly = Array.from({ length: 12 }, (_, i) => i + 1).map(
      (m) => {
        const found = data.monthlyKpis.find((k) => k.month === m);
        return (
          found || {
            month: m,
            year: 0,
            plannedBudget: 0,
            executedBudget: 0,
            plannedMeasurement: 0,
            executedMeasurement: 0,
            plannedIndicator: 0,
            executedIndicator: 0,
            plannedBenefit: 0,
            executedBenefit: 0,
          }
        );
      },
    );

    const budgetPercents = sortedMonthly.map((m) =>
      mapPercentage(m.plannedBudget, m.executedBudget),
    );
    const measurementPercents = sortedMonthly.map((m) =>
      mapPercentage(m.plannedMeasurement, m.executedMeasurement),
    );
    const indicatorPercents = sortedMonthly.map((m) =>
      mapPercentage(m.plannedIndicator, m.executedIndicator),
    );
    const benefitPercents = sortedMonthly.map((m) =>
      mapPercentage(m.plannedBenefit, m.executedBenefit),
    );

    this.executionTrendData = {
      labels: monthLabels,
      datasets: [
        {
          data: budgetPercents,
          label: "Presupuesto",
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
          fill: false,
          tension: 0.1,
        },
        {
          data: measurementPercents,
          label: "Indice de medida",
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          fill: false,
          tension: 0.1,
        },
        {
          data: indicatorPercents,
          label: "Indicador de Gestión",
          borderColor: "#f59e0b",
          backgroundColor: "#f59e0b",
          fill: false,
          tension: 0.1,
        },
        {
          data: benefitPercents,
          label: "Beneficiarios",
          borderColor: "#8b5cf6",
          backgroundColor: "#8b5cf6",
          fill: false,
          tension: 0.1,
        },
      ],
    };

    // 2. Bar Chart: Area Performance
    const areaLabels = data.areaPerformances.map(
      (a) => a.area?.name || "Desconocida",
    );
    const areaData = data.areaPerformances.map((a) =>
      mapPercentage(a.plannedGoal, a.executedGoal),
    );

    this.areaPerformanceData = {
      labels: areaLabels,
      datasets: [
        {
          data: areaData,
          label: "Desempeño",
          backgroundColor: "#4f46e5",
          borderRadius: 4,
        },
      ],
    };

    // 3. Line Chart: Budget ($)
    const plannedBudgets = sortedMonthly.map((m) => m.plannedBudget);
    const executedBudgets = sortedMonthly.map((m) => m.executedBudget);

    this.budgetTrendData = {
      labels: monthLabels,
      datasets: [
        {
          data: plannedBudgets,
          label: "Presupuesto Planeado",
          borderColor: "#94a3b8",
          backgroundColor: "#94a3b8",
          fill: false,
          tension: 0.1,
          borderDash: [5, 5],
        },
        {
          data: executedBudgets,
          label: "Presupuesto Ejecutado",
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          fill: false,
          tension: 0.1,
        },
      ],
    };
  }
}
