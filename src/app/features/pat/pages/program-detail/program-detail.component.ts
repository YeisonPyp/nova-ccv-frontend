import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  Program,
  ActivityWithMetrics,
  BudgetItem,
  ScheduleRow,
  MonthlyExecution
} from '../../models/pat.models';
import { MONTHS_NAMES } from '../../../../core/data/pat-mock-data';

type TabType = 'info' | 'activities' | 'budget' | 'schedule' | 'execution';

@Component({
  selector: 'app-program-detail',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './program-detail.component.html',
  styleUrl: './program-detail.component.scss'
})
export class ProgramDetailComponent implements OnInit {
  programId = signal<number>(0);
  program = signal<Program | null>(null);
  activities = signal<ActivityWithMetrics[]>([]);
  budgetItems = signal<BudgetItem[]>([]);
  schedule = signal<ScheduleRow[]>([]);
  loading = signal(true);
  activeTab = signal<TabType>('info');

  // Execution Form
  executionForm: FormGroup;
  submitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  currentMonth = new Date().getMonth() + 1;
  availableMonths = MONTHS_NAMES.map((name, idx) => ({
    value: idx + 1,
    label: name
  })).filter(m => m.value <= this.currentMonth);

  // Computed metrics
  totalMeta = computed(() =>
    this.activities().reduce((sum, a) => sum + a.metaTotal, 0)
  );

  totalMetaEjecutada = computed(() =>
    this.activities().reduce((sum, a) => sum + a.metaEjecutada, 0)
  );

  metaProgress = computed(() => {
    const total = this.totalMeta();
    return total > 0 ? Math.round((this.totalMetaEjecutada() / total) * 100) : 0;
  });

  totalBudgetPlanned = computed(() =>
    this.budgetItems().reduce((sum, b) => sum + b.planeado, 0)
  );

  totalBudgetExecuted = computed(() =>
    this.budgetItems().reduce((sum, b) => sum + b.ejecutado, 0)
  );

  budgetProgress = computed(() => {
    const total = this.totalBudgetPlanned();
    return total > 0 ? Math.round((this.totalBudgetExecuted() / total) * 100) : 0;
  });

  budgetAvailable = computed(() =>
    this.totalBudgetPlanned() - this.totalBudgetExecuted()
  );

  constructor(
    private route: ActivatedRoute,
    private patApi: PatApiService,
    private fb: FormBuilder
  ) {
    this.executionForm = this.fb.group({
      activityId: ['', Validators.required],
      mes: ['', Validators.required],
      metaEjecutada: ['', [Validators.required, Validators.min(1)]],
      valorEjecutado: ['', [Validators.required, Validators.min(1)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.programId.set(id);
      this.loadProgram(id);
    });
  }

  loadProgram(id: number): void {
    this.loading.set(true);

    this.patApi.getProgramById(id).subscribe(program => {
      this.program.set(program || null);

      if (program) {
        this.patApi.getActivitiesWithMetrics(id).subscribe(activities => {
          this.activities.set(activities);
        });

        this.patApi.getBudgetByProgram(id).subscribe(budget => {
          this.budgetItems.set(budget);
        });

        this.patApi.getScheduleByProgram(id).subscribe(schedule => {
          this.schedule.set(schedule);
          this.loading.set(false);
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  setTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.submitError.set(null);
    this.submitSuccess.set(false);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'BORRADOR': 'Borrador',
      'APROBADO': 'Aprobado',
      'EJECUCION': 'En Ejecución',
      'CERRADO': 'Cerrado'
    };
    return labels[status] || status;
  }

  getBudgetPct(item: BudgetItem): number {
    return item.planeado > 0 ? Math.round((item.ejecutado / item.planeado) * 100) : 0;
  }

  getMonthStatus(row: ScheduleRow): string {
    if (row.metaPlaneada === 0) return 'pending';
    const pct = row.metaPlaneada > 0 ? (row.metaEjecutada / row.metaPlaneada) * 100 : 0;
    if (pct >= 100) return 'completed';
    if (pct >= 50) return 'partial';
    return 'delayed';
  }

  getMonthStatusLabel(row: ScheduleRow): string {
    const status = this.getMonthStatus(row);
    const labels: Record<string, string> = {
      'completed': 'Completado',
      'partial': 'Parcial',
      'delayed': 'Retrasado',
      'pending': 'Sin plan'
    };
    return labels[status];
  }

  submitExecution(): void {
    if (this.executionForm.invalid) return;

    this.submitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    const formValue = this.executionForm.value;

    this.patApi.createExecution({
      activityId: +formValue.activityId,
      mes: +formValue.mes,
      metaEjecutada: +formValue.metaEjecutada,
      valorEjecutado: +formValue.valorEjecutado,
      observaciones: formValue.observaciones
    }).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.submitting.set(false);
        this.resetForm();
        // Reload data
        this.loadProgram(this.programId());
      },
      error: (err) => {
        this.submitError.set(err.message);
        this.submitting.set(false);
      }
    });
  }

  resetForm(): void {
    this.executionForm.reset();
  }
}