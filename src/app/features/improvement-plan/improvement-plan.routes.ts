import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const IMPROVEMENT_PLAN_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/improvement-plan/improvement-plan-list/improvement-plan-list.component").then(
        (m) => m.ImprovementPlanListComponent,
      ),
    canActivate: [hasPermissionGuard(["IMPROVEMENT_PLAN_READ"])],
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/improvement-plan/edit-improvement-plan-modal/edit-improvement-plan-modal.component").then(
        (m) => m.EditImprovementPlanModalComponent,
      ),
    canActivate: [hasPermissionGuard(["IMPROVEMENT_PLAN_CREATE"])],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/improvement-plan/edit-improvement-plan-modal/edit-improvement-plan-modal.component").then(
        (m) => m.EditImprovementPlanModalComponent,
      ),
    canActivate: [
      hasPermissionGuard(["IMPROVEMENT_PLAN_READ", "IMPROVEMENT_PLAN_UPDATE"]),
    ],
  },
];
