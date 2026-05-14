import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface GeneralSettings {
    websiteName: string;
    deliveryFee: number;
    smsNumber: string;
}

interface SettingsContextType {
    settings: GeneralSettings;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
    updateSettings: (updates: Partial<GeneralSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_SETTINGS: GeneralSettings = {
    websiteName: 'Craving',
    deliveryFee: 50,
    smsNumber: '',
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    websiteName: data.websiteName || DEFAULT_SETTINGS.websiteName,
                    deliveryFee: data.deliveryFee ?? DEFAULT_SETTINGS.deliveryFee,
                    smsNumber: data.smsNumber || DEFAULT_SETTINGS.smsNumber,
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);

    useEffect(() => {
        if (settings.websiteName) {
            document.title = `${settings.websiteName} | Fine Dining Restaurant`;
            
            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', `Experience exquisite flavors at ${settings.websiteName}. Our handpicked selection of bold and delicious food will leave you craving for more.`);
            }

            // Update Open Graph tags
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', `${settings.websiteName} | Fine Dining Restaurant`);
            }
            
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) {
                ogDescription.setAttribute('content', `Experience exquisite flavors at ${settings.websiteName}. Our handpicked selection of bold and delicious food will leave you craving for more.`);
            }
        }
    }, [settings.websiteName]);

    const updateSettings = async (updates: Partial<GeneralSettings>) => {
        // Optimistic update
        setSettings(prev => ({ ...prev, ...updates }));

        try {
            const res = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                throw new Error('Failed to update settings');
            }
            
            const data = await res.json();
            setSettings({
                websiteName: data.websiteName,
                deliveryFee: data.deliveryFee,
                smsNumber: data.smsNumber,
            });
        } catch (error) {
            console.error('Update settings failed:', error);
            // Rollback on error
            await refreshSettings();
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, refreshSettings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
