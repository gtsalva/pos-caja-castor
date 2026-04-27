import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedResult, Product } from '../../../shared/models/product.model';
import { Client, ClientsResult, CreateClientPayload } from '../../../shared/models/client.model';
import { CreateSalePayload, Sale } from '../../../shared/models/sale.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

interface ApiPaginatedResponse<T> {
  data: PaginatedResult<T>;
  message: string;
  statusCode: number;
}

interface ApiClientsResponse {
  data: ClientsResult;
  message: string;
  statusCode: number;
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
      .get<ApiPaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params })
      .pipe(map(res => res.data));
  }

  searchClients(search: string): Observable<Client[]> {
    const params = new HttpParams().set('search', search);
    return this.http
      .get<ApiClientsResponse>(`${environment.apiUrl}/clients`, { params })
      .pipe(map(res => res.data.data));
  }

  createClient(payload: CreateClientPayload): Observable<Client> {
    return this.http
      .post<ApiResponse<Client>>(`${environment.apiUrl}/clients`, payload)
      .pipe(map(res => res.data));
  }

  createSale(payload: CreateSalePayload): Observable<Sale> {
    return this.http
      .post<ApiResponse<Sale>>(`${environment.apiUrl}/sales`, payload)
      .pipe(map(res => res.data));
  }

  getSale(sale_id: string): Observable<Sale> {
    return this.http
      .get<ApiResponse<Sale>>(`${environment.apiUrl}/sales/${sale_id}`)
      .pipe(map(res => res.data));
  }

  uploadVoucher(blob: Blob): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', blob, 'voucher.pdf');
    return this.http
      .post<ApiResponse<{ url: string }>>(`${environment.apiUrl}/storage/upload`, form)
      .pipe(map(res => res.data));
  }

  getDocumentBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  uploadReceipt(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http
      .post<ApiResponse<{ url: string }>>(`${environment.apiUrl}/storage/upload-receipt`, form)
      .pipe(map(res => res.data));
  }

  getMySales(from_date?: string, page = 1, limit = 50): Observable<PaginatedResult<Sale>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (from_date) params = params.set('from_date', from_date);

    return this.http
      .get<ApiPaginatedResponse<Sale>>(`${environment.apiUrl}/sales/my`, { params })
      .pipe(map(res => res.data));
  }
}
