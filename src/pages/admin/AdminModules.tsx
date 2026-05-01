import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useModules, ModuleConfig } from '../../context/ModuleContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    LayoutDashboard, Table, CreditCard, ShoppingCart, Truck,
    Users, List, Package, Calendar, Bell, MessageSquare,
    Settings, ShieldCheck, ToggleLeft, ToggleRight, Layers,
    AlertTriangle, RefreshCw, Loader2, Eye, EyeOff
} from 'lucide-react';

// Icon + description registry for each module
const MODULE_META: Record<string, { icon: React.ReactNode; description: string; color: string; critical?: boolean }> = {
    dashboard:     { icon: <LayoutDashboard className="w-5 h-5" />, description: 'Overview, sales charts, and inventory snapshots.', color: 'text-blue-500' },
    tables:        { icon: <Table className="w-5 h-5" />, description: 'Floor plan, table status and dine-in management.', color: 'text-teal-500' },
    pos:           { icon: <CreditCard className="w-5 h-5" />, description: 'Point of Sale system for in-person orders.', color: 'text-violet-500' },
    orders:        { icon: <ShoppingCart className="w-5 h-5" />, description: 'Incoming orders list, status updates, printing.', color: 'text-orange-500' },
    delivery:      { icon: <Truck className="w-5 h-5" />, description: 'Delivery orders and deliveryman assignment.', color: 'text-amber-500' },
    customers:     { icon: <Users className="w-5 h-5" />, description: 'Customer profiles, order history, SMS messaging.', color: 'text-sky-500' },
    menu:          { icon: <List className="w-5 h-5" />, description: 'Menu items — create, edit, images, pricing.', color: 'text-primary' },
    inventory:     { icon: <Package className="w-5 h-5" />, description: 'Stock levels, low-stock alerts and tracking.', color: 'text-rose-500' },
    reservations:  { icon: <Calendar className="w-5 h-5" />, description: 'Table booking requests and scheduling.', color: 'text-indigo-500' },
    notifications: { icon: <Bell className="w-5 h-5" />, description: 'System alerts, order events and activity log.', color: 'text-yellow-500' },
    messages:      { icon: <MessageSquare className="w-5 h-5" />, description: 'Inbound customer messages and SMS log.', color: 'text-pink-500' },
    settings:      { icon: <Settings className="w-5 h-5" />, description: 'Delivery fee, SMS config, general settings.', color: 'text-neutral-500', critical: true },
    users:         { icon: <ShieldCheck className="w-5 h-5" />, description: 'Staff accounts, roles, approval workflow.', color: 'text-purple-500', critical: true },
    modules:       { icon: <Layers className="w-5 h-5" />, description: 'This panel — global module enable/disable control.', color: 'text-primary', critical: true },
};

const AdminModules = () => {
    const { modules, updateModules, isLoading, refreshModules } = useModules();
    const { token } = useAuth();
    const [saving, setSaving] = useState<string | null>(null);
    const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
    const [isSavingAll, setIsSavingAll] = useState(false);

    const hasChanges = Object.keys(pendingChanges).length > 0;

    const getEffectiveState = (id: string) => {
        if (id in pendingChanges) return pendingChanges[id];
        return modules.find((m) => m.id === id)?.enabled ?? true;
    };

    const handleToggle = (id: string) => {
        const current = getEffectiveState(id);
        // Compare to saved state
        const savedState = modules.find((m) => m.id === id)?.enabled ?? true;
        const newState = !current;

        if (newState === savedState) {
            // Back to original — remove from pending
            setPendingChanges((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } else {
            setPendingChanges((prev) => ({ ...prev, [id]: newState }));
        }
    };

    const saveAll = async () => {
        if (!hasChanges) return;
        setIsSavingAll(true);
        try {
            const updates = Object.entries(pendingChanges).map(([id, enabled]) => ({ id, enabled }));
            await updateModules(updates, token!);
            setPendingChanges({});
            toast.success('Module settings saved successfully');
        } catch {
            toast.error('Failed to save module settings');
        } finally {
            setIsSavingAll(false);
        }
    };

    const discardChanges = () => setPendingChanges({});

    const enabledCount = modules.filter((m) => {
        if (m.id in pendingChanges) return pendingChanges[m.id];
        return m.enabled;
    }).length;

    return (
        <AdminLayout title="Module Control">
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-neutral-900">Module Control</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            Globally enable or disable features for the entire restaurant.
                            Staff permissions are checked after global settings.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={refreshModules}
                            className="p-2.5 rounded-[8px] border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {hasChanges && (
                            <button
                                onClick={discardChanges}
                                className="px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                Discard
                            </button>
                        )}
                        <button
                            onClick={saveAll}
                            disabled={!hasChanges || isSavingAll}
                            className={`px-5 py-2.5 rounded-[8px] text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                                hasChanges
                                    ? 'bg-primary text-white shadow-primary/20 hover:brightness-110'
                                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isSavingAll && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Pending banner */}
                {hasChanges && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px] text-sm text-amber-800">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>
                            You have <strong>{Object.keys(pendingChanges).length}</strong> unsaved change{Object.keys(pendingChanges).length > 1 ? 's' : ''}.
                            Click <strong>Save Changes</strong> to apply.
                        </span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-neutral-900">{modules.length}</p>
                        <p className="text-xs font-medium text-neutral-500 mt-1">Total Modules</p>
                    </div>
                    <div className="bg-primary/10 border border-emerald-100 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-primary">{enabledCount}</p>
                        <p className="text-xs font-medium text-primary mt-1">Active</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-rose-700">{modules.length - enabledCount}</p>
                        <p className="text-xs font-medium text-rose-600 mt-1">Disabled</p>
                    </div>
                </div>

                {/* Module Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((mod) => {
                            const meta = MODULE_META[mod.id];
                            const isEnabled = getEffectiveState(mod.id);
                            const isPending = mod.id in pendingChanges;

                            return (
                                <div
                                    key={mod.id}
                                    className={`relative bg-white border rounded-[12px] p-5 shadow-sm transition-all duration-200 ${
                                        isEnabled
                                            ? isPending
                                                ? 'border-amber-300 ring-1 ring-amber-200'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                            : 'border-rose-200 bg-rose-50/50 opacity-80'
                                    }`}
                                >
                                    {/* Pending badge */}
                                    {isPending && (
                                        <span className="absolute top-3 right-12 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                            Unsaved
                                        </span>
                                    )}

                                    {/* Critical badge */}
                                    {meta?.critical && (
                                        <span className="absolute top-3 right-14 text-[10px] font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                                            Core
                                        </span>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2.5 rounded-[8px] ${isEnabled ? 'bg-neutral-100' : 'bg-rose-100'}`}>
                                            <span className={meta?.color ?? 'text-neutral-500'}>
                                                {meta?.icon ?? <Layers className="w-5 h-5" />}
                                            </span>
                                        </div>

                                        {/* Toggle */}
                                        <button
                                            onClick={() => handleToggle(mod.id)}
                                            className={`relative transition-colors duration-200 focus:outline-none ${
                                                mod.id === 'dashboard' ? 'opacity-40 cursor-not-allowed' : ''
                                            }`}
                                            disabled={mod.id === 'dashboard'}
                                            title={mod.id === 'dashboard' ? 'Dashboard cannot be disabled' : undefined}
                                        >
                                            {isEnabled ? (
                                                <ToggleRight className="w-8 h-8 text-primary" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-neutral-300" />
                                            )}
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-neutral-900 text-sm mb-1">{mod.label}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{meta?.description}</p>

                                    <div className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                                        isEnabled
                                            ? 'bg-emerald-100 text-primary'
                                            : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {isEnabled ? 'Enabled' : 'Disabled'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-100 rounded-[8px] p-4 text-sm text-blue-800">
                    <p className="font-bold mb-1">How module control works</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                        <li>Disabling a module hides it from navigation and blocks access for <strong>all</strong> users including staff.</li>
                        <li>Superadmins are shown a "Module Disabled" page — so they can notice and re-enable from here.</li>
                        <li>Per-user module permissions (set in User Management) are enforced <em>after</em> global module checks.</li>
                        <li>The <strong>Dashboard</strong> module cannot be disabled as it is the landing page.</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminModules;
