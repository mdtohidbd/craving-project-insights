import { apiRequest } from "./client";
import { AuthResponse, User } from "@/types";

export async function loginOwner(username: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/owner/login", {
    method: "POST",
    requiresAuth: false,
    body: JSON.stringify({ username, password }),
  });
}

export async function loginEmployee(username: string, pin: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/employee/login", {
    method: "POST",
    requiresAuth: false,
    body: JSON.stringify({ username, pin }),
  });
}

export interface UpdateOwnerProfilePayload {
  name?: string;
  username?: string;
  password?: string;
  currentPassword?: string;
}

export async function updateOwnerProfile(payload: UpdateOwnerProfilePayload): Promise<User> {
  return apiRequest<User>("/auth/owner/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
