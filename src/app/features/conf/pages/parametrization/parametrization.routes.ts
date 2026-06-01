import { Routes } from "@angular/router";

export const PARAMETRIZATION_ROUTES: Routes = [
  {
    path: "workflows",
    loadComponent: () =>
      import("./workflows/workflows-param.component").then(
        (m) => m.WorkflowsParamComponent,
      ),
  },
  {
    path: "assessment",
    loadComponent: () =>
      import("./assessment/assessment-param.component").then(
        (m) => m.AssessmentParamComponent,
      ),
  },
  {
    path: "positions",
    loadComponent: () =>
      import("./positions/positions-param.component").then(
        (m) => m.PositionsParamComponent,
      ),
  },
  {
    path: "projects",
    loadComponent: () =>
      import("./projects/projects-param.component").then(
        (m) => m.ProjectsParamComponent,
      ),
  },
  {
    path: "billing",
    loadComponent: () =>
      import("./billing/billing-param.component").then(
        (m) => m.BillingParamComponent,
      ),
  },
  {
    path: "contracts",
    loadComponent: () =>
      import("./contracts/contracts-param.component").then(
        (m) => m.ContractsParamComponent,
      ),
  },
  {
    path: "filing",
    loadComponent: () =>
      import("./filing/filing-param.component").then(
        (m) => m.FilingParamComponent,
      ),
  },
  {
    path: "pat",
    loadComponent: () =>
      import("./pat/pat-param.component").then((m) => m.PatParamComponent),
  },
  {
    path: "",
    loadComponent: () =>
      import("../../../cost-center/pages/cost-center-dashboard.component").then(
        (m) => m.CostCenterDashboardComponent,
      ),
  },
];
