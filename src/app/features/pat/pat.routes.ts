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
        path: "programs",
        loadComponent: () =>
          import("./pages/programs/programs.component").then(
            (m) => m.ProgramsComponent,
          ),
        title: "PAT — Programas",
        canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
      },
      {
        path: "programs/:id",
        loadComponent: () =>
          import("./pages/program-detail/program-detail.component").then(
            (m) => m.ProgramDetailComponent,
          ),
        title: "PAT — Detalle de Programa",
        canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
      },
      {
        path: "projects/create",
        loadComponent: () =>
          import("./pages/create-project/create-project.component").then(
            (m) => m.CreateProjectComponent,
          ),
        canActivate: [hasPermissionGuard(["PROJECTS_CREATE"])],
      },
      {
        path: "reports",
        loadComponent: () =>
          import("./pages/reports/reports.component").then(
            (m) => m.ReportsComponent,
          ),
        title: "PAT — Reportes",
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
