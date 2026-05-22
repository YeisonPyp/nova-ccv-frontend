// pat/pages/training/training.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Subject, forkJoin, takeUntil, finalize } from 'rxjs';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  Training,
  TrainingParticipant,
  EmployeeTrainingStats,
  TrainingStatus,
} from '../../models/pat.models';
import {
  TRAINING_STATUS_CONFIG,
  YEAR_OPTIONS,
  getProgressColor,
} from '../../utils/pat-status.utils';
import { PatProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import {
  KpiCardComponent,
  KpiCardConfig,
} from '../../components/kpi-card/kpi-card.component';

type ViewType = 'calendar' | 'employees' | 'add';

interface StatusOption {
  value: TrainingStatus;
  label: string;
  icon: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'REGISTERED', label: 'Inscrito', icon: 'how_to_reg' },
  { value: 'IN_PROGRESS', label: 'En Curso', icon: 'play_circle' },
  { value: 'COMPLETED', label: 'Completado', icon: 'check_circle' },
  { value: 'ABSENT', label: 'No Asistió', icon: 'cancel' },
];

const TRAINING_CATEGORIES = [
  'Habilidades Técnicas',
  'Liderazgo y Gestión',
  'Normatividad y Compliance',
  'Seguridad y Salud en el Trabajo',
  'Herramientas Digitales',
  'Atención al Cliente',
  'Otros',
];

const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXT: '.pdf, .jpg, .jpeg, .png, .docx',
};

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PatProgressBarComponent,
    KpiCardComponent,
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent implements OnInit, OnDestroy {
  private readonly patApi = inject(PatApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly yearOptions = YEAR_OPTIONS;
  readonly statusConfig = TRAINING_STATUS_CONFIG;
  readonly statusOptions = STATUS_OPTIONS;
  readonly categories = TRAINING_CATEGORIES;

  // ── Estado ────────────────────────────────────────────────
  trainings = signal<Training[]>([]);
  employeeStats = signal<EmployeeTrainingStats[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);
  selectedYear = signal(new Date().getFullYear());
  activeView = signal<ViewType>('calendar');
  selectedTraining = signal<Training | null>(null);

  // ── Upload state ──────────────────────────────────────────
  uploadingFor = signal<number | null>(null);
  uploadError = signal<string | null>(null);

  // ── Create state ──────────────────────────────────────────
  submitting = signal(false);
  submitError = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // ── KPIs computados ───────────────────────────────────────
  kpis = computed<KpiCardConfig[]>(() => {
    const stats = this.employeeStats();
    if (!stats.length) return [];

    const avgPct = Math.round(
      stats.reduce((s, e) => s + e.completionPct, 0) / stats.length
    );
    const completed = stats.filter((e) => e.completionPct >= 100).length;
    const pending = stats.reduce((s, e) => s + e.pendingEvidences, 0);
    const totalH = stats.reduce((s, e) => s + e.totalHoursCompleted, 0);

    return [
      {
        title: 'Cumplimiento Promedio',
        value: `${avgPct}%`,
        icon: 'school',
        colorClass: this.getColorByPct(avgPct),
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
        subtitle: pending > 0 ? 'Por cargar' : 'Todas al día',
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

  hasTrainings = computed(() => this.trainings().length > 0);
  hasEmployeeStats = computed(() => this.employeeStats().length > 0);
  totalTrainings = computed(() => this.trainings().length);

  // ── Formulario ────────────────────────────────────────────
  trainingForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    category: ['', Validators.required],
    scheduledDate: ['', Validators.required],
    durationHours: [1, [Validators.required, Validators.min(1)]],
    provider: [''],
  });

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Tecla ESC cierra el modal ─────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedTraining()) {
      this.closeDetail();
    }
  }

  // ── Carga ─────────────────────────────────────────────────
  loadData(): void {
    this.loading.set(true);
    this.loadError.set(null);
    const year = this.selectedYear();

    forkJoin({
      trainings: this.patApi.getTrainings(year),
      stats: this.patApi.getEmployeeTrainingStats(year),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ trainings, stats }) => {
          this.trainings.set(trainings);
          this.employeeStats.set(stats);
        },
        error: (err) => {
          this.loadError.set(
            err.error?.message ?? 'Error al cargar las capacitaciones'
          );
        },
      });
  }

  changeYear(year: number): void {
    this.selectedYear.set(year);
    this.loadData();
  }

  // ── Vistas ────────────────────────────────────────────────
  setView(view: ViewType): void {
    this.activeView.set(view);
    this.clearMessages();
  }

  // ── Detalle ───────────────────────────────────────────────
  selectTraining(training: Training): void {
    this.selectedTraining.set(training);
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedTraining.set(null);
    document.body.style.overflow = '';
  }

  // ── Estado participante ───────────────────────────────────
  updateParticipantStatus(
    participantId: number,
    status: TrainingStatus
  ): void {
    this.patApi
      .updateParticipantStatus(participantId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshAfterUpdate();
          this.showSuccess('Estado actualizado correctamente');
        },
        error: (err) => {
          this.uploadError.set(
            err.error?.message ?? 'Error al actualizar el estado'
          );
        },
      });
  }

  // ── Upload evidencia ──────────────────────────────────────
  onFileSelected(event: Event, participant: TrainingParticipant): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permitir re-seleccionar mismo archivo
    if (!file) return;

    if (!FILE_VALIDATION.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError.set(
        'Formato no permitido. Use PDF, JPG, PNG o DOCX.'
      );
      return;
    }

    if (file.size > FILE_VALIDATION.MAX_SIZE) {
      this.uploadError.set(
        `El archivo supera el límite de ${this.formatFileSize(FILE_VALIDATION.MAX_SIZE)}.`
      );
      return;
    }

    this.uploadError.set(null);
    this.uploadingFor.set(participant.id);

    this.patApi
      .uploadTrainingEvidence({
        participantId: participant.id,
        file,
        completionDate: new Date().toISOString().split('T')[0],
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.uploadingFor.set(null))
      )
      .subscribe({
        next: () => {
          this.refreshAfterUpdate();
          this.showSuccess(`Evidencia "${file.name}" cargada exitosamente`);
        },
        error: (err) => {
          this.uploadError.set(
            err.error?.message ?? 'Error al cargar la evidencia'
          );
        },
      });
  }

  // ── Crear capacitación ────────────────────────────────────
  submitTraining(): void {
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    this.patApi
      .createTraining({
        ...this.trainingForm.value,
        year: this.selectedYear(),
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: () => {
          this.trainingForm.reset({ durationHours: 1 });
          this.setView('calendar');
          this.loadData();
          this.showSuccess('Capacitación registrada exitosamente');
        },
        error: (err) => {
          this.submitError.set(
            err.error?.message ?? 'Error al crear la capacitación'
          );
        },
      });
  }

  cancelForm(): void {
    this.trainingForm.reset({ durationHours: 1 });
    this.setView('calendar');
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.trainingForm.get(field);
    return !!(ctrl?.touched && ctrl?.invalid);
  }

  // ── TrackBy ───────────────────────────────────────────────
  trackByTrainingId(_: number, t: Training): number {
    return t.id;
  }

  trackByParticipantId(_: number, p: TrainingParticipant): number {
    return p.id;
  }

  trackByEmployeeId(_: number, e: EmployeeTrainingStats): number {
    return e.employeeId;
  }

  trackByStatusValue(_: number, opt: StatusOption): string {
    return opt.value;
  }

  // ── Utilidades ────────────────────────────────────────────
  getStatusLabel(status: TrainingStatus): string {
    return TRAINING_STATUS_CONFIG[status]?.label ?? status;
  }

  getStatusClass(status: TrainingStatus): string {
    return TRAINING_STATUS_CONFIG[status]?.cssClass ?? '';
  }

  getProgressColor(pct: number): string {
    return getProgressColor(pct);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getCompletionRowClass(pct: number): string {
    if (pct >= 100) return 'trn-row--complete';
    if (pct >= 50) return 'trn-row--warning';
    return 'trn-row--danger';
  }

  isTrainingPast(date: string): boolean {
    return new Date(date) < new Date();
  }

  // ── Privados ──────────────────────────────────────────────
  private getColorByPct(pct: number): 'success' | 'warning' | 'danger' {
    if (pct >= 80) return 'success';
    if (pct >= 50) return 'warning';
    return 'danger';
  }

  private formatFileSize(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  private refreshAfterUpdate(): void {
    // Recargar y mantener el modal abierto con datos frescos
    const currentId = this.selectedTraining()?.id;
    this.loadData();

    if (currentId) {
      // Esperar a que se recarguen los datos para actualizar el modal
      setTimeout(() => {
        const updated = this.trainings().find((t) => t.id === currentId);
        if (updated) this.selectedTraining.set(updated);
      }, 600);
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  private clearMessages(): void {
    this.uploadError.set(null);
    this.submitError.set(null);
    this.successMessage.set(null);
  }
}