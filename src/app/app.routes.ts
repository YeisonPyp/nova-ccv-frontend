import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layouts/main-layout/main-layout.component").then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/home/home.component").then((m) => m.HomeComponent),
      },
      {
        path: "pat",
        loadChildren: () =>
          import("./features/pat/pat.routes").then((m) => m.PAT_ROUTES),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./features/profile/profile.component").then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: "assessment",
        loadChildren: () =>
          import("./features/assessment/assessment.routes").then(
            (m) => m.ASSESSMENT_ROUTES,
          ),
      },
      {
        path: "improvement-plan",
        loadChildren: () =>
          import("./features/improvement-plan/improvement-plan.routes").then(
            (m) => m.IMPROVEMENT_PLAN_ROUTES,
          ),
      },
      {
        path: "goals",
        loadChildren: () =>
          import("./features/goals/goals.routes").then((m) => m.GOALS_ROUTES),
      },
      {
        path: "contracts",
        loadChildren: () =>
          import("./features/contract/contract.routes").then(
            (m) => m.CONTRACT_ROUTES,
          ),
      },
      {
        path: "filings",
        loadChildren: () =>
          import("./features/filing/filing.routes").then(
            (m) => m.FILING_ROUTES,
          ),
      },
      {
        path: "projects",
        loadChildren: () =>
          import("./features/projects/projects.routes").then(
            (m) => m.PROJECTS_ROUTES,
          ),
      },
      {
        path: "conf",
        loadChildren: () =>
          import("./features/conf/conf.routes").then((m) => m.CONF_ROUTES),
      },
      {
        path: "billing",
        loadChildren: () =>
          import("./features/billing/billing.routes").then(
            (m) => m.BILLING_ROUTES,
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "auth/login",
  },
];
