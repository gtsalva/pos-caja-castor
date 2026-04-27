export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  unit_price: number;
  stock: number;
  quantity: number;
}

export interface CreateSalePayload {
  payment_method: PaymentMethod;
  client_id?: string;
  items: { product_id: string; quantity: number }[];
}

export interface Sale {
  sale_id: string;
  sale_number: string;
  payment_method: PaymentMethod;
  status: 'COMPLETED' | 'VOIDED';
  total: number;
  created_at: string;
  client: { client_id: string; full_name: string; nit: string | null } | null;
  salesperson: { user_id: string; full_name: string };
  items: {
    sale_item_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}
