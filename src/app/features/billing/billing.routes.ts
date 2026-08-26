import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const BILLING_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/billing-dashboard.component").then(
        (m) => m.BillingDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["BILLING_ACCOUNT_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/create/create-billing.component").then(
        (m) => m.CreateBillingComponent,
      ),
    canActivate: [hasPermissionGuard(["BILLING_ACCOUNT_CREATE"])],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/detail/billing-detail.component").then(
        (m) => m.BillingDetailComponent,
      ),
    canActivate: [hasPermissionGuard(["BILLING_ACCOUNT_READ"])],
  },
];
