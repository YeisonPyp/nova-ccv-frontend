import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { PatReportService } from '@/app/core/services/pat/pat-report.service';
import { PatActivityReportResponse } from '@/app/core/models/pat/pat-report-models';
import { ActivityReportCardComponent } from './components/activity-report-card/activity-report-card.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

Chart.register(...registerables);

interface AreaActivitiesGroup {
  areaId: number;
  areaName: string;
  activities: { activityId: number; activityName: string }[];
}

@Component({
  selector: 'app-activities-by-area-report',
  standalone: true,
  imports: [CommonModule, ActivityReportCardComponent, LoadingSpinnerComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './activity-report.component.html',
})
export class ActivitiesByAreaReportComponent {
  private readonly service = inject(PatReportService);

  year = input<number | null>(null);
  areaIds = input<number[]>([]);

  report = signal<PatActivityReportResponse | null>(null);
  isLoading = signal(false);

  areaGroups = computed<AreaActivitiesGroup[]>(() => {
    const report = this.report();
    if (!report) return [];

    const groups = new Map<number, AreaActivitiesGroup>();
    for (const row of report.budget) {
      if (!groups.has(row.areaId)) {
        groups.set(row.areaId, {
          areaId: row.areaId,
          areaName: row.areaName,
          activities: [],
        });
      }
      const group = groups.get(row.areaId)!;
      if (!group.activities.some((a) => a.activityId === row.activityId)) {
        group.activities.push({
          activityId: row.activityId,
          activityName: row.activityName,
        });
      }
    }
    return Array.from(groups.values());
  });

  visibleAreaGroups = computed<AreaActivitiesGroup[]>(() => {
    const ids = this.areaIds();
    if (ids.length === 0) return this.areaGroups();
    const selected = new Set(ids);
    return this.areaGroups().filter((g) => selected.has(g.areaId));
  });

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      this.service.findActivityReport(null, this.year()).subscribe((res) => {
        this.isLoading.set(false);
        if (res.success) this.report.set(res.data);
      });
    });
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
}
