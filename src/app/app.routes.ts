// // src/app/app.routes.ts

// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'pat/dashboard',
//     pathMatch: 'full'
//   },
//   {
//     path: 'pat',
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () => 
//           import('./features/pat/pages/dashboard/dashboard.component')
//             .then(m => m.DashboardComponent)
//       },
//       {
//         path: 'programs',
//         loadComponent: () => 
//           import('./features/pat/pages/programs/programs.component')
//             .then(m => m.ProgramsComponent)
//       },
//       {
//         path: 'programs/:id',
//         loadComponent: () => 
//           import('./features/pat/pages/program-detail/program-detail.component')
//             .then(m => m.ProgramDetailComponent)
//       }
//     ]
//   },
//   {
//     path: '**',
//     redirectTo: 'pat/dashboard'
//   }
// ];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'pat',
        loadChildren: () => import('./features/pat/pat.routes')
          .then(m => m.PAT_ROUTES)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];