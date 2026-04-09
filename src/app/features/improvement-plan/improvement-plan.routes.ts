import { Routes } from "@angular/router";

export const IMPROVEMENT_PLAN_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/improvement-plan/improvement-plan-list/improvement-plan-list.component").then(
        (m) => m.ImprovementPlanListComponent,
      ),
  },
  {
    path: "control-entity/dashboard",
    loadComponent: () =>
      import("./pages/control-entity/control-entity-list/control-entity-list.component").then(
        (m) => m.ControlEntityListComponent,
      ),
  },
  {
    path: "edit-improvement-plan",
    loadComponent: () =>
      import("./pages/improvement-plan/edit-improvement-plan-modal/edit-improvement-plan-modal.component").then(
        (m) => m.EditImprovementPlanModalComponent,
      ),
  },
];
