import { Routes } from '@angular/router';

export const cotizacionesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./cotizaciones-list/cotizaciones-list.component').then(m => m.CotizacionesListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./cotizacion-nueva/cotizacion-nueva.component').then(m => m.CotizacionNuevaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./cotizacion-detail/cotizacion-detail.component').then(m => m.CotizacionDetailComponent),
  },
];
