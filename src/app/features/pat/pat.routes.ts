import { Routes } from '@angular/router';

export const PAT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'programs',
    loadComponent: () => import('./pages/programs/programs.component')
      .then(m => m.ProgramsComponent)
  },
  {
    path: 'programs/new',
    loadComponent: () => 
      import('./pages/program-form/program-form.component')
        .then(m => m.ProgramFormComponent)
  },
  {
    path: 'programs/:id',
    loadComponent: () => import('./pages/program-detail/program-detail.component')
      .then(m => m.ProgramDetailComponent)
  },
  {
    path: 'programs/:id/edit',
    loadComponent: () => 
      import('./pages/program-form/program-form.component')
        .then(m => m.ProgramFormComponent)
  },
  {
    path: 'programs/:programId/activities/new',
    loadComponent: () => 
      import('./pages/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'programs/:programId/activities/:activityId/edit',
    loadComponent: () => 
      import('./pages/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  }
      
];