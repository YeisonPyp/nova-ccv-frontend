// pat/pat.routes.ts
import { Routes } from '@angular/router';

export const PAT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'PAT — Tablero de Control',
  },
  {
    path: 'programs',
    loadComponent: () =>
      import('./pages/programs/programs.component')
        .then(m => m.ProgramsComponent),
    title: 'PAT — Programas',
  },
  {
    path: 'programs/create',
    loadComponent: () =>
      import('./pages/create-program/create-program.component')
        .then(m => m.CreateProgramComponent),
    title: 'PAT — Crear Programa',
  },
  {
    path: 'programs/:id',
    loadComponent: () =>
      import('./pages/program-detail/program-detail.component')
        .then(m => m.ProgramDetailComponent),
    title: 'PAT — Detalle de Programa',
  },
  {
    path: 'training',
    loadComponent: () =>
      import('./pages/training/training.component')
        .then(m => m.TrainingComponent),
    title: 'PAT — Capacitaciones',
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports.component')
        .then(m => m.ReportsComponent),
    title: 'PAT — Reportes',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];