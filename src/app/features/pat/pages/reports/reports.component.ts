// pat/pages/reports/reports.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, forkJoin, takeUntil, finalize } from 'rxjs';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  ReportType,
  ReportConfig,
  ReportResult,
  AreaConsolidation,
} from '../../models/pat.models';
import { YEAR_OPTIONS } from '../../utils/pat-status.utils';

interface ReportTemplate {
  type: ReportType;
  title: string;
  description: string;
  icon: string;
  audience: string;
  formats: Array<'PDF' | 'EXCEL' | 'CSV'>;
  colorClass: string;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  BOARD_SUMMARY: 'Informe Junta Directiva',
  SUPERSOCIEDADES: 'Reporte SuperSociedades',
  BUDGET_EXECUTION: 'Ejecución Presupuestal',
  TRAINING_COMPLIANCE: 'Cumplimiento Plan Formativo',
  AREA_CONSOLIDATION: 'Consolidado por Área',
  STRATEGIC_GOALS: 'Metas Estratégicas',
};

const FORMAT_ICONS: Record<string, string> = {
  PDF: '',
  EXCEL: '',
  CSV: '',
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly patApi = inject(PatApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly yearOptions = YEAR_OPTIONS;

  // ── Estado reactivo ───────────────────────────────────────
  generating = signal<ReportType | null>(null);
  recentReports = signal<ReportResult[]>([]);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  consolidations = signal<AreaConsolidation[]>([]);
  loadingInitial = signal(true);
  loadingRecent = signal(false);
  selectedTemplate = signal<ReportTemplate | null>(null);

  readonly reportTemplates: ReportTemplate[] = [
    {
      type: 'BOARD_SUMMARY',
      title: 'Informe Junta Directiva',
      description:
        'Resumen ejecutivo de avance del PAT: metas, presupuesto e indicadores estratégicos.',
      icon: '📊',
      audience: 'Junta Directiva',
      formats: ['PDF', 'EXCEL'],
      colorClass: 'primary',
    },
    {
      type: 'SUPERSOCIEDADES',
      title: 'Reporte SuperSociedades',
      description:
        'Informe estandarizado según los lineamientos de la Superintendencia de Sociedades.',
      icon: '📊',
      audience: 'Ente Externo',
      formats: ['PDF', 'EXCEL'],
      colorClass: 'danger',
    },
    {
      type: 'BUDGET_EXECUTION',
      title: 'Ejecución Presupuestal',
      description:
        'Detalle de ejecución por rubro, centro de costo y plan contable.',
      icon: '📊',
      audience: 'Financiero',
      formats: ['PDF', 'EXCEL', 'CSV'],
      colorClass: 'warning',
    },
    {
      type: 'TRAINING_COMPLIANCE',
      title: 'Cumplimiento Plan Formativo',
      description:
        'Porcentaje de cumplimiento de capacitaciones por empleado y área.',
      icon: '📊',
      audience: 'Recursos Humanos',
      formats: ['PDF', 'EXCEL'],
      colorClass: 'info',
    },
    {
      type: 'AREA_CONSOLIDATION',
      title: 'Consolidado por Área',
      description:
        'Resultados de desempeño e impacto estratégico consolidados por área.',
      icon: '📊',
      audience: 'Gerencia',
      formats: ['PDF', 'EXCEL'],
      colorClass: 'success',
    },
    {
      type: 'STRATEGIC_GOALS',
      title: 'Metas Estratégicas',
      description:
        'Seguimiento detallado de metas e indicadores de desempeño.',
      icon: '📊',
      audience: 'Dirección Estratégica',
      formats: ['PDF', 'EXCEL', 'CSV'],
      colorClass: 'secondary',
    },
  ];

  configForm = this.fb.group({
    year: [new Date().getFullYear(), Validators.required],
    format: ['PDF' as 'PDF' | 'EXCEL' | 'CSV', Validators.required],
    includeCharts: [true],
    areaId: [null as number | null],
  });

  // ── Computed ──────────────────────────────────────────────
  hasRecentReports = computed(() => this.recentReports().length > 0);

  isConfigView = computed(() => this.selectedTemplate() !== null);

  canGenerate = computed(
    () => this.generating() === null && this.configForm.valid
  );

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga de datos ────────────────────────────────────────
  private loadInitialData(): void {
    this.loadingInitial.set(true);

    forkJoin({
      reports: this.patApi.getRecentReports(),
      areas: this.patApi.getAreaConsolidation(new Date().getFullYear()),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingInitial.set(false))
      )
      .subscribe({
        next: ({ reports, areas }) => {
          this.recentReports.set(reports);
          this.consolidations.set(areas);
        },
        error: () => {
          this.error.set('Error al cargar datos iniciales');
        },
      });
  }

  loadRecentReports(): void {
    this.loadingRecent.set(true);

    this.patApi
      .getRecentReports()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingRecent.set(false))
      )
      .subscribe({
        next: (reports) => this.recentReports.set(reports),
        error: () =>
          this.error.set('Error al cargar reportes recientes'),
      });
  }

  // ── Selección de template ─────────────────────────────────
  selectTemplate(template: ReportTemplate): void {
    this.selectedTemplate.set(template);
    this.clearMessages();
    this.configForm.patchValue({
      format: template.formats[0],
      areaId: null,
      includeCharts: true,
    });
  }

  cancelSelection(): void {
    this.selectedTemplate.set(null);
    this.clearMessages();
  }

  // ── Generación ────────────────────────────────────────────
  generateReport(): void {
    const template = this.selectedTemplate();
    if (!template || this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    const v = this.configForm.value;
    const config: ReportConfig = {
      type: template.type,
      year: v.year!,
      format: v.format!,
      includeCharts: v.includeCharts ?? true,
      areaId: v.areaId ?? undefined,
    };

    this.generating.set(template.type);
    this.clearMessages();

    this.patApi
      .generateReport(config)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.generating.set(null))
      )
      .subscribe({
        next: (result) => {
          this.selectedTemplate.set(null);
          this.successMessage.set(
            `Reporte "${template.title}" generado exitosamente`
          );
          this.loadRecentReports();
          this.downloadReport(result);

          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => {
          this.error.set(
            err.error?.message ?? 'Error al generar el reporte'
          );
        },
      });
  }

  // ── Descarga ──────────────────────────────────────────────
  downloadReport(report: ReportResult): void {
    const anchor = document.createElement('a');
    anchor.href = report.downloadUrl;
    anchor.download = report.fileName;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  // ── Utilidades ────────────────────────────────────────────
  isGenerating(type: ReportType): boolean {
    return this.generating() === type;
  }

  getFormatIcon(format: string): string {
    return FORMAT_ICONS[format] ?? 'download';
  }

  getReportTypeLabel(type: string): string {
    return REPORT_TYPE_LABELS[type as ReportType] ?? type;
  }

  getFormatColorClass(format: string): string {
    const map: Record<string, string> = {
      PDF: 'pdf',
      EXCEL: 'excel',
      CSV: 'csv',
    };
    return map[format] ?? '';
  }

  trackByType(_: number, tpl: ReportTemplate): string {
    return tpl.type;
  }

  trackByReportId(_: number, report: ReportResult): string {
    return report.id;
  }

  private clearMessages(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}