import { hasPermissionGuard } from '@/app/shared/guards/has-permission.guard';
import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
    canActivate: [hasPermissionGuard(['PROJECTS_READ'])],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
    canActivate: [hasPermissionGuard(['PROJECTS_READ'])],
  },
  {
    path: ':projectId/activities/create',
    loadComponent: () =>
      import('./pages/create-activity/create-activity.component').then(
        (m) => m.CreatePatActivityComponent,
      ),
    canActivate: [hasPermissionGuard(['PAT_ACTIVITY_CREATE'])],
  },
  {
    path: 'activities/:id',
    loadComponent: () =>
      import('./pages/activity-detail/activity-detail.component').then(
        (m) => m.ActivityDetailComponent,
      ),
    title: 'PAT — Detalle de Actividad',
    canActivate: [hasPermissionGuard(['PAT_ACTIVITY_READ'])],
  },
];
