import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramsTabComponent } from '../../components/programs-tab/programs-tab.component';
import { ActivitiesTabComponent } from '../../components/activities-tab/activities-tab.component';
import { AreaBudgetReportComponent } from '../activity-report/components/area-budget-report/area-budget-report.component';

type TabKey = 'programs' | 'activities';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProgramsTabComponent,
    ActivitiesTabComponent,
    AreaBudgetReportComponent,
    NgComponentOutlet,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly activeTab = signal<TabKey>('activities');

  year = input.required<number>();

  selectedAreaIds = signal<number[]>([]);

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'activities', label: 'Actividades' },
    { key: 'programs', label: 'Programas' },
  ];

  readonly tabsComponent = {
    programs: ProgramsTabComponent,
    activities: ActivitiesTabComponent,
  };

  readonly tabsInputs = computed<Record<TabKey, any>>(() => {
    const base = { year: this.year() };
    return {
      programs: base,
      activities: { ...base, areaIds: this.selectedAreaIds() },
    };
  });

  activeTabInputs = computed(() => this.tabsInputs()[this.activeTab()]);

  activeTabComponent = computed(() => this.tabsComponent[this.activeTab()]);

  setTab(t: TabKey) {
    this.activeTab.set(t);
  }

  onAreaSelected(ids: number[]): void {
    this.selectedAreaIds.set(ids);
    this.activeTab.set('activities');
  }
}
