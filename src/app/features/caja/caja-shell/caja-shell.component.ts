import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CajaApiService } from '../services/caja-api.service';
import { CartService } from '../services/cart.service';
import { PaginatedResult, Product } from '../../../shared/models/product.model';
import { Sale } from '../../../shared/models/sale.model';
import { ProductSearchComponent } from '../components/product-search/product-search.component';
import { CartComponent } from '../components/cart/cart.component';
import { ConfirmSaleModalComponent } from '../components/confirm-sale-modal/confirm-sale-modal.component';

@Component({
  selector: 'app-caja-shell',
  standalone: true,
  imports: [
    ProductSearchComponent,
    CartComponent,
    ConfirmSaleModalComponent,
    NzDrawerModule,
    NzButtonModule,
    NzBadgeModule,
    NzIconModule,
  ],
  templateUrl: './caja-shell.component.html',
  styleUrl: './caja-shell.component.less',
})
export class CajaShellComponent implements OnInit {
  private readonly api = inject(CajaApiService);
  readonly cart = inject(CartService);
  private readonly query$ = new Subject<string>();

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly cartVisible = signal(false);
  readonly confirmVisible = signal(false);

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

  onProductSelected(event: { product: Product; custom_price: number }): void {
    this.cart.addProduct(event.product, event.custom_price);
    if (!this.cartVisible()) this.cartVisible.set(true);
  }

  openCart(): void {
    this.cartVisible.set(true);
  }

  openConfirmModal(): void {
    this.cartVisible.set(false);
    this.confirmVisible.set(true);
  }

  onSaleCompleted(_sale: Sale): void {
    this.confirmVisible.set(false);
  }
}
