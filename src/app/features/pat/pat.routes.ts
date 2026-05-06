import { Routes } from "@angular/router";

export const PAT_ROUTES: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "programs",
    loadComponent: () =>
      import("./pages/programs/programs.component").then(
        (m) => m.ProgramsComponent,
      ),
  },
  {
    path: "programs/create",
    loadComponent: () =>
      import("./pages/create-program/create-program.component").then(
        (m) => m.CreateProgramComponent,
      ),
  },
  {
    path: "programs/:id",
    loadComponent: () =>
      import("./pages/program-detail/program-detail.component").then(
        (m) => m.ProgramDetailComponent,
      ),
  },
];
