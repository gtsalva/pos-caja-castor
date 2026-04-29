import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { cajaRoleGuard } from './core/guards/caja-role.guard';
import { shiftGuard } from './core/guards/shift.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard, cajaRoleGuard],
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'caja', pathMatch: 'full' },
      {
        path: 'caja',
        canActivate: [shiftGuard],
        loadChildren: () =>
          import('./features/caja/caja.routes').then(m => m.cajaRoutes),
      },
      {
        path: 'mis-ventas',
        loadComponent: () =>
          import('./features/mis-ventas/mis-ventas.component').then(m => m.MisVentasComponent),
      },
      {
        path: 'mi-rendimiento',
        loadComponent: () =>
          import('./features/mi-rendimiento/mi-rendimiento.component').then(m => m.MiRendimientoComponent),
      },
      {
        path: 'cierre-turno',
        canActivate: [authGuard, cajaRoleGuard],
        loadComponent: () =>
          import('./features/cierre-turno/cierre-turno.component').then(m => m.CierreTurnoComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'caja' },
];
