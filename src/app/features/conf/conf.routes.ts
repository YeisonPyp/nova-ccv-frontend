import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const CONF_ROUTES: Routes = [
  {
    path: "audit-candidates",
    loadComponent: () =>
      import("./pages/audit-candidates/audit-candidates.component").then(
        (m) => m.AuditCandidatesComponent,
      ),
    canActivate: [
      hasPermissionGuard(["AUDIT_ENTITIES_CANDIDATES_READ", "AUDIT_LOGS_READ"]),
    ],
  },
  {
    path: "parametrization",
    loadChildren: () =>
      import("./pages/parametrization/parametrization.routes").then(
        (m) => m.PARAMETRIZATION_ROUTES,
      ),
  },
];
