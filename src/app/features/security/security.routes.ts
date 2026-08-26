import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const SECURITY_ROUTES: Routes = [
  {
    path: "audit-candidates",
    loadComponent: () =>
      import("./pages/audit-candidates/audit-candidates.component").then(
        (m) => m.AuditCandidatesComponent,
      ),
    canActivate: [
      hasPermissionGuard(["AUDIT_ENTITIES_CANDIDATES_READ", "AUDIT_LOGS_READ"]),
    ],
  },
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
