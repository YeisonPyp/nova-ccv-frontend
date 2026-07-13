import { Route } from '@angular/router';

export const REPORT_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-dashboard/reports-dashboard.component').then(
        (c) => c.ReportDashboardComponent,
      ),
  },
  {
    path: 'templates/:templateId',
    loadComponent: () =>
      import('./pages/report-template/report-template.component').then(
        (c) => c.ReportTemplateComponent,
      ),
  },
];
