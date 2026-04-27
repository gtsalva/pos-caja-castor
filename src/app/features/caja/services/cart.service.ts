import { Injectable, computed, signal } from '@angular/core';
import { CartItem, PaymentMethod, CreateSalePayload } from '../../../shared/models/sale.model';
import { Product } from '../../../shared/models/product.model';
import { Client } from '../../../shared/models/client.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  private readonly _client = signal<Client | null>(null);

  readonly items = this._items.asReadonly();
  readonly client = this._client.asReadonly();

  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  );

  readonly itemCount = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  addProduct(product: Product): void {
    if (product.stock <= 0) return;
    this._items.update(items => {
      const idx = items.findIndex(i => i.product_id === product.product_id);
      if (idx >= 0) {
        return items.map((item, i) => {
          if (i !== idx) return item;
          const newQty = Math.min(item.quantity + 1, product.stock);
          return { ...item, quantity: newQty };
        });
      }
      return [...items, {
        product_id: product.product_id,
        sku: product.sku,
        name: product.name,
        unit_price: Number(product.unit_price),
        stock: product.stock,
        quantity: 1,
      }];
    });
  }

  setQuantity(product_id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(product_id);
      return;
    }
    this._items.update(items =>
      items.map(i => i.product_id === product_id ? { ...i, quantity } : i)
    );
  }

  removeItem(product_id: string): void {
    this._items.update(items => items.filter(i => i.product_id !== product_id));
  }

  setClient(client: Client | null): void {
    this._client.set(client);
  }

  clear(): void {
    this._items.set([]);
    this._client.set(null);
  }

  buildPayload(payment_method: PaymentMethod): CreateSalePayload {
    const client = this._client();
    return {
      payment_method,
      ...(client ? { client_id: client.client_id } : {}),
      items: this._items().map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    };
  }
}
