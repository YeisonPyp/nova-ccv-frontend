import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramsAndAdendasSectionComponent } from '../../components/programs-and-adendas-section/programs-and-adendas-section.component';
import { TacticalActivitiesTabComponent } from '../../components/tactical-activities-tab/tactical-activities-tab.component';
import { AreaBudgetReportComponent } from '../activity-report/components/area-budget-report/area-budget-report.component';
import { PatActivityService } from '@/app/core/services/pat/pat-activity.service';

type TabKey = 'programs' | 'tacticalActivities';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProgramsAndAdendasSectionComponent,
    TacticalActivitiesTabComponent,
    AreaBudgetReportComponent,
    NgComponentOutlet,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  private readonly activityService = inject(PatActivityService);
  readonly activeTab = signal<TabKey>('tacticalActivities');

  year = input.required<number>();

  uploading = signal(false);
  uploadError = signal<string | null>(null);

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'tacticalActivities', label: 'Actividades Tácticas' },
    { key: 'programs', label: 'Programas Estratégicos' },
  ];

  readonly tabsComponent = {
    programs: ProgramsAndAdendasSectionComponent,
    tacticalActivities: TacticalActivitiesTabComponent,
  };

  readonly tabsInputs = computed<Record<TabKey, any>>(() => {
    return {
      programs: { year: this.year() },
      tacticalActivities: { year: this.year() },
    };
  });

  activeTabInputs = computed(() => this.tabsInputs()[this.activeTab()]);

  activeTabComponent = computed(() => this.tabsComponent[this.activeTab()]);

  setTab(t: TabKey) {
    this.activeTab.set(t);
  }

  onSeedFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.activityService.seedFromFile(this.year(), file).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = '';
        window.location.reload();
      },
      error: (err) => {
        this.uploading.set(false);
        input.value = '';
        this.uploadError.set(
          err.error?.message ?? 'Error al cargar el archivo',
        );
      },
    });
  }
}
