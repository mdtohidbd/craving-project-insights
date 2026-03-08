import { apiRequest } from "./client";
import { ShopSettings, SmsSettings } from "@/types";

export async function getShopSettings(): Promise<ShopSettings> {
  return apiRequest<ShopSettings>("/settings/shop");
}

export async function updateShopSettings(payload: Partial<ShopSettings>): Promise<ShopSettings> {
  return apiRequest<ShopSettings>("/settings/shop", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getSmsSettings(): Promise<SmsSettings> {
  return apiRequest<SmsSettings>("/settings/sms");
}

export async function updateSmsSettings(payload: Partial<SmsSettings>): Promise<SmsSettings> {
  return apiRequest<SmsSettings>("/settings/sms", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
