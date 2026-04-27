export interface Client {
  client_id: string;
  nit: string | null;
  dpi: string | null;
  full_name: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_department: string | null;
  is_active: boolean;
}

export interface CreateClientPayload {
  full_name: string;
  phone?: string;
  nit?: string;
  email?: string;
  billing_address: string;
  billing_city: string;
  billing_department: string;
}

export interface ClientsResult {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}
