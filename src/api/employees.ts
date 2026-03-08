import { apiRequest } from "./client";
import { Employee } from "@/types";

export async function getEmployees(): Promise<Employee[]> {
  return apiRequest<Employee[]>("/employees");
}

export async function createEmployee(payload: {
  name: string;
  phone: string;
  roleLabel: string;
  username: string;
  pin: string;
  photo_url?: string;
}): Promise<Employee> {
  return apiRequest<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(
  id: string,
  payload: {
    name?: string;
    phone?: string;
    roleLabel?: string;
    pin?: string;
    status?: "ACTIVE" | "INACTIVE";
    photo_url?: string;
  }
): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
