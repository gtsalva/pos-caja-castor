import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { QuetzalesPipe } from '../../../../shared/pipes/quetzales.pipe';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../../../shared/models/sale.model';
import { ClientSelectorComponent } from '../client-selector/client-selector.component';
import { Client } from '../../../../shared/models/client.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    QuetzalesPipe,
    FormsModule,
    NzListModule,
    NzInputNumberModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzEmptyModule,
    NzToolTipModule,
    ClientSelectorComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.less',
})
export class CartComponent {
  readonly confirmRequested = output<void>();

  readonly cart = inject(CartService);

  onClientSelected(client: Client | null): void {
    this.cart.setClient(client);
  }

  onQuantityChange(item: CartItem, qty: number): void {
    this.cart.setQuantity(item.product_id, qty);
  }

  onPriceChange(item: CartItem, price: number | null): void {
    if (price != null) this.cart.setCustomPrice(item.product_id, price);
  }

  adjustItemPrice(item: CartItem, delta: number): void {
    const current = item.custom_price ?? item.unit_price;
    const min = item.min_sale_price ?? 0;
    const next = Math.round((current + delta) * 100) / 100;
    this.cart.setCustomPrice(item.product_id, Math.max(min, next));
  }

  removeItem(item: CartItem): void {
    this.cart.removeItem(item.product_id);
  }

  confirm(): void {
    this.confirmRequested.emit();
  }
}
