import { hasPermissionGuard } from '@/app/shared/guards/has-permission.guard';
import { Routes } from '@angular/router';

export const CONTRACT_ROUTES: Routes = [
  {
    path: 'management',
    loadComponent: () =>
      import('./pages/management/contract-management-dashboard.component').then(
        (m) => m.ContractManagementDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_MANAGEMENT_PLAN_READ'])],
  },
  {
    path: 'management/plans/create',
    loadComponent: () =>
      import('./pages/management/contract-management-plan-detail/contract-management-plan-detail.component').then(
        (m) => m.ContractManagementPlanDetailComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_MANAGEMENT_PLAN_CREATE'])],
  },
  {
    path: 'management/plans/:id',
    loadComponent: () =>
      import('./pages/management/contract-management-plan-detail/contract-management-plan-detail.component').then(
        (m) => m.ContractManagementPlanDetailComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_MANAGEMENT_PLAN_READ'])],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/seed-dashboard/contract-seed-dashboard.component').then(
        (m) => m.ContractSeedDashboardComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_READ'])],
  },
  {
    path: 'create/natural',
    loadComponent: () =>
      import('./pages/create-employee-contract/create-employee-contract.component').then(
        (m) => m.CreateEmployeeContractComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_CREATE'])],
  },
  {
    path: 'create/agency',
    loadComponent: () =>
      import('./pages/create-agency-contract/create-agency-contract.component').then(
        (m) => m.CreateAgencyContractComponent,
      ),
  },
  {
    path: 'assignment/:id',
    loadComponent: () =>
      import('./pages/contract-assignment-detail/contract-assignment-detail.component').then(
        (m) => m.ContractAssignmentDetailComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_ASSIGNMENTS_READ'])],
  },
  {
    path: ':contractId/process/:processId',
    loadComponent: () =>
      import('./pages/contract-process-detail/contract-process-detail.component').then(
        (m) => m.ContractProcessDetailComponent,
      ),
    canActivate: [
      hasPermissionGuard([
        'CONTRACT_PENDING_PROCESS_READ',
        'CONTRACT_PENDING_PROCESS_UPDATE',
      ]),
    ],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/contract-detail/contract-detail.component').then(
        (m) => m.ContractDetailComponent,
      ),
    canActivate: [hasPermissionGuard(['CONTRACT_READ'])],
  },
];
