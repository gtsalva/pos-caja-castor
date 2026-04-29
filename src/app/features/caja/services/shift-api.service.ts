import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ShiftClose } from '../models/shift.model';
import { ApiResponse } from '../../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class ShiftApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shifts`;

  getMyShiftToday(): Observable<ShiftClose | null> {
    return this.http
      .get<ApiResponse<ShiftClose | null>>(`${this.base}/my`)
      .pipe(map(res => res.data));
  }

  closeShift(notes?: string): Observable<ShiftClose> {
    return this.http
      .post<ApiResponse<ShiftClose>>(`${this.base}/close`, { notes })
      .pipe(map(res => res.data));
  }
}
