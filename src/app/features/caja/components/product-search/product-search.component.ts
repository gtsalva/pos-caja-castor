import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Product } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [NzInputModule, NzIconModule, NzSpinModule, NzTagModule, NzEmptyModule, CurrencyPipe],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.less',
})
export class ProductSearchComponent {
  readonly products = input<Product[]>([]);
  readonly isLoading = input(false);

  readonly queryChange = output<string>();
  readonly productSelected = output<Product>();

  onInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  selectProduct(product: Product): void {
    if (product.stock > 0) this.productSelected.emit(product);
  }
}
