// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pat/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'pat',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => 
          import('./features/pat/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'programs',
        loadComponent: () => 
          import('./features/pat/pages/programs/programs.component')
            .then(m => m.ProgramsComponent)
      },
      {
        path: 'programs/:id',
        loadComponent: () => 
          import('./features/pat/pages/program-detail/program-detail.component')
            .then(m => m.ProgramDetailComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'pat/dashboard'
  }
];