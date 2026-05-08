import { Routes } from "@angular/router";

export const CONF_ROUTES: Routes = [
  {
    path: "audit-candidates",
    loadComponent: () =>
      import("./pages/audit-candidates/audit-candidates.component").then(
        (m) => m.AuditCandidatesComponent,
      ),
  },
  {
    path: "audit-logs/:entityName",
    loadComponent: () =>
      import("./pages/audit-logs/audit-logs.component").then(
        (m) => m.AuditLogsComponent,
      ),
  },
  {
    path: "users",
    loadComponent: () =>
      import("./pages/users/users-dashboard.component").then(
        (m) => m.UsersDashboardComponent,
      ),
  },
  {
    path: "users/:id",
    loadComponent: () =>
      import("./pages/users/user-detail/user-detail.component").then(
        (m) => m.UserDetailComponent,
      ),
  },
  {
    path: "parametrization",
    loadChildren: () =>
      import("./pages/parametrization/parametrization.routes").then(
        (m) => m.PARAMETRIZATION_ROUTES,
      ),
  },
];
