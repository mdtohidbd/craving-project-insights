import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User, AuthResponse } from "@/types";
import { loginOwner, loginEmployee } from "@/api/auth";
import { setLogoutHandler } from "@/api/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsOwner: (username: string, password: string) => Promise<void>;
  loginAsEmployee: (username: string, pin: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    // Set up logout handler for API client
    const handleAutoLogout = () => {
      handleLogout(true);
    };
    setLogoutHandler(handleAutoLogout);
    logoutHandlerRef.current = handleAutoLogout;

    // Listen for logout events (fallback)
    const handleLogoutEvent = () => {
      handleLogout(true);
    };
    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("auth:logout", handleLogoutEvent);
      setLogoutHandler(() => {}); // Clear handler on unmount
    };
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);
  };

  const loginAsOwner = async (username: string, password: string) => {
    const response = await loginOwner(username, password);
    handleAuthResponse(response);
  };

  const loginAsEmployee = async (username: string, pin: string) => {
    const response = await loginEmployee(username, pin);
    handleAuthResponse(response);
  };

  const handleLogout = (isAutoLogout: boolean = false) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    
    if (isAutoLogout) {
      toast.error("আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।");
    }
    
    // Navigate to login page using window.location
    // This works even outside Router context
    // Only redirect if not already on the home/login page
    const currentPath = window.location.pathname;
    if (currentPath !== "/" && !currentPath.startsWith("/login")) {
      window.location.href = "/";
    }
  };

  const logout = () => {
    handleLogout(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAsOwner,
        loginAsEmployee,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
