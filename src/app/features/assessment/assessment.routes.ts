import { hasPermissionGuard } from "@/app/shared/guards/has-permission.guard";
import { Routes } from "@angular/router";

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/assessment-dashboard.component").then(
        (m) => m.AssessmentDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(["ASSESSMENTS_READ"])],
  },
  {
    path: "edit/:id",
    loadComponent: () =>
      import("./pages/dashboard/edit-assessment-modal/edit-assessment-modal.component").then(
        (m) => m.EditAssessmentModalComponent,
      ),
    canActivate: [hasPermissionGuard(["ASSESSMENTS_UPDATE"])],
  },
  {
    path: "positions/:id",
    loadComponent: () =>
      import("./pages/positions/position-detail.component").then(
        (m) => m.PositionDetailComponent,
      ),
  },
];
