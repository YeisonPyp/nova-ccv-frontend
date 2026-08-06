import { matchYearGuard } from "@/app/core/guards/match-year.guard";
import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const PAT_ROUTES: Routes = [
  {
    path: "budget",
    loadComponent: () =>
      import(
        "./pages/presupuestal-categories/presupuestal-categories.component"
      ).then((m) => m.PresupuestalCategoriesComponent),
    title: "Rubros presupuestales",
    canActivate: [hasPermissionGuard(["PRESUPUESTAL_CATEGORY_READ"])],
  },
  {
    path: "budget/:id",
    loadComponent: () =>
      import(
        "./pages/presupuestal-category-detail/presupuestal-category-detail.component"
      ).then((m) => m.PresupuestalCategoryDetailComponent),
    title: "Rubro presupuestal",
    canActivate: [hasPermissionGuard(["PRESUPUESTAL_CATEGORY_READ"])],
  },
  {
    path: ":year",
    canMatch: [matchYearGuard],
    loadComponent: () =>
      import("./layout/pat-layout.component").then((m) => m.PatLayoutComponent),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
        title: "PAT — Tablero de Control",
        canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
      },
      {
        path: "activities/create",
        loadComponent: () =>
          import("./pages/create-activity/create-activity.component").then(
            (m) => m.CreatePatActivityComponent,
          ),
        title: "PAT — Nueva Actividad",
        canActivate: [hasPermissionGuard(["PAT_ACTIVITY_CREATE"])],
      },
      {
        path: "activities/:id",
        loadComponent: () =>
          import("./pages/activity-detail/activity-detail.component").then(
            (m) => m.PatActivityDetailComponent,
          ),
        title: "PAT — Detalle de Actividad",
        canActivate: [hasPermissionGuard(["PAT_ACTIVITY_READ"])],
      },
      {
        path: "tasks/:id",
        loadComponent: () =>
          import("./pages/task-detail/task-detail.component").then(
            (m) => m.PatTaskDetailComponent,
          ),
        title: "PAT — Detalle de Tarea",
        canActivate: [hasPermissionGuard(["PAT_ACTIVITY_READ"])],
      },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
  {
    path: "",
    redirectTo: () => {
      return new Date().getFullYear().toString();
    },
    pathMatch: "full",
  },
];
