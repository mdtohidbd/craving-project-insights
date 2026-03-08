import { apiRequest } from "./client";
import { DashboardSummary } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>("/dashboard/summary");
}
