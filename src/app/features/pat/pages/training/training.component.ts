// pat/pages/training/training.component.ts
import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators, FormGroup
} from '@angular/forms';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  Training, TrainingParticipant, EmployeeTrainingStats, TrainingStatus
} from '../../models/pat.models';
import {
  TRAINING_STATUS_CONFIG, YEAR_OPTIONS, getProgressColor
} from '../../utils/pat-status.utils';
import { PatProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { KpiCardComponent, KpiCardConfig } from '../../components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    PatProgressBarComponent, KpiCardComponent,
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent implements OnInit {
  private readonly patApi = inject(PatApiService);
  private readonly fb     = inject(FormBuilder);

  readonly yearOptions = YEAR_OPTIONS;
  readonly statusConfig = TRAINING_STATUS_CONFIG;

  // ── Estado ────────────────────────────────────────────────
  trainings       = signal<Training[]>([]);
  employeeStats   = signal<EmployeeTrainingStats[]>([]);
  loading         = signal(true);
  selectedYear    = signal(new Date().getFullYear());
  activeView      = signal<'calendar' | 'employees' | 'add'>('calendar');
  selectedTraining = signal<Training | null>(null);
  uploadingFor    = signal<number | null>(null); // participantId
  uploadError     = signal<string | null>(null);
  submitting      = signal(false);

  // ── KPIs ─────────────────────────────────────────────────
  kpis = computed<KpiCardConfig[]>(() => {
    const stats = this.employeeStats();
    if (!stats.length) return [];

    const avgPct = Math.round(
      stats.reduce((s, e) => s + e.completionPct, 0) / stats.length
    );
    const completed = stats.filter(e => e.completionPct >= 100).length;
    const pending   = stats.reduce((s, e) => s + e.pendingEvidences, 0);
    const totalH    = stats.reduce((s, e) => s + e.totalHoursCompleted, 0);

    return [
      {
        title: 'Cumplimiento Promedio',
        value: `${avgPct}%`,
        icon: 'school',
        colorClass: avgPct >= 80 ? 'success' : avgPct >= 50 ? 'warning' : 'danger',
        subtitle: 'Plan formativo del período',
      },
      {
        title: 'Empleados al 100%',
        value: completed,
        icon: 'how_to_reg',
        colorClass: 'success',
        subtitle: `de ${stats.length} empleados`,
      },
      {
        title: 'Evidencias Pendientes',
        value: pending,
        icon: 'attach_file',
        colorClass: pending > 0 ? 'warning' : 'success',
        subtitle: 'Por cargar',
      },
      {
        title: 'Horas Completadas',
        value: totalH,
        icon: 'timer',
        colorClass: 'info',
        subtitle: 'Período actual',
      },
    ];
  });

  // ── Formulario nueva capacitación ─────────────────────────
  trainingForm: FormGroup = this.fb.group({
    name:          ['', [Validators.required, Validators.maxLength(200)]],
    category:      ['', Validators.required],
    scheduledDate: ['', Validators.required],
    durationHours: [1, [Validators.required, Validators.min(1)]],
    provider:      [''],
  });

  statusOptions: { value: TrainingStatus; label: string }[] = [
    { value: 'REGISTERED',  label: 'Inscrito'   },
    { value: 'IN_PROGRESS', label: 'En Curso'   },
    { value: 'COMPLETED',   label: 'Completado' },
    { value: 'ABSENT',      label: 'No Asistió' },
  ];

  categories = [
    'Habilidades Técnicas',
    'Liderazgo y Gestión',
    'Normatividad y Compliance',
    'Seguridad y Salud en el Trabajo',
    'Herramientas Digitales',
    'Atención al Cliente',
    'Otros',
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const year = this.selectedYear();

    this.patApi.getTrainings(year).subscribe(t => {
      this.trainings.set(t);
    });

    this.patApi.getEmployeeTrainingStats(year).subscribe(stats => {
      this.employeeStats.set(stats);
      this.loading.set(false);
    });
  }

  selectTraining(training: Training): void {
    this.selectedTraining.set(training);
  }

  closeDetail(): void {
    this.selectedTraining.set(null);
  }

  // ── Actualizar estado participante ────────────────────────
  updateParticipantStatus(
    participantId: number,
    status: TrainingStatus,
  ): void {
    this.patApi.updateParticipantStatus(participantId, status).subscribe(() => {
      this.loadData();
      if (this.selectedTraining()) {
        // Refresh selected training
        const updated = this.trainings().find(
          t => t.id === this.selectedTraining()!.id
        );
        if (updated) this.selectedTraining.set(updated);
      }
    });
  }

  // ── Upload evidencia ──────────────────────────────────────
  onFileSelected(event: Event, participant: TrainingParticipant): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED  = ['application/pdf', 'image/jpeg', 'image/png',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!ALLOWED.includes(file.type)) {
      this.uploadError.set('Formato no permitido. Use PDF, JPG, PNG o DOCX.');
      return;
    }
    if (file.size > MAX_SIZE) {
      this.uploadError.set('El archivo supera el límite de 10 MB.');
      return;
    }

    this.uploadError.set(null);
    this.uploadingFor.set(participant.id);

    this.patApi.uploadTrainingEvidence({
      participantId: participant.id,
      file,
      completionDate: new Date().toISOString().split('T')[0],
    }).subscribe({
      next: () => {
        this.uploadingFor.set(null);
        this.loadData();
      },
      error: err => {
        this.uploadError.set(err.error?.message ?? 'Error al cargar evidencia');
        this.uploadingFor.set(null);
      },
    });
  }

  // ── Crear nueva capacitación ──────────────────────────────
  submitTraining(): void {
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    this.patApi.createTraining({
      ...this.trainingForm.value,
      year: this.selectedYear(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.activeView.set('calendar');
        this.trainingForm.reset({ durationHours: 1 });
        this.loadData();
      },
      error: err => {
        this.submitting.set(false);
        this.uploadError.set(err.error?.message ?? 'Error al crear capacitación');
      },
    });
  }

  getStatusLabel(status: TrainingStatus): string {
    return TRAINING_STATUS_CONFIG[status]?.label ?? status;
  }

  getStatusClass(status: TrainingStatus): string {
    return TRAINING_STATUS_CONFIG[status]?.cssClass ?? '';
  }

  getProgressColor(pct: number): string {
    return getProgressColor(pct);
  }

  changeYear(year: number): void {
    this.selectedYear.set(year);
    this.loadData();
  }
}