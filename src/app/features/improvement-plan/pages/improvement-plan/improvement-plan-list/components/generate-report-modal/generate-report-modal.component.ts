import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReportTemplateService } from "@/app/core/services/reports/report-template.service";
import { ReportService } from "@/app/core/services/reports/report.service";
import { Report } from "@/app/core/models/reports/report.model";
import { ImprovementProcess } from "@/app/core/models/improvement-plan/improvement-process.model";
import { ControlEntity } from "@/app/core/models/improvement-plan/control-entity.model";
import { actionEffectiveStatusLabels } from "@/app/core/models/improvement-plan/improvement-plan.model";
import { FileItemComponent } from "@/app/shared/components/file-item/file-item.component";

const REPORT_TEMPLATE_NAME = "Informe de Planes de Mejoramiento";

@Component({
  selector: "app-generate-report-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, FileItemComponent],
  templateUrl: "./generate-report-modal.component.html",
})
export class GenerateReportModalComponent implements OnChanges {
  private readonly reportTemplateService = inject(ReportTemplateService);
  private readonly reportService = inject(ReportService);

  @Input() isOpen = false;
  @Input() processes: ImprovementProcess[] = [];
  @Input() controlEntities: ControlEntity[] = [];
  @Input() year!: number;
  @Output() close = new EventEmitter<void>();

  readonly statusOptions = Object.entries(actionEffectiveStatusLabels);

  filterProcessId = signal<number | null>(null);
  filterControlEntityId = signal<number | null>(null);
  filterStatus = signal<string | null>(null);
  filterYear = signal<number | null>(null);

  generating = signal(false);
  error = signal<string | null>(null);
  generatedReport = signal<Report | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"]?.currentValue) {
      this.filterProcessId.set(null);
      this.filterControlEntityId.set(null);
      this.filterStatus.set(null);
      this.filterYear.set(this.year ?? null);
      this.generatedReport.set(null);
      this.error.set(null);
    }
  }

  onGenerate(): void {
    this.generating.set(true);
    this.error.set(null);

    this.reportTemplateService
      .findAll({
        page: 0,
        size: 1,
        rsqlQuery: `name=='${REPORT_TEMPLATE_NAME}'`,
      })
      .subscribe({
        next: (res) => {
          const template = res.data?.content?.[0];
          if (!template) {
            this.error.set("No se encontró la plantilla del informe");
            this.generating.set(false);
            return;
          }

          const vars = {
            processId: (this.filterProcessId() ?? -1).toString(),
            controlEntityId: (this.filterControlEntityId() ?? -1).toString(),
            status: this.filterStatus() ?? "ALL",
            year: (this.filterYear() ?? -1).toString(),
          };

          this.reportService
            .create({
              reportName: `${REPORT_TEMPLATE_NAME} ${new Date().toISOString()}`,
              templateId: template.id,
              vars,
            })
            .subscribe({
              next: (createRes) => {
                this.generating.set(false);
                if (createRes.success && createRes.data) {
                  this.generatedReport.set(createRes.data);
                } else {
                  this.error.set("No se pudo generar el informe");
                }
              },
              error: () => {
                this.generating.set(false);
                this.error.set("No se pudo generar el informe");
              },
            });
        },
        error: () => {
          this.generating.set(false);
          this.error.set("No se encontró la plantilla del informe");
        },
      });
  }

  onClose(): void {
    this.close.emit();
  }
}
