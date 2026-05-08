import { Routes } from "@angular/router";

export const BILLING_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/billing-dashboard.component").then(
        (m) => m.BillingDashboardComponent,
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/create/create-billing.component").then(
        (m) => m.CreateBillingComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/detail/billing-detail.component").then(
        (m) => m.BillingDetailComponent,
      ),
  },
];
