import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ShiftClose } from '../models/shift.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ShiftApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shifts`;

  getMyShiftToday(): Observable<ShiftClose | null> {
    return this.http
      .get<ApiResponse<ShiftClose>>(`${this.base}/my`)
      .pipe(
        map(res => res.data),
        catchError(() => of(null)),
      );
  }

  closeShift(notes?: string): Observable<ShiftClose> {
    return this.http
      .post<ApiResponse<ShiftClose>>(`${this.base}/close`, { notes })
      .pipe(map(res => res.data));
  }
}
