import { Client } from './client.model';

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'VISACUOTAS';

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  unit_price: number;
  min_sale_price: number | null;
  custom_price?: number;
  stock: number;
  quantity: number;
}

export interface SalePaymentItem {
  payment_method: PaymentMethod;
  amount: number;
  payment_reference?: string;
}

export interface CreateSalePayload {
  payments: SalePaymentItem[];
  client_id: string;
  payment_document_url?: string;
  payment_receipt_url?: string;
  items: { product_id: string; quantity: number; unit_price: number }[];
}

export interface SalePayment {
  sale_payment_id: string;
  payment_method: PaymentMethod;
  amount: number;
  payment_reference: string | null;
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
  payments: SalePayment[];
  client: Client | null;
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
