import { Routes } from "@angular/router";

export const CONTRACT_ROUTES: Routes = [
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/contract-dashboard.component").then(
        (m) => m.ContractDashboardComponent,
      ),
  },
  {
    path: "create/:type",
    loadComponent: () =>
      import("./pages/create-contract-modal/create-contract-modal.component").then(
        (m) => m.CreateContractModalComponent,
      ),
  },
  {
    path: "assignment/:id",
    loadComponent: () =>
      import("./pages/contract-assignment-detail/contract-assignment-detail.component").then(
        (m) => m.ContractAssignmentDetailComponent,
      ),
  },
  {
    path: ":contractId/process/:processId",
    loadComponent: () =>
      import("./pages/contract-process-detail/contract-process-detail.component").then(
        (m) => m.ContractProcessDetailComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/contract-detail/contract-detail.component").then(
        (m) => m.ContractDetailComponent,
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
];
