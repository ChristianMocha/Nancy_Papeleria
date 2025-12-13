import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { isDesktopGuard, isMobileGuard } from '../shared/guards/initial-redirect.guard';
import { desktopOnlyGuard, mobileOnlyGuard } from '../shared/guards/mobile-only.guard';

const DashboardRoute: Routes = [
  {
    path: '',
    loadComponent: () => {
      return import('./layout/layout.component').then((m) => m.LayoutComponent);
    },
    canActivate: [AuthGuard],
    children: [
      // { path: '', redirectTo: 'movements', pathMatch: 'full' },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
        canMatch: [isMobileGuard],
      },

      // 💻 Desktop → movements
      {
        path: '',
        redirectTo: 'movements',
        pathMatch: 'full',
        canMatch: [isDesktopGuard],
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
          import('./modules/sell/sell.component').then((m) => m.SellComponent),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./modules/employees/employees.component').then(
            (m) => m.EmployeesComponent
          ),
      },
      {
        path: 'service',
        loadComponent: () =>
          import(
            './modules/technical-service/technical-service.component'
          ).then((m) => m.TechnicalServiceComponent),
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
          import(
            './modules/inventory/components/product/product.component'
          ).then((m) => m.ProductComponent),
      },
      {
        path: 'product/add/:idCategory',
        loadComponent: () =>
          import(
            './modules/inventory/components/product/product.component'
          ).then((m) => m.ProductComponent),
      },
      {
        path: 'product/edit/:idCategory/:idProduct',
        loadComponent: () =>
          import(
            './modules/inventory/components/product/product.component'
          ).then((m) => m.ProductComponent),
      },
      {
        path: 'product/edit/:idCategory/:id',
        loadComponent: () =>
          import(
            './modules/inventory/components/product/product.component'
          ).then((m) => m.ProductComponent),
      },
      {
        path: 'home',
        canMatch: [mobileOnlyGuard],
        loadComponent: () =>
          import('./modules/home/home.component').then((m) => m.HomeComponent),
      },

      {
        path: '**',
        redirectTo: 'inventory',
      },
    ],
  },
];

export default DashboardRoute;
