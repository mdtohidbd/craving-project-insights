import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth, AuthUser, StaffRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Users, UserCheck, UserX, Clock, Search, X, Loader2,
    RefreshCw, ChefHat, CreditCard, Truck, Coffee, Briefcase,
    CheckCircle2, ArrowRight, AlertCircle, BadgeCheck, Star, Award, CalendarDays
} from 'lucide-react';
import { useTranslation } from "react-i18next";

const ALL_MODULES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tables', label: 'Tables' },
    { id: 'pos', label: 'POS System' },
    { id: 'orders', label: 'Orders' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'customers', label: 'Customers' },
    { id: 'menu', label: 'Menu Items' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
];

const STAFF_ROLES: { value: StaffRole; label: string; icon: React.ReactNode; color: string; defaultModules: string[] }[] = [
    { value: 'manager',  label: 'Manager',  icon: <Briefcase className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50 border-purple-200', defaultModules: ['dashboard','orders','tables','pos','customers','delivery','reservations','notifications','messages'] },
    { value: 'cashier',  label: 'Cashier',  icon: <CreditCard className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50 border-blue-200',     defaultModules: ['dashboard','orders','pos','tables'] },
    { value: 'chef',     label: 'Chef',     icon: <ChefHat className="w-5 h-5" />,    color: 'text-orange-600 bg-orange-50 border-orange-200', defaultModules: ['dashboard','orders','inventory'] },
    { value: 'waiter',   label: 'Waiter',   icon: <Coffee className="w-5 h-5" />,     color: 'text-teal-600 bg-teal-50 border-teal-200',       defaultModules: ['dashboard','orders','tables','reservations'] },
    { value: 'delivery', label: 'Delivery', icon: <Truck className="w-5 h-5" />,      color: 'text-amber-600 bg-amber-50 border-amber-200',    defaultModules: ['dashboard','delivery'] },
];

const ROLE_COLOR: Record<string, string> = {
    manager: 'bg-purple-100 text-purple-700 border-purple-200',
    cashier:  'bg-blue-100 text-blue-700 border-blue-200',
    chef:     'bg-orange-100 text-orange-700 border-orange-200',
    waiter:   'bg-teal-100 text-teal-700 border-teal-200',
    delivery: 'bg-amber-100 text-amber-700 border-amber-200',
};

type ModalStep = 'role' | 'modules' | 'confirm';

interface ApproveModal {
    user: AuthUser;
    step: ModalStep;
    staffRole: StaffRole;
    allowedModules: string[];
}

type ActiveTab = 'pending' | 'active' | 'shifts';

interface WaiterPerformance {
    id: string;
    name: string;
    ordersServed: number;
    revenueGenerated: number;
    rating: number;
    status: string;
}

interface ShiftSchedule {
    id: string;
    name: string;
    role: string;
    shift: "Morning" | "Evening" | "Night" | "Rest Day";
    attendance: "Present" | "Absent" | "On Leave" | "Pending";
}

const AdminStaff = () => {
    const { t } = useTranslation();
    const { token, isSuperAdmin } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
    const [activeStaff, setActiveStaff] = useState<AuthUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('active');
    const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all');
    const [modal, setModal] = useState<ApproveModal | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Shifts & Performance Mock State
    const [waiterLeaderboard, setWaiterLeaderboard] = useState<WaiterPerformance[]>([
        { id: "w-1", name: "Md Tohid", ordersServed: 142, revenueGenerated: 4260, rating: 4.9, status: "Top performer" },
        { id: "w-2", name: "Tohidul Islam", ordersServed: 128, revenueGenerated: 3840, rating: 4.8, status: "Excellent speed" },
        { id: "w-3", name: "Royal Kazi", ordersServed: 95, revenueGenerated: 2850, rating: 4.6, status: "Good rating" },
        { id: "w-4", name: "Abir Hasan", ordersServed: 88, revenueGenerated: 2640, rating: 4.5, status: "On track" }
    ]);

    const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>([
        { id: "s-1", name: "Md Tohid", role: "Waiter", shift: "Morning", attendance: "Present" },
        { id: "s-2", name: "Tohidul Islam", role: "Waiter", shift: "Evening", attendance: "Present" },
        { id: "s-3", name: "Royal Kazi", role: "Waiter", shift: "Morning", attendance: "Present" },
        { id: "s-4", name: "Abir Hasan", role: "Waiter", shift: "Night", attendance: "Pending" },
        { id: "s-5", name: "Manager Kabir", role: "Manager", shift: "Morning", attendance: "Present" },
        { id: "s-6", name: "Chef Selim", role: "Chef", shift: "Evening", attendance: "Present" },
        { id: "s-7", name: "Cashier Kamal", role: "Cashier", shift: "Evening", attendance: "Present" }
    ]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [pendRes, staffRes] = await Promise.all([
                fetch(`${API_URL}/auth/users?status=pending`, { headers }),
                fetch(`${API_URL}/auth/staff`, { headers }),
            ]);
            if (pendRes.ok)  setPendingUsers(await pendRes.json());
            if (staffRes.ok) setActiveStaff(await staffRes.json());
        } catch { toast.error(t("staff.load_failed", 'Failed to load staff data')); }
        finally  { setIsLoading(false); }
    }, [API_URL, token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openApprove = (u: AuthUser) => {
        setModal({ user: u, step: 'role', staffRole: null as any, allowedModules: [] });
    };

    const selectRole = (role: StaffRole) => {
        const meta = STAFF_ROLES.find(r => r.value === role);
        setModal(prev => prev ? { ...prev, staffRole: role, allowedModules: meta?.defaultModules ?? [], step: 'modules' } : prev);
    };

    const toggleModule = (id: string) => {
        setModal(prev => {
            if (!prev) return prev;
            const has = prev.allowedModules.includes(id);
            return { ...prev, allowedModules: has ? prev.allowedModules.filter(m => m !== id) : [...prev.allowedModules, id] };
        });
    };

    const submitApproval = async () => {
        if (!modal || !modal.staffRole) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/auth/users/${modal.user._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'approved', role: 'staff', staffRole: modal.staffRole, allowedModules: modal.allowedModules }),
            });
            if (!res.ok) throw new Error();
            toast.success(t("staff.approve_success", '{{name}} approved as {{role}}', { name: modal.user.name, role: modal.staffRole }));
            setModal(null);
            fetchAll();
        } catch { toast.error(t("staff.approve_failed", 'Approval failed')); }
        finally { setIsSaving(false); }
    };

    const submitReject = async (id: string) => {
        setRejectId(id);
        try {
            const res = await fetch(`${API_URL}/auth/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' }),
            });
            if (!res.ok) throw new Error();
            toast.success(t("staff.reject_success", 'User rejected'));
            fetchAll();
        } catch { toast.error(t("staff.reject_failed", 'Rejection failed')); }
        finally { setRejectId(null); }
    };

    const handleShiftChange = (scheduleId: string, newShift: "Morning" | "Evening" | "Night" | "Rest Day") => {
        setShiftSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, shift: newShift } : s));
        const staff = shiftSchedules.find(s => s.id === scheduleId);
        toast.success(`Shift for ${staff?.name} updated to ${newShift}`);
    };

    const filteredPending = pendingUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    
    const filteredActive = activeStaff.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.phone.includes(search) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.staffRole === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <AdminLayout title={t("dashboard.staff", "Staff Management")}>
            <div className="space-y-6 pb-10">

                {/* Stats cards summary */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-[12px] p-5 flex items-center gap-4">
                        <div className="p-3 bg-amber-100/50 text-amber-600 rounded-[12px]">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-700">{pendingUsers.length}</p>
                            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Pending Queue</p>
                        </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-[12px] p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-[12px]">
                            <BadgeCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-700">{activeStaff.length}</p>
                            <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Active Staff</p>
                        </div>
                    </div>
                    <div className="col-span-2 lg:col-span-1 bg-blue-50 border border-blue-100 rounded-[12px] p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-[12px]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-700">{pendingUsers.length + activeStaff.length}</p>
                            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Total Registered</p>
                        </div>
                    </div>
                </div>

                {/* Tabs selection, search & filters */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-1.5 p-1 bg-neutral-100 rounded-[12px] w-full sm:w-auto">
                            {(['active', 'pending', 'shifts'] as ActiveTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-[8px] text-xs font-bold capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white shadow text-neutral-900' 
                                            : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                                >
                                    {tab === 'active' && t("staff.active_staff", 'Active Staff')}
                                    {tab === 'pending' && `${t("staff.pending_queue", 'Pending Queue')} (${pendingUsers.length})`}
                                    {tab === 'shifts' && 'Shifts & Waiters'}
                                </button>
                            ))}
                        </div>
                        
                        {activeTab !== 'shifts' && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-72">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t("staff.search_placeholder", "Search staff by name...")}
                                        className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[8px] pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <button onClick={fetchAll} className="p-2 bg-white border border-neutral-200 text-neutral-600 rounded-[8px] hover:text-neutral-900 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'active' && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setRoleFilter('all')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${roleFilter === 'all' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                            >
                                {t("staff.all_staff", "All Staff")}
                            </button>
                            {STAFF_ROLES.map(role => (
                                <button
                                    key={role.value}
                                    onClick={() => setRoleFilter(role.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${roleFilter === role.value ? role.color : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                                >
                                    {React.cloneElement(role.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                                    {t(`staff.role_${role.value}`, role.label)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : activeTab === 'pending' ? (
                    /* ── PENDING QUEUE ── */
                    filteredPending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400 bg-white border border-neutral-200 rounded-[12px]">
                            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-300" />
                            <p className="font-medium text-neutral-500">{t("staff.no_pending", "No pending requests")}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPending.map(u => (
                                <div key={u._id} className="bg-white border border-amber-200 rounded-[12px] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[8px] bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center font-black text-amber-700 text-lg shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">{u.name}</p>
                                            <p className="text-xs text-neutral-500">@{u.username} • {u.phone}</p>
                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                <Clock className="w-2.5 h-2.5" /> {t("staff.awaiting_approval", "Awaiting Approval")}
                                            </span>
                                        </div>
                                    </div>
                                    {isSuperAdmin && (
                                        <div className="flex items-center gap-2 sm:shrink-0">
                                            <button onClick={() => submitReject(u._id)}
                                                disabled={rejectId === u._id}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-rose-200 text-rose-600 bg-rose-50 text-sm font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50">
                                                {rejectId === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                                {t("staff.reject", "Reject")}
                                            </button>
                                            <button onClick={() => openApprove(u)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-bold shadow-md shadow-emerald-200 hover:bg-primary/90 transition-colors">
                                                <UserCheck className="w-4 h-4" />{t("staff.approve", "Approve")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === 'active' ? (
                    /* ── ACTIVE STAFF CARDS ── */
                    filteredActive.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400 bg-white border border-neutral-200 rounded-[12px]">
                            <Users className="w-10 h-10 mb-2" />
                            <p className="font-medium text-neutral-500">{t("staff.no_active", "No active staff yet")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredActive.map(u => {
                                const meta = STAFF_ROLES.find(r => r.value === u.staffRole);
                                const colorClass = u.staffRole ? ROLE_COLOR[u.staffRole] : 'bg-neutral-100 text-neutral-700 border-neutral-200';
                                return (
                                    <div key={u._id} className="bg-white border border-neutral-200 rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-[8px] bg-gradient-to-br from-primary/10 to-primary/25 flex items-center justify-center font-black text-primary text-lg">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                                                {meta?.icon && React.cloneElement(meta.icon as React.ReactElement, { className: 'w-3 h-3' })}
                                                {u.staffRole ? t(`staff.role_${u.staffRole}`, u.staffRole.charAt(0).toUpperCase() + u.staffRole.slice(1)) : t("staff.staff", 'Staff')}
                                            </span>
                                        </div>
                                        <p className="font-bold text-neutral-900">{u.name}</p>
                                        <p className="text-[11px] font-medium text-neutral-600">@{u.username}</p>
                                        <p className="text-[11px] text-neutral-500 mb-3">{u.phone}</p>
                                        <div className="border-t border-neutral-100 pt-3">
                                            <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1.5">{t("staff.module_access", "Module Access")}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(u.allowedModules ?? []).slice(0, 4).map(m => (
                                                    <span key={m} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-semibold rounded-[4px] capitalize">{t(`modules.${m}`, m)}</span>
                                                ))}
                                                {(u.allowedModules ?? []).length > 4 && (
                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-[4px]">+{u.allowedModules.length - 4} {t("staff.more", "more")}</span>
                                                )}
                                                {(u.allowedModules ?? []).length === 0 && (
                                                    <span className="text-[10px] text-neutral-400 italic">{t("staff.no_modules", "No modules assigned")}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* ── SHIFTS & WAITER LEADERBOARD (NEW ERP Module) ── */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Waiter Leaderboard */}
                        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-[16px] p-6 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2.5 mb-6">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h3 className="text-base font-black text-neutral-900">Waiter Leaderboard</h3>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                                {waiterLeaderboard.map((waiter, idx) => (
                                    <div key={waiter.id} className="flex items-center justify-between p-3.5 border border-neutral-100 rounded-[12px] hover:shadow-inner hover:bg-neutral-50/50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-neutral-800 text-sm">{waiter.name}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold">{waiter.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-neutral-900">{waiter.ordersServed} orders</p>
                                            <div className="flex items-center justify-end gap-0.5 mt-0.5 text-xs text-amber-500 font-bold">
                                                <Star className="w-3 h-3 fill-amber-500" />
                                                {waiter.rating}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shift Roster Scheduling */}
                        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-6">
                                <CalendarDays className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <h3 className="text-base font-black text-neutral-900">Shift Roster & Roster Assignments</h3>
                                    <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-bold">Manage staff work shifts</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Staff Name</th>
                                            <th className="px-4 py-3 font-semibold">Role</th>
                                            <th className="px-4 py-3 font-semibold">Assigned Shift</th>
                                            <th className="px-4 py-3 font-semibold">Attendance</th>
                                            <th className="px-4 py-3 text-right">Update Shift</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {shiftSchedules.map((sched) => (
                                            <tr key={sched.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-4 py-3.5 font-bold text-neutral-900 text-xs">{sched.name}</td>
                                                <td className="px-4 py-3.5 text-xs text-neutral-500">{sched.role}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        sched.shift === "Morning" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                                        sched.shift === "Evening" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                        sched.shift === "Night" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                                        "bg-neutral-100 text-neutral-500"
                                                    }`}>
                                                        {sched.shift} Shift
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        sched.attendance === "Present" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                        sched.attendance === "Absent" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                                        "bg-neutral-100 text-neutral-500"
                                                    }`}>
                                                        {sched.attendance}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <select
                                                        value={sched.shift}
                                                        onChange={(e) => handleShiftChange(sched.id, e.target.value as any)}
                                                        className="bg-white border border-neutral-200 rounded-[6px] px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:border-primary cursor-pointer"
                                                    >
                                                        <option value="Morning">Morning</option>
                                                        <option value="Evening">Evening</option>
                                                        <option value="Night">Night</option>
                                                        <option value="Rest Day">Rest Day</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50/50">
                            <h3 className="text-lg font-bold text-neutral-900">Approve {modal.user.name}</h3>
                            <button onClick={() => setModal(null)} className="text-neutral-400 hover:text-neutral-900 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {modal.step === 'role' && (
                            <div className="p-4 space-y-4">
                                <p className="text-sm text-neutral-500">Select staff role for this account:</p>
                                <div className="space-y-2">
                                    {STAFF_ROLES.map(role => (
                                        <button key={role.value} onClick={() => selectRole(role.value)}
                                            className="w-full flex items-center gap-3 p-3 border border-neutral-200 rounded-[8px] hover:border-primary hover:bg-neutral-50 text-left transition-all">
                                            <div className="p-2 bg-neutral-100 rounded-[8px]">{role.icon}</div>
                                            <div>
                                                <p className="font-bold text-neutral-900">{role.label}</p>
                                                <p className="text-xs text-neutral-500">Default permissions will be applied.</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {modal.step === 'modules' && (
                            <div className="p-4 flex flex-col max-h-[70vh]">
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Module Permissions</p>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    {ALL_MODULES.map(m => {
                                        const has = modal.allowedModules.includes(m.id);
                                        return (
                                            <button key={m.id} type="button" onClick={() => toggleModule(m.id)}
                                                className={`w-full flex items-center justify-between p-3.5 border rounded-[8px] text-left transition-all ${
                                                    has ? 'border-primary bg-primary/5 font-semibold text-neutral-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                                                }`}>
                                                <span className="text-xs">{m.label}</span>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${has ? 'border-primary bg-primary text-white' : 'border-neutral-300 bg-white'}`}>
                                                    {has && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="pt-4 mt-4 border-t border-neutral-100 flex justify-between shrink-0">
                                    <button onClick={() => setModal(prev => prev ? { ...prev, step: 'role' } : prev)} className="px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-700">Back</button>
                                    <button onClick={submitApproval} disabled={isSaving} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-[8px] hover:brightness-110 flex items-center gap-2">
                                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save & Approve
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminStaff;
