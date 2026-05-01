import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ModuleConfig {
    id: string;
    label: string;
    enabled: boolean;
}

interface ModuleContextType {
    modules: ModuleConfig[];
    isModuleActive: (id: string) => boolean;
    updateModules: (updates: { id: string; enabled: boolean }[], token: string) => Promise<void>;
    isLoading: boolean;
    refreshModules: () => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
    const ctx = useContext(ModuleContext);
    if (!ctx) throw new Error('useModules must be used inside ModuleProvider');
    return ctx;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Optimistic defaults — all enabled — used before the API responds
const DEFAULT_MODULES: ModuleConfig[] = [
    { id: 'dashboard',     label: 'Dashboard',       enabled: true },
    { id: 'tables',        label: 'Tables',           enabled: true },
    { id: 'pos',           label: 'POS System',       enabled: true },
    { id: 'orders',        label: 'Orders',           enabled: true },
    { id: 'delivery',      label: 'Delivery',         enabled: true },
    { id: 'customers',     label: 'Customers',        enabled: true },
    { id: 'menu',          label: 'Menu Items',       enabled: true },
    { id: 'inventory',     label: 'Inventory',        enabled: true },
    { id: 'reservations',  label: 'Reservations',     enabled: true },
    { id: 'notifications', label: 'Notifications',    enabled: true },
    { id: 'messages',      label: 'Messages',         enabled: true },
    { id: 'settings',      label: 'Settings',         enabled: true },
    { id: 'users',         label: 'User Management',  enabled: true },
    { id: 'staff',         label: 'Staff Management',  enabled: true },
    { id: 'deliverymen',   label: 'Deliveryman Fleet', enabled: true },
    { id: 'modules',       label: 'Module Control',   enabled: true },
];

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
    const [modules, setModules] = useState<ModuleConfig[]>(DEFAULT_MODULES);
    const [isLoading, setIsLoading] = useState(true);

    const refreshModules = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/settings/modules`);
            if (res.ok) {
                const data: ModuleConfig[] = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Merge API data over defaults (keeps defaults for any missing modules)
                    setModules((prev) =>
                        prev.map((def) => {
                            const remote = data.find((d) => d.id === def.id);
                            return remote ?? def;
                        })
                    );
                }
            }
        } catch {
            // Silently keep defaults — system still works
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshModules();
    }, [refreshModules]);

    const isModuleActive = (id: string) => {
        const mod = modules.find((m) => m.id === id);
        return mod?.enabled ?? true; // default open if unknown
    };

    const updateModules = async (updates: { id: string; enabled: boolean }[], token: string) => {
        // Optimistic UI update
        setModules((prev) =>
            prev.map((m) => {
                const update = updates.find((u) => u.id === m.id);
                return update ? { ...m, enabled: update.enabled } : m;
            })
        );

        const res = await fetch(`${API_URL}/settings/modules`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ modules: updates }),
        });

        if (!res.ok) {
            // Roll back on failure
            await refreshModules();
            throw new Error('Failed to update modules');
        }

        const saved: ModuleConfig[] = await res.json();
        setModules((prev) =>
            prev.map((def) => {
                const remote = saved.find((d) => d.id === def.id);
                return remote ?? def;
            })
        );
    };

    return (
        <ModuleContext.Provider value={{ modules, isModuleActive, updateModules, isLoading, refreshModules }}>
            {children}
        </ModuleContext.Provider>
    );
};
