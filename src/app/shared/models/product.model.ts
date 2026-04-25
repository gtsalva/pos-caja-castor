export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
  category_id: string | null;
  category: { category_id: string; name: string } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
