import { PaymentMethod } from '../../../shared/models/sale.model';

export type CustomOrderStatus =
  'DRAFT' | 'SENT' | 'APPROVED' | 'IN_PRODUCTION' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface CustomOrderItem {
  custom_order_item_id: string;
  description:  string;
  quantity:     number;
  unit_price:   number;
  notes:        string | null;
  subtotal:     number;
}

export interface CustomOrderPayment {
  custom_order_payment_id: string;
  payment_method:    PaymentMethod;
  amount:            number;
  payment_reference: string | null;
  notes:             string | null;
  received_by:       { user_id: string; full_name: string };
  created_at:        string;
}

export interface CustomOrder {
  custom_order_id:  string;
  order_number:     string;
  status:           CustomOrderStatus;
  salesperson:      { user_id: string; full_name: string };
  client:           { client_id: string; full_name: string } | null;
  client_name:      string | null;
  client_phone:     string | null;
  client_email:     string | null;
  client_notes:     string | null;
  delivery_date:    string | null;
  total:            number;
  total_paid:       number;
  items:            CustomOrderItem[];
  payments:         CustomOrderPayment[];
  created_at:       string;
  updated_at:       string;
}

export interface CreateCustomOrderItemPayload {
  category_id?: string;
  description:  string;
  quantity:     number;
  unit_price:   number;
  notes?:       string;
}

export interface CreateCustomOrderPayload {
  client_id?:            string;
  client_name?:          string;
  client_phone?:         string;
  client_email?:         string;
  client_notes?:         string;
  supplier_id?:          string;
  delivery_date?:        string;
  agreed_price?:         number;
  counts_for_incentive?: boolean;
  items:                 CreateCustomOrderItemPayload[];
}

export interface RegisterPaymentPayload {
  payment_method:     PaymentMethod;
  amount:             number;
  payment_reference?: string;
  notes?:             string;
}
