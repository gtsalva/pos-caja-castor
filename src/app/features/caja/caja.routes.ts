import { Routes } from '@angular/router';

export const cajaRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./caja-shell/caja-shell.component').then(m => m.CajaShellComponent),
  },
];
