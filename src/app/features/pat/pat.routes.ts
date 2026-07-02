import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const PAT_ROUTES: Routes = [
  {
    path: ":year",
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
        path: "training",
        loadComponent: () =>
          import("./pages/training/training.component").then(
            (m) => m.TrainingComponent,
          ),
        title: "PAT — Capacitaciones",
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
