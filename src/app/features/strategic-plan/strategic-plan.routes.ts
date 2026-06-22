import { Route } from "@angular/router";

export const STRATEGIC_PLAN_ROUTES: Route[] = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/strategic-plan-dashboard.component").then(
        (c) => c.StrategicPlanDashboardComponent,
      ),
  },
  {
    path: ":planId",
    loadComponent: () =>
      import("./pages/strategic-plan-detail/strategic-plan-detail.component").then(
        (c) => c.StrategicPlanDetailComponent,
      ),
  },
];
