import { Routes } from '@angular/router';

export const routes: Routes = [
    // { path: '', redirectTo: '/public/sign-in', pathMatch: 'full' },
    { path: '', redirectTo: '', pathMatch: 'full' },

    {
        path: '',
        loadChildren: () => import('./modules/dashboard/dashboard.routes'),
    },
    // {
    //     path: '**',
    //     redirectTo: '/public/sign-in',
    // },
];
