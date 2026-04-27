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
  client_id: string;
  payment_reference?: string;
  payment_document_url?: string;
  payment_receipt_url?: string;
  items: { product_id: string; quantity: number }[];
}

export interface Sale {
  sale_id: string;
  sale_number: string;
  payment_method: PaymentMethod;
  status: 'COMPLETED' | 'VOIDED';
  total: number;
  payment_reference: string | null;
  payment_document_url: string | null;
  payment_receipt_url: string | null;
  created_at: string;
  client: { client_id: string; full_name: string; nit: string | null; billing_address: string | null } | null;
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
