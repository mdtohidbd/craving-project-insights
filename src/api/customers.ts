import { apiRequest } from "./client";
import { Customer, Contract } from "@/types";

export async function getCustomers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Customer[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  return apiRequest<Customer[]>(`/customers?${query.toString()}`);
}

export async function createCustomer(payload: {
  name: string;
  phone: string;
  address: string;
  photo_url?: string;
  notes?: string;
}): Promise<Customer> {
  return apiRequest<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCustomerById(
  id: string
): Promise<{ customer: Customer; contracts: Contract[] }> {
  return apiRequest<{ customer: Customer; contracts: Contract[] }>(`/customers/${id}`);
}
