import { Routes } from "@angular/router";

export const CONTRACT_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/contract-dashboard.component").then(
        (m) => m.ContractDashboardComponent,
      ),
  },
];
