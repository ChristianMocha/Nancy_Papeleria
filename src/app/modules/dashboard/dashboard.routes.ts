import { Routes } from '@angular/router';

const DashboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => {
      return import('./layout/layout.component').then((m) => m.LayoutComponent);
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./modules/inventory/inventory.component').then(
            (m) => m.InventoryComponent
          ),
      },
      // {
      //   path: 'forbidden',
      //   loadComponent: () =>
      //     import('./modules/common/forbidden/forbidden-page.component').then(
      //       (m) => m.ForbiddenComponent
      //     ),
      // },
      
      {
        path: '**',
        redirectTo: 'inventory',
      },
    ],
  },
];

export default DashboardRoute;
