// Get API URL from environment variable
// In Vite, use import.meta.env (not process.env)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Global logout handler - will be set by AuthContext
let globalLogoutHandler: (() => void) | null = null;

export function setLogoutHandler(handler: () => void) {
  globalLogoutHandler = handler;
}

export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchConfig } = config;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchConfig.headers,
  };

  if (requiresAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchConfig,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && requiresAuth) {
        // Clear tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
        // Trigger logout handler if available
        if (globalLogoutHandler) {
          globalLogoutHandler();
        } else {
          // Fallback: dispatch event for logout
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        
        throw new ApiError(401, "আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।");
      }
      
      throw new ApiError(response.status, await response.text());
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, "নেটওয়ার্ক সমস্যা হয়েছে");
  }
}
