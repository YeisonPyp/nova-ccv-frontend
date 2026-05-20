import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const PAT_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
  },
  {
    path: "programs",
    loadComponent: () =>
      import("./pages/programs/programs.component").then(
        (m) => m.ProgramsComponent,
      ),
    canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/create-program/create-program.component").then(
        (m) => m.CreateProgramComponent,
      ),
    canActivate: [hasPermissionGuard(["PAT_PROGRAMS_CREATE"])],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/program-detail/program-detail.component").then(
        (m) => m.ProgramDetailComponent,
      ),
    canActivate: [hasPermissionGuard(["PAT_PROGRAMS_READ"])],
  },
];
