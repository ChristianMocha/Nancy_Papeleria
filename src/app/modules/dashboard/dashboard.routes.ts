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
        path: 'employees',
        loadComponent: () =>
          import('./modules/employees/employees.component').then(
            (m) => m.EmployeesComponent
          ),
      },
      {
        path: 'movements',
        loadComponent: () =>
          import('./modules/movements/movements.component').then(
            (m) => m.MovementsComponent
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./modules/statistics/statistics.component').then(
            (m) => m.StatisticsComponent
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./modules/clients/clients.component').then(
            (m) => m.ClientsComponent
          ),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./modules/suppliers/suppliers.component').then(
            (m) => m.SuppliersComponent
          ),
      },
      {
        path: 'product/add',
        loadComponent: () =>
          import('./modules/inventory/components/product/product.component').then(
            (m) => m.ProductComponent
          ),
      },
      {
        path: 'product/add/:idCategory',
        loadComponent: () =>
          import('./modules/inventory/components/product/product.component').then(
            (m) => m.ProductComponent
          ),
      },
      {
        path: 'product/edit/:id',
        loadComponent: () =>
          import('./modules/inventory/components/product/product.component').then(
            (m) => m.ProductComponent
          ),
      },
      {
        path: 'product/edit/:idCategory/:id',
        loadComponent: () =>
          import('./modules/inventory/components/product/product.component').then(
            (m) => m.ProductComponent
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
