import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'superadmin' | 'staff' | 'user';
export type StaffRole = 'manager' | 'cashier' | 'chef' | 'waiter' | 'delivery' | null;
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
    _id: string;
    name: string;
    username: string;
    phone: string;
    email: string;
    role: UserRole;
    staffRole: StaffRole;
    status: UserStatus;
    allowedModules: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<AuthUser>;
    register: (name: string, username: string, phone: string, email: string, password: string) => Promise<{ message: string }>;
    logout: () => void;
    isSuperAdmin: boolean;
    hasModule: (module: string) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'craving_auth_token';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setToken(storedToken);
            } else {
                // Token invalid, clear everything
                localStorage.removeItem(TOKEN_KEY);
                setUser(null);
                setToken(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name: string, username: string, phone: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, phone, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        // If the server auto-approved (first user / superadmin), log them in
        if (data.token && data.user?.status === 'approved') {
            localStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
            setUser(data.user);
        }

        return { message: data.message };
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
    };

    const isSuperAdmin = user?.role === 'superadmin';
    const hasModule = (module: string) =>
        isSuperAdmin || (user?.allowedModules ?? []).includes(module);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isSuperAdmin, hasModule, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
