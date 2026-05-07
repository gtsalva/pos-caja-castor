export interface Supplier {
  supplier_id:  string;
  name:         string;
  contact_name: string | null;
  phone:        string | null;
  email:        string | null;
  address:      string | null;
  notes:        string | null;
  is_active:    boolean;
}

export interface CreateSupplierPayload {
  name:         string;
  contact_name?: string;
  phone?:       string;
  email?:       string;
  address?:     string;
  notes?:       string;
}

export interface SuppliersResult {
  data:  Supplier[];
  total: number;
  page:  number;
  limit: number;
}
