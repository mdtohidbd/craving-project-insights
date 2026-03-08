import { apiRequest } from "./client";
import { Contract, ContractWithCustomer, Installment, Customer } from "@/types";

export async function createContract(payload: {
  customer_id: string;
  product_name: string;
  product_price: number;
  sale_date: string;
  total_installments: number;
  notes?: string;
}): Promise<Contract> {
  return apiRequest<Contract>("/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getContracts(params?: {
  customer_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ContractWithCustomer[]> {
  const query = new URLSearchParams();
  if (params?.customer_id) query.append("customer_id", params.customer_id);
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  return apiRequest<ContractWithCustomer[]>(`/contracts?${query.toString()}`);
}

export async function getContractById(
  id: string
): Promise<{
  contract: Contract;
  customer: Customer;
  installments: Installment[];
}> {
  return apiRequest<{
    contract: Contract;
    customer: Customer;
    installments: Installment[];
  }>(`/contracts/${id}`);
}
