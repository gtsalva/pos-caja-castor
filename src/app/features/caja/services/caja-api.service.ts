import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedResult, Product } from '../../../shared/models/product.model';

interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class CajaApiService {
  private readonly http = inject(HttpClient);

  searchProducts(
    query?: string,
    category_id?: string,
    page = 1,
    limit = 20
  ): Observable<PaginatedResult<Product>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (query) params = params.set('query', query);
    if (category_id) params = params.set('category_id', category_id);

    return this.http
      .get<ApiListResponse<Product>>(`${environment.apiUrl}/products`, { params })
      .pipe(
        map(res => ({ data: res.data, total: res.total, page: res.page, limit: res.limit }))
      );
  }
}
