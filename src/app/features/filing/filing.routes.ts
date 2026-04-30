import { Routes } from "@angular/router";

export const FILING_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/filing-dashboard.component").then(
        (m) => m.FilingDashboardComponent,
      ),
  },
];
