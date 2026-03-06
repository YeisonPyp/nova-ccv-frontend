import { Routes } from "@angular/router";

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/assessment-dashboard.component").then(
        (m) => m.AssessmentDashboardComponent,
      ),
  },
  {
    path: "periods",
    loadComponent: () =>
      import("./pages/periods/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "impact-rules/dashboard",
    loadComponent: () =>
      import("./pages/impact-rules/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "jobs/dashboard",
    loadComponent: () =>
      import("./pages/jobs/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "competencies/dashboard",
    loadComponent: () =>
      import("./pages/competencies/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "goals/dashboard",
    loadComponent: () =>
      import("./pages/goals/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "areas/dashboard",
    loadComponent: () =>
      import("./pages/areas/areas.component").then((m) => m.AreasComponent),
  },
];
