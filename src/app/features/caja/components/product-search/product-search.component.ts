import { Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule,
    NzEmptyModule,
    NzModalModule,
    NzButtonModule,
    NzSwitchModule,
  ],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.less',
})
export class ProductSearchComponent {
  readonly products = input<Product[]>([]);
  readonly isLoading = input(false);

  readonly queryChange = output<string>();
  readonly productSelected = output<Product>();

  readonly selectedForDetail = signal<Product | null>(null);
  readonly hideOutOfStock = signal(true);

  readonly outOfStockCount = computed(() =>
    this.products().filter(p => p.stock <= 0).length
  );

  readonly visibleProducts = computed(() =>
    this.hideOutOfStock()
      ? this.products().filter(p => p.stock > 0)
      : this.products()
  );

  onInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  openDetail(product: Product): void {
    this.selectedForDetail.set(product);
  }

  closeDetail(): void {
    this.selectedForDetail.set(null);
  }

  selectProduct(product: Product): void {
    if (product.stock > 0) this.productSelected.emit(product);
  }

  onCardAddClick(product: Product, event: MouseEvent): void {
    event.stopPropagation();
    this.selectProduct(product);
  }

  addDetailToCart(): void {
    const p = this.selectedForDetail();
    if (p) this.selectProduct(p);
    this.selectedForDetail.set(null);
  }
}
