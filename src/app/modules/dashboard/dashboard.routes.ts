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
      {
        path: 'sell',
        loadComponent: () =>
          import('./modules/sell/sell.component').then(
            (m) => m.SellComponent
          ),
      },
      
      {
        path: '**',
        redirectTo: 'inventory',
      },
    ],
  },
];

export default DashboardRoute;
