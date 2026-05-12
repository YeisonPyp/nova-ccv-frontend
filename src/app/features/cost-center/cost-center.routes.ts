import { Routes } from "@angular/router";

export const COST_CENTER_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/cost-center-dashboard.component").then(
        (m) => m.CostCenterDashboardComponent,
      ),
  },
];
