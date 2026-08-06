import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';
import { PatReportService } from '@/app/core/services/pat/pat-report.service';
import { PatActivity } from '@/app/core/models/pat/pat-models';
import { PatActivityReportResponse } from '@/app/core/models/pat/pat-report-models';
import { ActivityReportCardComponent } from '@/app/features/pat/pages/activity-report/components/activity-report-card/activity-report-card.component';
import { PaginatorComponent } from '@/app/shared/components/paginator/paginator.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-tactical-activities-tab',
  standalone: true,
  imports: [
    CommonModule,
    ActivityReportCardComponent,
    PaginatorComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './tactical-activities-tab.component.html',
})
export class TacticalActivitiesTabComponent {
  private readonly activityService = inject(PatActivityService);
  private readonly reportService = inject(PatReportService);
  private readonly router = inject(Router);

  year = input.required<number>();

  activities = signal<PatActivity[]>([]);
  report = signal<PatActivityReportResponse | null>(null);

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(6);
  loading = signal(false);

  constructor() {
    effect(() => {
      const year = this.year();
      this.reportService.findActivityReport(null, year).subscribe((res) => {
        if (res.success) this.report.set(res.data);
      });
    });

    effect(() => {
      const year = this.year();
      const page = this.currentPage();
      const size = this.pageSize();
      this.loading.set(true);
      this.activityService
        .findAll({ page: page - 1, size, rsqlQuery: `year==${year}` })
        .subscribe((res) => {
          this.loading.set(false);
          if (res.success) {
            this.activities.set(res.data.content);
            this.totalPages.set(Math.max(1, res.data.totalPages));
          }
        });
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  budgetRowsFor(activityId: number) {
    return (this.report()?.budget ?? []).filter(
      (r) => r.activityId === activityId,
    );
  }

  indicatorRowsFor(activityId: number) {
    return (this.report()?.indicators ?? []).filter(
      (r) => r.activityId === activityId,
    );
  }

  productRowsFor(activityId: number) {
    return (this.report()?.products ?? []).filter(
      (r) => r.activityId === activityId,
    );
  }

  benefitRowsFor(activityId: number) {
    return (this.report()?.benefits ?? []).filter(
      (r) => r.activityId === activityId,
    );
  }

  openCreate(): void {
    this.router.navigate([`/pat/${this.year()}/activities/create`]);
  }
}
