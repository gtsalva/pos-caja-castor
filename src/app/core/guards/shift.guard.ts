import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ShiftApiService } from '../../features/caja/services/shift-api.service';

export const shiftGuard: CanActivateFn = () => {
  const shiftApi = inject(ShiftApiService);
  const router = inject(Router);

  return shiftApi.getMyShiftToday().pipe(
    map((shift) => {
      if (shift && shift.status === 'CLOSED') {
        return router.createUrlTree(['/cierre-turno']);
      }
      return true;
    }),
    catchError(() => of(true)),
  );
};
