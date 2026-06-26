import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramsTabComponent } from '../../components/programs-tab/programs-tab.component';
import { ActivitiesTabComponent } from '../../components/activities-tab/activities-tab.component';
import { PerformanceIndicatorsPanelComponent } from '../../components/performance-indicators-panel/performance-indicators-panel.component';
import { ProjectsTabComponent } from '../../components/projects-tab/projects-tab.component';

type TabKey = 'programs' | 'activities' | 'projects';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProgramsTabComponent,
    ActivitiesTabComponent,
    PerformanceIndicatorsPanelComponent,
    NgComponentOutlet,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly activeTab = signal<TabKey>('programs');

  year = input.required<number>();

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'programs', label: 'Programas' },
    { key: 'projects', label: 'Proyectos' },
    { key: 'activities', label: 'Actividades' },
  ];

  readonly tabsComponent = {
    programs: ProgramsTabComponent,
    activities: ActivitiesTabComponent,
    projects: ProjectsTabComponent,
  };

  readonly tabsInputs = computed<Record<TabKey, any>>(() => {
    const base = { year: this.year() };
    return {
      programs: base,
      activities: base,
      projects: base,
    };
  });

  activeTabInputs = computed(() => this.tabsInputs()[this.activeTab()]);

  activeTabComponent = computed(() => this.tabsComponent[this.activeTab()]);

  setTab(t: TabKey) {
    this.activeTab.set(t);
  }
}
