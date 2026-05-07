import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { QuetzalesPipe } from '../../../../shared/pipes/quetzales.pipe';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    FormsModule,
    QuetzalesPipe,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule,
    NzEmptyModule,
    NzModalModule,
    NzButtonModule,
    NzSwitchModule,
    NzInputNumberModule,
  ],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.less',
})
export class ProductSearchComponent {
  readonly products = input<Product[]>([]);
  readonly isLoading = input(false);

  readonly queryChange = output<string>();
  readonly productSelected = output<{ product: Product; custom_price: number }>();

  readonly selectedForDetail = signal<Product | null>(null);
  readonly negotiatedPrice = signal<number>(0);
  readonly hideOutOfStock = signal(true);

  readonly outOfStockCount = computed(() =>
    this.products().filter(p => p.stock <= 0).length
  );

  readonly visibleProducts = computed(() =>
    this.hideOutOfStock()
      ? this.products().filter(p => p.stock > 0)
      : this.products()
  );

  readonly priceIsNegotiated = computed(() => {
    const p = this.selectedForDetail();
    return p != null && this.negotiatedPrice() !== Number(p.unit_price);
  });

  readonly priceIsValid = computed(() => {
    const p = this.selectedForDetail();
    if (!p || p.min_sale_price == null) return true;
    return this.negotiatedPrice() >= Number(p.min_sale_price);
  });

  onInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  openDetail(product: Product): void {
    this.selectedForDetail.set(product);
    this.negotiatedPrice.set(Number(product.unit_price));
  }

  closeDetail(): void {
    this.selectedForDetail.set(null);
  }

  adjustPrice(delta: number): void {
    const p = this.selectedForDetail();
    if (!p) return;
    const min = p.min_sale_price != null ? Number(p.min_sale_price) : 0;
    const next = Math.round((this.negotiatedPrice() + delta) * 100) / 100;
    this.negotiatedPrice.set(Math.max(min, next));
  }

  setNegotiatedPrice(val: number | null): void {
    if (val == null) return;
    this.negotiatedPrice.set(Math.round(val * 100) / 100);
  }

  selectProduct(product: Product): void {
    if (product.stock > 0) {
      this.productSelected.emit({ product, custom_price: Number(product.unit_price) });
    }
  }

  onCardAddClick(product: Product, event: MouseEvent): void {
    event.stopPropagation();
    this.selectProduct(product);
  }

  addDetailToCart(): void {
    const p = this.selectedForDetail();
    if (!p || p.stock <= 0 || !this.priceIsValid()) return;
    this.productSelected.emit({ product: p, custom_price: this.negotiatedPrice() });
    this.selectedForDetail.set(null);
  }
}
