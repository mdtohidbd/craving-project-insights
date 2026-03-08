import { apiRequest } from "./client";
import { CollectionReport } from "@/types";

export async function getCollectionsReport(params: {
  from: string;
  to: string;
}): Promise<CollectionReport> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
  });

  return apiRequest<CollectionReport>(`/reports/collections?${query.toString()}`);
}
