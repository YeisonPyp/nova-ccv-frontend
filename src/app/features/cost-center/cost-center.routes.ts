import { Routes } from "@angular/router";

export const COST_CENTER_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/cost-center-dashboard.component").then(
        (m) => m.CostCenterDashboardComponent,
      ),
  },
];
