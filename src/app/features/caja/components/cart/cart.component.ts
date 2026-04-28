import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
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

  removeItem(item: CartItem): void {
    this.cart.removeItem(item.product_id);
  }

  confirm(): void {
    this.confirmRequested.emit();
  }
}
