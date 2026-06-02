import { Component, inject, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../../core/services/auth.service";
import { ProgramsTabComponent } from "../../components/programs-tab/programs-tab.component";
import { ActivitiesTabComponent } from "../../components/activities-tab/activities-tab.component";
import { ObjectivesTabComponent } from "../../components/objectives-tab/objectives-tab.component";
import { PerformanceIndicatorsPanelComponent } from "../../components/performance-indicators-panel/performance-indicators-panel.component";

type TabKey = "programs" | "activities" | "objectives";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    ProgramsTabComponent,
    ActivitiesTabComponent,
    ObjectivesTabComponent,
    PerformanceIndicatorsPanelComponent,
  ],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly activeTab = signal<TabKey>("programs");

  year = input.required<number>();

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: "programs", label: "Programas" },
    { key: "objectives", label: "Objetivos" },
    { key: "activities", label: "Actividades" },
  ];

  setTab(t: TabKey) {
    this.activeTab.set(t);
  }
}
