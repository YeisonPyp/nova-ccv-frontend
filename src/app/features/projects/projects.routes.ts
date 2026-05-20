import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const PROJECTS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/project-list/project-list.component").then(
        (m) => m.ProjectListComponent,
      ),
    canActivate: [hasPermissionGuard(["PROJECTS_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/create-project/create-project.component").then(
        (m) => m.CreateProjectComponent,
      ),
    canActivate: [hasPermissionGuard(["PROJECTS_CREATE"])],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/project-detail/project-detail.component").then(
        (m) => m.ProjectDetailComponent,
      ),
    canActivate: [hasPermissionGuard(["PROJECTS_READ"])],
  },
];
