import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  CustomOrder, CreateCustomOrderPayload, RegisterPaymentPayload,
} from '../models/custom-order.model';
import { Supplier, CreateSupplierPayload, SuppliersResult } from '../../../shared/models/supplier.model';

interface ApiResponse<T>          { data: T; message: string; statusCode: number; }
interface PaginatedResult<T>      { data: T[]; total: number; page: number; limit: number; }
interface ApiPaginatedResponse<T> { data: PaginatedResult<T>; message: string; statusCode: number; }

export interface Category { category_id: string; name: string; is_active: boolean; }

@Injectable({ providedIn: 'root' })
export class CotizacionesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/custom-orders`;

  getMias(salesperson_id: string, page = 1, limit = 20): Observable<PaginatedResult<CustomOrder>> {
    const params = new HttpParams()
      .set('salesperson_id', salesperson_id)
      .set('exclude_cancelled', 'true')
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ApiPaginatedResponse<CustomOrder>>(this.base, { params }).pipe(map(r => r.data));
  }

  getOne(id: string): Observable<CustomOrder> {
    return this.http.get<ApiResponse<CustomOrder>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  create(payload: CreateCustomOrderPayload): Observable<CustomOrder> {
    return this.http.post<ApiResponse<CustomOrder>>(this.base, payload).pipe(map(r => r.data));
  }

  registerPayment(id: string, payload: RegisterPaymentPayload): Observable<CustomOrder> {
    return this.http.post<ApiResponse<CustomOrder>>(`${this.base}/${id}/payments`, payload).pipe(map(r => r.data));
  }

  cancel(id: string): Observable<CustomOrder> {
    return this.http.patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/cancel`, {}).pipe(map(r => r.data));
  }

  // Suppliers
  searchSuppliers(search: string): Observable<Supplier[]> {
    const params = new HttpParams().set('search', search).set('is_active', 'true').set('limit', '20');
    return this.http.get<ApiResponse<SuppliersResult>>(`${environment.apiUrl}/suppliers`, { params })
      .pipe(map(r => r.data.data));
  }

  createSupplier(payload: CreateSupplierPayload): Observable<Supplier> {
    return this.http.post<ApiResponse<Supplier>>(`${environment.apiUrl}/suppliers`, payload)
      .pipe(map(r => r.data));
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`)
      .pipe(map(r => r.data));
  }
}
