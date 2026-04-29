export type ShiftStatus = 'CLOSED' | 'REOPENED';

export interface ShiftClose {
  shift_close_id: string;
  salesperson_id: string;
  shift_date: string;
  status: ShiftStatus;
  total_sales: number;
  cash_total: number;
  card_total: number;
  transfer_total: number;
  transaction_count: number;
  closed_by_id: string;
  notes: string | null;
  reopened_at: string | null;
  reconciliation: unknown | null;
  created_at: string;
}
