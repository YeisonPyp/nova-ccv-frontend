import { Routes } from "@angular/router";

export const GOALS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/goals-dashboard.component").then(
        (m) => m.GoalsDashboardComponent,
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/dashboard/create-goal/create-goal.component").then(
        (m) => m.CreateGoalComponent,
      ),
  },
];
