import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AssessmentComponentReport,
  AssessmentComponentReportSupport,
} from '@/app/core/models/assessment/assessment.model';
import { AssessmentComponentRequirement } from '@/app/core/models/assessment/position.model';
import {
  AssessmentComponentReportService,
  AssessmentComponentReportSupportFileService,
  AssessmentComponentReportSupportService,
} from '@/app/core/services/assessment/assessment-component-report.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { FileItemComponent } from '@/app/shared/components/file-item/file-item.component';

@Component({
  selector: 'app-obligations',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FileItemComponent],
  templateUrl: './obligations.component.html',
})
export class ObligationsComponent implements OnInit {
  private readonly reportService = inject(AssessmentComponentReportService);
  private readonly supportService = inject(
    AssessmentComponentReportSupportService,
  );
  private readonly fileService = inject(
    AssessmentComponentReportSupportFileService,
  );

  isLoading = signal(false);
  reports = signal<AssessmentComponentReport[]>([]);
  uploadingKey = signal<string | null>(null);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.reportService.findMy().subscribe({
      next: (res) => {
        this.reports.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isOverdue(report: AssessmentComponentReport): boolean {
    const dueDate = report.component?.dueDate;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  supportsFor(
    report: AssessmentComponentReport,
    requirement: AssessmentComponentRequirement,
  ): AssessmentComponentReportSupport[] {
    return (report.supports ?? []).filter(
      (s) => s.requirementId === requirement.id,
    );
  }

  uploadKey(reportId: number, requirementId: number): string {
    return `${reportId}-${requirementId}`;
  }

  onUploadFile(
    report: AssessmentComponentReport,
    requirement: AssessmentComponentRequirement,
    file: File,
  ): void {
    this.uploadingKey.set(this.uploadKey(report.id, requirement.id));

    const existing = this.supportsFor(report, requirement)[0];
    const supportId$: Promise<number> = existing
      ? Promise.resolve(existing.id)
      : this.supportService
          .create({ reportId: report.id, requirementId: requirement.id })
          .toPromise()
          .then((res) => res!.data!.id);

    supportId$.then((supportId) => {
      this.fileService.create(supportId, file).subscribe({
        next: (res) => {
          this.uploadingKey.set(null);
          if (!res.success || !res.data) return;

          const newFile = res.data;
          const supports = report.supports ?? [];
          let support = supports.find((s) => s.id === supportId);
          if (!support) {
            support = {
              id: supportId,
              reportId: report.id,
              requirementId: requirement.id,
              description: '',
              createdAt: new Date().toISOString(),
              files: [],
            };
            supports.push(support);
          }
          support.files = [...(support.files ?? []), newFile];
          report.supports = [...supports];
          this.reports.set([...this.reports()]);
        },
        error: () => this.uploadingKey.set(null),
      });
    });
  }

  onDeleteFile(
    report: AssessmentComponentReport,
    support: AssessmentComponentReportSupport,
    fileId: number,
  ): void {
    this.fileService.delete(fileId).subscribe(() => {
      support.files = (support.files ?? []).filter((f) => f.id !== fileId);
      report.supports = [...(report.supports ?? [])];
      this.reports.set([...this.reports()]);
    });
  }
}
