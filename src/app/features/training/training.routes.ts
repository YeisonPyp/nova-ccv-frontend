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
  {
    path: 'programs',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/programs-dashboard/programs-dashboard.component').then(
            (m) => m.ProgramsDashboardComponent,
          ),
      },
    ],
  },
];
