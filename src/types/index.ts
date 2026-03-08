export type UserRole = "OWNER" | "EMPLOYEE";

export interface User {
  _id: string;
  name: string;
  username?: string;
  role: UserRole;
  shop_id: string;
  roleLabel?: string;
  photo_url?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  photo_url?: string;
  notes?: string;
}

export interface Contract {
  _id: string;
  customer_id: string;
  product_name: string;
  product_price: number;
  sale_date: string;
  total_installments: number;
  paid_installments: number;
  remaining_installments: number;
  total_paid_amount: number;
  remaining_amount: number;
  base_installment_amount: number;
  status: string;
  next_installment_date?: string | null;
  notes?: string;
}

export interface Installment {
  _id: string;
  contract_id: string;
  installment_no: number;
  due_date: string;
  amount: number;
  status: "UPCOMING" | "PAID" | "OVERDUE";
  paid_date?: string;
  paid_by_name?: string;
}

export interface ContractWithCustomer {
  contract: Contract;
  customer: Customer;
  ui_status: "GREEN" | "YELLOW" | "RED";
}

export interface InstallmentWithDetails {
  installment: Installment;
  customer: Customer;
  contract: {
    _id: string;
    product_name: string;
    remaining_installments: number;
    remaining_amount: number;
  };
}

export interface Employee {
  _id: string;
  name: string;
  phone: string;
  roleLabel: string;
  username: string;
  status: "ACTIVE" | "INACTIVE";
  photo_url?: string;
}

export interface DashboardSummary {
  total_customers: number;
  total_sales_amount: number;
  total_outstanding_amount: number;
}

export interface CollectionReportItem {
  installment_id: string;
  customer_name: string;
  phone: string;
  product_name: string;
  installment_no: number;
  amount: number;
  paid_date: string;
  paid_by_name: string;
}

export interface CollectionReport {
  total_collected: number;
  count: number;
  customer_count?: number;
  items: CollectionReportItem[];
}

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
}

export interface SmsSettings {
  sms_enabled: boolean;
  sms_provider: string;
  sms_api_key: string;
  sms_sender_id: string;
}
