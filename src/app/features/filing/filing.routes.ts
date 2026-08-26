import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const FILING_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/filing-dashboard.component").then(
        (m) => m.FilingDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["FILING_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/filing-detail/filing-detail.component").then(
        (m) => m.FilingModalComponent,
      ),
    canActivate: [hasPermissionGuard(["FILING_CREATE"])],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/filing-detail/filing-detail.component").then(
        (m) => m.FilingModalComponent,
      ),
    canActivate: [hasPermissionGuard(["FILING_READ"])],
  },
];
