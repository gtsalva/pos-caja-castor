export interface IncentivePeriodSummary {
  period_id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal_amount: number;
  commission_rate: number;
  is_active: boolean;
}

export interface MyPerformance {
  period: IncentivePeriodSummary | null;
  amount_sold: number;
  transaction_count: number;
  commission_earned: number;
  goal_pct: number;
  is_liquidated: boolean;
  liquidated_at: string | null;
}
