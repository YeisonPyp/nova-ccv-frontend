import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const COST_CENTER_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/cost-center-dashboard.component").then(
        (m) => m.CostCenterDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["COST_CENTER_READ"])],
  },
];
