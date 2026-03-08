import { apiRequest } from "./client";
import { InstallmentWithDetails, Installment, Contract } from "@/types";

export async function getDueTodayInstallments(): Promise<InstallmentWithDetails[]> {
  return apiRequest<InstallmentWithDetails[]>("/installments/due-today");
}

export async function getAllOverdueInstallments(): Promise<InstallmentWithDetails[]> {
  return apiRequest<InstallmentWithDetails[]>("/installments/overdue");
}

export async function markInstallmentPaid(
  id: string
): Promise<{
  installment: Installment;
  contract: Contract;
  smsLog: any;
}> {
  return apiRequest<{
    installment: Installment;
    contract: Contract;
    smsLog: any;
  }>(`/installments/${id}/mark-paid`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}
