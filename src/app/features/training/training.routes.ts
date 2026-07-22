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
