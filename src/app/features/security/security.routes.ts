import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const SECURITY_ROUTES: Routes = [
  {
    path: "roles",
    loadComponent: () =>
      import("./pages/roles/roles-dashboard/roles-dashboard.component").then(
        (m) => m.RolesDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["ROLES_READ"])],
  },
  {
    path: "roles/create",
    loadComponent: () =>
      import("./pages/roles/role-upsert/role-upsert.component").then(
        (m) => m.RoleUpsertComponent,
      ),
    canActivate: [hasPermissionGuard(["ROLES_CREATE"])],
  },
  {
    path: "roles/:id",
    loadComponent: () =>
      import("./pages/roles/role-upsert/role-upsert.component").then(
        (m) => m.RoleUpsertComponent,
      ),
    canActivate: [hasPermissionGuard(["ROLES_UPDATE", "ROLES_READ"])],
  },
  {
    path: "users",
    loadComponent: () =>
      import("./pages/users/users-dashboard.component").then(
        (m) => m.UsersDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["USERS_READ"])],
  },
  {
    path: "users/new",
    loadComponent: () =>
      import("./pages/users/user-registry/user-registry-form.component").then(
        (m) => m.UserRegistryFormComponent,
      ),
    canActivate: [hasPermissionGuard(["USERS_CREATE"])],
  },
  {
    path: "users/:id",
    loadComponent: () =>
      import("./pages/users/user-detail/user-detail.component").then(
        (m) => m.UserDetailComponent,
      ),
    canActivate: [hasPermissionGuard(["USERS_UPDATE", "USERS_READ"])],
  },
  {
    path: "schedules",
    loadComponent: () =>
      import("./pages/schedule/schedule.component").then(
        (m) => m.ScheduleComponent,
      ),
    canActivate: [hasPermissionGuard(["SCHEDULES_READ"])],
  },
];
