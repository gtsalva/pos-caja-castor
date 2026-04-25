import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const cajaRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // All 4 roles (ADMIN, MANAGER, CASHIER, SALESPERSON) may access pos-caja.
  // Check token presence (synchronous signal) rather than currentUser role,
  // which may not have propagated at the time this guard runs right after login.
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};
