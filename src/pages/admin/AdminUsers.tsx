import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth, AuthUser, StaffRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Users, Shield, UserCheck, UserX, Clock, Search,
    MoreVertical, ChevronDown, X, Loader2, RefreshCw,
    Crown, BadgeCheck, User, AlertCircle
} from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

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
    { id: 'users', label: 'User Management' },
];

const STAFF_ROLES: { value: StaffRole; label: string }[] = [
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'chef', label: 'Chef' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'delivery', label: 'Delivery' },
];

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    superadmin: { label: 'Superadmin', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Crown className="w-3 h-3" /> },
    staff: { label: 'Staff', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <BadgeCheck className="w-3 h-3" /> },
    user: { label: 'User', color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: <User className="w-3 h-3" /> },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    approved: { label: 'Approved', color: 'bg-emerald-100 text-primary border-primary/30', icon: <UserCheck className="w-3 h-3" /> },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
    rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <UserX className="w-3 h-3" /> },
};

interface EditModalState {
    user: AuthUser;
    role: string;
    staffRole: StaffRole;
    status: string;
    allowedModules: string[];
    password?: string;
    name: string;
    username: string;
    phone: string;
}

const AdminUsers = () => {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterTab>('all');
    const [editModal, setEditModal] = useState<EditModalState | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            setUsers(await res.json());
        } catch {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const filtered = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.phone && u.phone.includes(search)) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || u.status === filter;
        return matchSearch && matchFilter;
    });

    const openEdit = (u: AuthUser) => {
        setEditModal({
            user: u,
            role: u.role,
            staffRole: u.staffRole,
            status: u.status,
            allowedModules: [...u.allowedModules],
            password: '',
            name: u.name,
            username: u.username,
            phone: u.phone,
        });
        setOpenMenuId(null);
    };

    const toggleModule = (moduleId: string) => {
        if (!editModal) return;
        setEditModal((prev) => {
            if (!prev) return prev;
            const has = prev.allowedModules.includes(moduleId);
            return {
                ...prev,
                allowedModules: has
                    ? prev.allowedModules.filter((m) => m !== moduleId)
                    : [...prev.allowedModules, moduleId],
            };
        });
    };

    const handleSave = async () => {
        if (!editModal) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/auth/users/${editModal.user._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role: editModal.role,
                    staffRole: editModal.role === 'staff' ? editModal.staffRole : null,
                    status: editModal.status,
                    allowedModules: editModal.role === 'superadmin'
                        ? ALL_MODULES.map((m) => m.id)
                        : editModal.allowedModules,
                    password: editModal.password,
                    name: editModal.name,
                    username: editModal.username,
                    phone: editModal.phone,
                }),
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('User updated successfully');
            setEditModal(null);
            fetchUsers();
        } catch {
            toast.error('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const quickApprove = async (u: AuthUser, staffRole: StaffRole) => {
        try {
            await fetch(`${API_URL}/auth/users/${u._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'approved', role: 'staff', staffRole }),
            });
            toast.success(`${u.name} approved as ${staffRole}`);
            fetchUsers();
        } catch {
            toast.error('Failed to approve user');
        }
        setOpenMenuId(null);
    };

    const quickReject = async (u: AuthUser) => {
        try {
            await fetch(`${API_URL}/auth/users/${u._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' }),
            });
            toast.success(`${u.name} rejected`);
            fetchUsers();
        } catch {
            toast.error('Failed to reject user');
        }
        setOpenMenuId(null);
    };

    const tabCounts: Record<FilterTab, number> = {
        all: users.length,
        pending: users.filter((u) => u.status === 'pending').length,
        approved: users.filter((u) => u.status === 'approved').length,
        rejected: users.filter((u) => u.status === 'rejected').length,
    };

    return (
        <AdminLayout title="User Management">
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-neutral-900">User Management</h2>
                        <p className="text-sm text-neutral-500 mt-1">Manage staff roles, access, and approval requests</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Users', count: tabCounts.all, color: 'text-neutral-700', bg: 'bg-neutral-100', icon: <Users className="w-5 h-5" /> },
                        { label: 'Pending', count: tabCounts.pending, color: 'text-amber-700', bg: 'bg-amber-50', icon: <Clock className="w-5 h-5 text-amber-500" /> },
                        { label: 'Approved', count: tabCounts.approved, color: 'text-primary', bg: 'bg-primary/10', icon: <UserCheck className="w-5 h-5 text-primary" /> },
                        { label: 'Rejected', count: tabCounts.rejected, color: 'text-rose-700', bg: 'bg-rose-50', icon: <UserX className="w-5 h-5 text-rose-500" /> },
                    ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-[8px] p-4 flex items-center gap-3`}>
                            {s.icon}
                            <div>
                                <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                                <p className="text-xs font-medium text-neutral-500">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters + Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-neutral-100 p-1 rounded-[8px]">
                        {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold capitalize transition-all whitespace-nowrap ${filter === tab ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                {tab} {tabCounts[tab] > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-200 text-neutral-600'}`}>
                                        {tabCounts[tab]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, username, phone or email..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-[8px] border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-neutral-200 rounded-[12px] overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                            <Users className="w-10 h-10 mb-2" />
                            <p className="font-medium">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-bold uppercase text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Staff Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Modules</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filtered.map((u) => {
                                        const roleCfg = roleConfig[u.role] || roleConfig.user;
                                        const statusCfg = statusConfig[u.status] || statusConfig.pending;
                                        const isSelf = u._id === currentUser?._id;
                                        return (
                                            <tr key={u._id} className="hover:bg-neutral-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                                                {u.name}
                                                                {isSelf && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-[4px] font-bold">You</span>}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-neutral-500">@{u.username} • {u.phone}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleCfg.color}`}>
                                                        {roleCfg.icon}{roleCfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-neutral-600 capitalize">{u.staffRole || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.color}`}>
                                                        {statusCfg.icon}{statusCfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'superadmin' ? (
                                                        <span className="text-xs text-neutral-400 italic">All modules</span>
                                                    ) : (
                                                        <span className="text-xs text-neutral-600 font-medium">
                                                            {u.allowedModules.length} module{u.allowedModules.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setOpenMenuId(openMenuId === u._id ? null : u._id)}
                                                            className="p-2 rounded-[4px] hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {openMenuId === u._id && (
                                                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-neutral-200 rounded-[8px] shadow-xl z-20 overflow-hidden">
                                                                <button
                                                                    onClick={() => openEdit(u)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 font-medium flex items-center gap-2"
                                                                >
                                                                    <Shield className="w-4 h-4 text-blue-500" />
                                                                    Edit Roles & Access
                                                                </button>
                                                                {u.status === 'pending' && (
                                                                    <>
                                                                        <div className="border-t border-neutral-100 px-4 py-2">
                                                                            <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">Quick Approve As</p>
                                                                            {STAFF_ROLES.map((sr) => (
                                                                                <button
                                                                                    key={sr.value}
                                                                                    onClick={() => quickApprove(u, sr.value)}
                                                                                    className="w-full text-left px-2 py-1.5 text-xs text-neutral-700 hover:bg-primary/10 hover:text-primary rounded-[4px] transition-colors flex items-center gap-2"
                                                                                >
                                                                                    <UserCheck className="w-3 h-3" />
                                                                                    {sr.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <div className="border-t border-neutral-100">
                                                                            <button
                                                                                onClick={() => quickReject(u)}
                                                                                className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
                                                                            >
                                                                                <UserX className="w-4 h-4" />
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
                    <div
                        className="bg-white rounded-[12px] shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {editModal.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">{editModal.user.name}</p>
                                    <p className="text-xs text-neutral-500">@{editModal.user.username} • {editModal.user.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditModal(null)} className="p-2 rounded-[8px] hover:bg-neutral-100 text-neutral-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={editModal.name}
                                        onChange={(e) => setEditModal(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                        className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={editModal.username}
                                        onChange={(e) => setEditModal(prev => prev ? { ...prev, username: e.target.value.toLowerCase().replace(/\s/g, '') } : prev)}
                                        className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Phone</label>
                                    <input
                                        type="text"
                                        value={editModal.phone}
                                        onChange={(e) => setEditModal(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                                        className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Role</label>
                                <div className="flex gap-2">
                                    {['user', 'staff', 'superadmin'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setEditModal((prev) => prev ? { ...prev, role: r } : prev)}
                                            className={`flex-1 py-2 rounded-[8px] text-xs font-bold capitalize border transition-all ${editModal.role === r ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Staff Role (only when role is staff) */}
                            {editModal.role === 'staff' && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Staff Position</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {STAFF_ROLES.map((sr) => (
                                            <button
                                                key={sr.value}
                                                onClick={() => setEditModal((prev) => prev ? { ...prev, staffRole: sr.value } : prev)}
                                                className={`py-2 px-3 rounded-[8px] text-xs font-bold border transition-all ${editModal.staffRole === sr.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'}`}
                                            >
                                                {sr.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Account Status</label>
                                <div className="flex gap-2">
                                    {['pending', 'approved', 'rejected'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setEditModal((prev) => prev ? { ...prev, status: s } : prev)}
                                            className={`flex-1 py-2 rounded-[8px] text-xs font-bold capitalize border transition-all ${editModal.status === s
                                                ? s === 'approved' ? 'bg-primary text-white border-primary'
                                                    : s === 'rejected' ? 'bg-rose-500 text-white border-rose-500'
                                                        : 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Password */}
                            <div className="pt-2 border-t border-neutral-100">
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Reset Password</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter new password (leave blank to keep current)"
                                        value={editModal.password || ''}
                                        onChange={(e) => setEditModal(prev => prev ? { ...prev, password: e.target.value } : prev)}
                                        className="w-full px-4 py-2.5 rounded-[8px] border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium pr-10"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                                            <AlertCircle className="w-3 h-3 text-amber-500" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-1.5 font-medium italic">* Leaving this blank will NOT change the user's current password.</p>
                            </div>

                            {/* Module Access (not shown for superadmin) */}
                            {editModal.role !== 'superadmin' && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">Module Access</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditModal((prev) => prev ? { ...prev, allowedModules: ALL_MODULES.map(m => m.id) } : prev)}
                                                className="text-[10px] text-primary font-bold hover:underline"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-neutral-300">|</span>
                                            <button
                                                onClick={() => setEditModal((prev) => prev ? { ...prev, allowedModules: [] } : prev)}
                                                className="text-[10px] text-neutral-500 font-bold hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_MODULES.map((m) => {
                                            const isChecked = editModal.allowedModules.includes(m.id);
                                            return (
                                                <button
                                                    key={m.id}
                                                    onClick={() => toggleModule(m.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all text-left ${isChecked ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-primary border-primary' : 'border-neutral-300'}`}>
                                                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    {m.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50/50">
                            <button
                                onClick={() => setEditModal(null)}
                                className="px-5 py-2 rounded-[8px] text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2 rounded-[8px] text-sm font-bold bg-primary text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
