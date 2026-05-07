import { Injectable, computed, signal } from '@angular/core';
import { CartItem, PaymentMethod, CreateSalePayload, SalePaymentItem } from '../../../shared/models/sale.model';
import { Product } from '../../../shared/models/product.model';
import { Client } from '../../../shared/models/client.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  private readonly _client = signal<Client | null>(null);

  readonly items = this._items.asReadonly();
  readonly client = this._client.asReadonly();

  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + (i.custom_price ?? i.unit_price) * i.quantity, 0)
  );

  readonly itemCount = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  readonly hasInvalidPrices = computed(() =>
    this._items().some(i => {
      const effective = i.custom_price ?? i.unit_price;
      return i.min_sale_price != null && effective < i.min_sale_price;
    })
  );

  readonly canConfirm = computed(() =>
    !this.isEmpty() && this._client() !== null && !this.hasInvalidPrices()
  );

  addProduct(product: Product, custom_price?: number): void {
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
      const listPrice = Number(product.unit_price);
      const negotiated = custom_price != null ? custom_price : listPrice;
      return [...items, {
        product_id: product.product_id,
        sku: product.sku,
        name: product.name,
        unit_price: listPrice,
        min_sale_price: product.min_sale_price != null ? Number(product.min_sale_price) : null,
        custom_price: negotiated !== listPrice ? negotiated : undefined,
        stock: product.stock,
        quantity: 1,
      }];
    });
  }

  setCustomPrice(product_id: string, price: number): void {
    this._items.update(items =>
      items.map(i => {
        if (i.product_id !== product_id) return i;
        const rounded = Math.round(price * 100) / 100;
        return { ...i, custom_price: rounded !== i.unit_price ? rounded : undefined };
      })
    );
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

  buildPayload(
    payments: SalePaymentItem[],
    payment_document_url?: string,
    payment_receipt_url?: string,
  ): CreateSalePayload {
    const client = this._client();
    if (!client) throw new Error('buildPayload() called with no client set');
    return {
      payments,
      client_id: client.client_id,
      ...(payment_document_url ? { payment_document_url } : {}),
      ...(payment_receipt_url ? { payment_receipt_url } : {}),
      items: this._items().map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.custom_price ?? i.unit_price,
      })),
    };
  }
}
