// pat/pages/reports/reports.component.ts
import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators
} from '@angular/forms';
import { PatApiService } from '../../../../core/services/pat-api.service';
import {
  ReportType, ReportConfig, ReportResult, AreaConsolidation
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

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly patApi = inject(PatApiService);
  private readonly fb     = inject(FormBuilder);

  readonly yearOptions = YEAR_OPTIONS;

  generating      = signal<ReportType | null>(null);
  recentReports   = signal<ReportResult[]>([]);
  error           = signal<string | null>(null);
  consolidations  = signal<AreaConsolidation[]>([]);

  reportTemplates: ReportTemplate[] = [
    {
      type:        'BOARD_SUMMARY',
      title:       'Informe Junta Directiva',
      description: 'Resumen ejecutivo de avance del PAT: metas, presupuesto e indicadores estratégicos.',
      icon:        'dashboard',
      audience:    'Junta Directiva',
      formats:     ['PDF', 'EXCEL'],
      colorClass:  'primary',
    },
    {
      type:        'SUPERSOCIEDADES',
      title:       'Reporte SuperSociedades',
      description: 'Informe estandarizado según los lineamientos de la Superintendencia de Sociedades.',
      icon:        'account_balance',
      audience:    'Ente Externo',
      formats:     ['PDF', 'EXCEL'],
      colorClass:  'danger',
    },
    {
      type:        'BUDGET_EXECUTION',
      title:       'Ejecución Presupuestal',
      description: 'Detalle de ejecución por rubro, centro de costo y plan contable.',
      icon:        'account_balance_wallet',
      audience:    'Financiero',
      formats:     ['PDF', 'EXCEL', 'CSV'],
      colorClass:  'warning',
    },
    {
      type:        'TRAINING_COMPLIANCE',
      title:       'Cumplimiento Plan Formativo',
      description: 'Porcentaje de cumplimiento de capacitaciones por empleado y área.',
      icon:        'school',
      audience:    'Recursos Humanos',
      formats:     ['PDF', 'EXCEL'],
      colorClass:  'info',
    },
    {
      type:        'AREA_CONSOLIDATION',
      title:       'Consolidado por Área',
      description: 'Resultados de desempeño e impacto estratégico consolidados por área.',
      icon:        'corporate_fare',
      audience:    'Gerencia',
      formats:     ['PDF', 'EXCEL'],
      colorClass:  'success',
    },
    {
      type:        'STRATEGIC_GOALS',
      title:       'Metas Estratégicas',
      description: 'Seguimiento detallado de metas e indicadores de desempeño.',
      icon:        'flag',
      audience:    'Dirección Estratégica',
      formats:     ['PDF', 'EXCEL', 'CSV'],
      colorClass:  'secondary',
    },
  ];

  configForm = this.fb.group({
    year:          [new Date().getFullYear(), Validators.required],
    format:        ['PDF' as 'PDF' | 'EXCEL' | 'CSV', Validators.required],
    includeCharts: [true],
    areaId:        [null as number | null],
  });

  selectedTemplate = signal<ReportTemplate | null>(null);

  ngOnInit(): void {
    this.loadRecentReports();
    this.patApi.getAreaConsolidation(new Date().getFullYear())
      .subscribe(c => this.consolidations.set(c));
  }

  loadRecentReports(): void {
    this.patApi.getRecentReports().subscribe(reports => {
      this.recentReports.set(reports);
    });
  }

  selectTemplate(template: ReportTemplate): void {
    this.selectedTemplate.set(template);
    this.error.set(null);
    // Reset format to first available
    this.configForm.patchValue({ format: template.formats[0] });
  }

  generateReport(): void {
    const template = this.selectedTemplate();
    if (!template || this.configForm.invalid) return;

    const v = this.configForm.value;
    const config: ReportConfig = {
      type:          template.type,
      year:          v.year!,
      format:        v.format!,
      includeCharts: v.includeCharts ?? true,
      areaId:        v.areaId ?? undefined,
    };

    this.generating.set(template.type);
    this.error.set(null);

    this.patApi.generateReport(config).subscribe({
      next: result => {
        this.generating.set(null);
        this.selectedTemplate.set(null);
        this.loadRecentReports();
        // Auto-download
        this.downloadReport(result);
      },
      error: err => {
        this.generating.set(null);
        this.error.set(err.error?.message ?? 'Error al generar el reporte');
      },
    });
  }

  downloadReport(report: ReportResult): void {
    const a = document.createElement('a');
    a.href     = report.downloadUrl;
    a.download = report.fileName;
    a.click();
  }

  cancelSelection(): void {
    this.selectedTemplate.set(null);
    this.error.set(null);
  }

  isGenerating(type: ReportType): boolean {
    return this.generating() === type;
  }

  getFormatIcon(format: string): string {
    const icons: Record<string, string> = {
      PDF:   'picture_as_pdf',
      EXCEL: 'table_chart',
      CSV:   'grid_on',
    };
    return icons[format] ?? 'download';
  }
}