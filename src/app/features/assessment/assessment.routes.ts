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
    path: "periods",
    loadComponent: () =>
      import("./pages/periods/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "impact-rules/dashboard",
    loadComponent: () =>
      import("./pages/impact-rules/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "jobs/dashboard",
    loadComponent: () =>
      import("./pages/jobs/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "competencies/dashboard",
    loadComponent: () =>
      import("./pages/competencies/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "areas/dashboard",
    loadComponent: () =>
      import("./pages/areas/areas.component").then((m) => m.AreasComponent),
  },
  {
    path: "employees/dashboard",
    loadComponent: () =>
      import("./pages/employees/employees.component").then(
        (m) => m.EmployeesComponent,
      ),
  },
  {
    path: "employees/create",
    loadComponent: () =>
      import("./pages/employees/employee-form/employee-form.component").then(
        (m) => m.EmployeeFormComponent,
      ),
  },
  {
    path: "employees/:id/edit",
    loadComponent: () =>
      import("./pages/employees/employee-form/employee-form.component").then(
        (m) => m.EmployeeFormComponent,
      ),
  },
  {
    path: "edit/:id",
    loadComponent: () =>
      import(
        "./pages/dashboard/edit-assessment-modal/edit-assessment-modal.component"
      ).then((m) => m.EditAssessmentModalComponent),
  },
];
