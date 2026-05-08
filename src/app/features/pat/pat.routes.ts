import { Routes } from "@angular/router";

export const PAT_ROUTES: Routes = [
  {
    path: "",
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
    path: "create",
    loadComponent: () =>
      import("./pages/create-program/create-program.component").then(
        (m) => m.CreateProgramComponent,
      ),
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./pages/program-detail/program-detail.component").then(
        (m) => m.ProgramDetailComponent,
      ),
  },
];
