import { Routes } from "@angular/router";

export const FILING_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/filing-dashboard.component").then(
        (m) => m.FilingDashboardComponent,
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/filing-detail/filing-detail.component").then(
        (m) => m.FilingModalComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/filing-detail/filing-detail.component").then(
        (m) => m.FilingModalComponent,
      ),
  },
];
