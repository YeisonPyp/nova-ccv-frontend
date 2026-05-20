import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const GOALS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/goals-dashboard.component").then(
        (m) => m.GoalsDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["GOALS_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/dashboard/create-goal/create-goal.component").then(
        (m) => m.CreateGoalComponent,
      ),
    canActivate: [hasPermissionGuard(["GOALS_CREATE"])],
  },
];
