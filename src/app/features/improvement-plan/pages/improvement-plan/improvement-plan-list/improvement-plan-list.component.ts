import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  provideCharts,
  withDefaultRegisterables,
  BaseChartDirective,
} from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { ImprovementPlanService } from '@/app/core/services/improvement-plan/improvement-plan.service';
import { ControlEntityService } from '@/app/core/services/improvement-plan/control-entity.service';
import { ImprovementProcessService } from '@/app/core/services/improvement-plan/improvement-process.service';
import {
  ImprovementPlan,
  ImprovementPlanFilters,
  actionEffectiveStatusLabels,
} from '@/app/core/models/improvement-plan/improvement-plan.model';
import { ControlEntity } from '@/app/core/models/improvement-plan/control-entity.model';
import { ImprovementProcess } from '@/app/core/models/improvement-plan/improvement-process.model';
import { ImprovementPlanMetricsCardsComponent } from '../components/improvement-plan-metrics-cards/improvement-plan-metrics-cards.component';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';
import { ImprovementProcessModalComponent } from './components/improvement-process-modal/improvement-process-modal.component';
import { GenerateReportModalComponent } from './components/generate-report-modal/generate-report-modal.component';
import { EditIconComponent } from '@/app/shared/components/edit-icon/edit-icon.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

Chart.register(...registerables);

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  RUNNING: 'En ejecución',
  COMPLETED: 'Completada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#94a3b8',
  RUNNING: '#3b82f6',
  COMPLETED: '#22c55e',
  OVERDUE: '#ed3237',
  CANCELLED: '#6b7280',
};

@Component({
  selector: 'app-improvement-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorComponent,
    ImprovementPlanMetricsCardsComponent,
    HasPermissionDirective,
    BaseChartDirective,
    ImprovementProcessModalComponent,
    GenerateReportModalComponent,
    EditIconComponent,
    LoadingSpinnerComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './improvement-plan-list.component.html',
  styleUrls: ['./improvement-plan-list.component.scss'],
})
export class ImprovementPlanListComponent implements OnInit {
  private improvementPlanService = inject(ImprovementPlanService);
  private controlEntityService = inject(ControlEntityService);
  private processService = inject(ImprovementProcessService);
  private readonly router = inject(Router);

  year = signal<number>(new Date().getFullYear());

  readonly statusOptions = Object.entries(actionEffectiveStatusLabels);

  plans = signal<ImprovementPlan[]>([]);
  processes = signal<ImprovementProcess[]>([]);
  controlEntities = signal<ControlEntity[]>([]);

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(10);

  loading = signal(false);
  error = signal<string | null>(null);

  filterProcessId = signal<number | null>(null);
  filterControlEntityId = signal<number | null>(null);
  filterStatus = signal<string | null>(null);

  createProcessModalOpen = signal(false);
  reportModalOpen = signal(false);

  currentFilters = computed<ImprovementPlanFilters>(() => {
    return {
      processId: this.filterProcessId() ?? undefined,
      controlEntityId: this.filterControlEntityId() ?? undefined,
      status: this.filterStatus() ?? undefined,
      year: this.year(),
    };
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      this.loading.set(true);
      this.improvementPlanService
        .findElements(
          page - 1,
          this.pageSize(),
          undefined,
          this.currentFilters(),
        )
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.plans.set(response.data.content);
              this.currentPage.set(response.data.pageable.pageNumber + 1);
              this.totalPages.set(Math.max(1, response.data.totalPages));
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error loading improvement plans');
            this.loading.set(false);
            console.error(err);
          },
        });
    });
  }

  ngOnInit(): void {
    this.loadProcesses();
    this.loadControlEntities();
  }

  private loadProcesses(): void {
    this.processService.findAllList().subscribe((res) => {
      if (res.success && res.data) this.processes.set(res.data);
    });
  }

  private loadControlEntities(): void {
    this.controlEntityService.findAll().subscribe((res) => {
      if (res.success && res.data) this.controlEntities.set(res.data);
    });
  }

  onFiltersChange(): void {
    // this.loadPlans(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
  }

  openPlan(plan?: ImprovementPlan): void {
    if (plan) {
      this.router.navigate(['/improvement-plan', plan.id]);
    } else {
      this.router.navigate(['/improvement-plan/create']);
    }
  }

  hasActions(plan: ImprovementPlan): boolean {
    return (plan.actionStatusCounts?.length ?? 0) > 0;
  }

  chartData(plan: ImprovementPlan): ChartData<'doughnut'> {
    const rows = plan.actionStatusCounts ?? [];
    return {
      labels: rows.map((r) => STATUS_LABELS[r.status] ?? r.status),
      datasets: [
        {
          data: rows.map((r) => r.count),
          backgroundColor: rows.map(
            (r) => STATUS_COLORS[r.status] ?? '#d1d5db',
          ),
          borderWidth: 0,
        },
      ],
    };
  }

  readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 10 } },
      },
    },
  };

  onYearChange(y: any) {
    this.year.set(y);
  }

  onProcessCreated(process: ImprovementProcess): void {
    this.processes.update((list) => [...list, process]);
  }
}
