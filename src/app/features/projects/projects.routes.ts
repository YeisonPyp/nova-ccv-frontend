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
];
