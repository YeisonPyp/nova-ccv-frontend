import { Route } from '@angular/router';

export const TRAINING_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/training-dashboard.component').then(
        (m) => m.TrainingDashboardComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create-training/create-training.component').then(
        (m) => m.CreateTrainingComponent,
      ),
  },
  // programs must come before the :trainingId wildcard
  {
    path: 'programs',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/programs-dashboard/programs-dashboard.component'
          ).then((m) => m.ProgramsDashboardComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/program-form/program-form.component').then(
            (m) => m.ProgramFormComponent,
          ),
      },
      {
        path: ':programId',
        loadComponent: () =>
          import('./pages/program-detail/program-detail.component').then(
            (m) => m.ProgramDetailComponent,
          ),
      },
    ],
  },
  // requests must come before the :trainingId wildcard
  {
    path: 'requests',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/requests-list/requests-list.component').then(
            (m) => m.RequestsListComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/request-form/request-form.component').then(
            (m) => m.RequestFormComponent,
          ),
      },
      {
        path: ':requestId',
        loadComponent: () =>
          import('./pages/request-detail/request-detail.component').then(
            (m) => m.RequestDetailComponent,
          ),
      },
    ],
  },
  {
    path: ':trainingId/answer/:employeeId',
    loadComponent: () =>
      import('./pages/training-answer/training-answer.component').then(
        (m) => m.TrainingAnswerComponent,
      ),
  },
  {
    path: ':trainingId',
    loadComponent: () =>
      import('./pages/training-detail/training-detail.component').then(
        (m) => m.TrainingDetailComponent,
      ),
  },
];
