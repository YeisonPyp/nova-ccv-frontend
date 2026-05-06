import { Routes } from "@angular/router";

export const FILING_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/filing-dashboard.component").then(
        (m) => m.FilingDashboardComponent,
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./components/dashboard/filing-modal/filing-modal.component").then(
        (m) => m.FilingModalComponent,
      ),
  },
  {
    path: ":id/edit",
    loadComponent: () =>
      import("./components/dashboard/filing-modal/filing-modal.component").then(
        (m) => m.FilingModalComponent,
      ),
  },
];
