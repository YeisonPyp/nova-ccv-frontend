import { Routes } from "@angular/router";

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/assessment-dashboard.component").then(
        (m) => m.AssessmentDashboardComponent,
      ),
  },
  {
    path: "edit/:id",
    loadComponent: () =>
      import("./pages/dashboard/edit-assessment-modal/edit-assessment-modal.component").then(
        (m) => m.EditAssessmentModalComponent,
      ),
  },
];
