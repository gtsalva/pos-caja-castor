export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  min_sale_price: number | null;
  stock: number;
  min_stock: number;
  is_active: boolean;
  category_id: string | null;
  category: { category_id: string; name: string } | null;
  image_url: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
