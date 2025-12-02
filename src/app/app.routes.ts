import { Routes } from '@angular/router';
import { LoginRedirectGuard } from './modules/shared/guards/login-redirect.guard';

export const routes: Routes = [
  // { path: '', redirectTo: '/public/sign-in', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [LoginRedirectGuard],
    loadComponent: () =>
      import('./modules/dashboard/modules/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },

  {
    path: '',
    loadChildren: () => import('./modules/dashboard/dashboard.routes'),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
