import { Routes } from "@angular/router";

export const IMPROVEMENT_PLAN_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/improvement-plan/improvement-plan-list/improvement-plan-list.component").then(
        (m) => m.ImprovementPlanListComponent,
      ),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/improvement-plan/edit-improvement-plan-modal/edit-improvement-plan-modal.component").then(
        (m) => m.EditImprovementPlanModalComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/improvement-plan/edit-improvement-plan-modal/edit-improvement-plan-modal.component").then(
        (m) => m.EditImprovementPlanModalComponent,
      ),
  },
];
