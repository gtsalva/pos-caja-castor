import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CajaApiService } from '../services/caja-api.service';
import { PaginatedResult, Product } from '../../../shared/models/product.model';
import { ProductSearchComponent } from '../components/product-search/product-search.component';

@Component({
  selector: 'app-caja-shell',
  standalone: true,
  imports: [ProductSearchComponent],
  template: `
    <app-product-search
      [products]="products()"
      [isLoading]="isLoading()"
      (queryChange)="onQuery($event)"
    />
  `,
})
export class CajaShellComponent implements OnInit {
  private readonly api = inject(CajaApiService);
  private readonly query$ = new Subject<string>();

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);

  constructor() {
    this.query$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q): ReturnType<CajaApiService['searchProducts']> => {
          this.isLoading.set(true);
          return this.api.searchProducts(q || undefined);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res: PaginatedResult<Product>) => {
          this.products.set(res.data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.api.searchProducts().subscribe({
      next: res => {
        this.products.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onQuery(q: string): void {
    this.query$.next(q);
  }
}
