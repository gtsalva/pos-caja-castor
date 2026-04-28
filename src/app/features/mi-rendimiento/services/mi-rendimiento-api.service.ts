import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { MyPerformance } from '../models/incentive.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class MiRendimientoApiService {
  private readonly http = inject(HttpClient);

  getMyPerformance(): Observable<MyPerformance> {
    return this.http
      .get<ApiResponse<MyPerformance>>(`${environment.apiUrl}/incentives/my-performance`)
      .pipe(map(r => r.data));
  }
}
