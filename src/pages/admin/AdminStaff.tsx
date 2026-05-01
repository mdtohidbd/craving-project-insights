import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth, AuthUser, StaffRole } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Users, UserCheck, UserX, Clock, Search, X, Loader2,
    RefreshCw, ChefHat, CreditCard, Truck, Coffee, Briefcase,
    CheckCircle2, ArrowRight, AlertCircle, BadgeCheck
} from 'lucide-react';

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

type ActiveTab = 'pending' | 'active';

const AdminStaff = () => {
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
        } catch { toast.error('Failed to load staff data'); }
        finally  { setIsLoading(false); }
    }, [API_URL, token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const openApprove = (u: AuthUser) => {
        setModal({ user: u, step: 'role', staffRole: null, allowedModules: [] });
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
            toast.success(`${modal.user.name} approved as ${modal.staffRole}`);
            setModal(null);
            fetchAll();
        } catch { toast.error('Approval failed'); }
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
            toast.success('User rejected');
            fetchAll();
        } catch { toast.error('Rejection failed'); }
        finally { setRejectId(null); }
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
        <AdminLayout title="Staff Management">
            <div className="space-y-6 pb-10">


                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-[8px] p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <div><p className="text-2xl font-black text-amber-700">{pendingUsers.length}</p><p className="text-xs text-amber-600 font-medium">Pending Approval</p></div>
                    </div>
                    <div className="bg-primary/10 border border-emerald-100 rounded-[8px] p-4 flex items-center gap-3">
                        <BadgeCheck className="w-5 h-5 text-primary" />
                        <div><p className="text-2xl font-black text-primary">{activeStaff.length}</p><p className="text-xs text-primary font-medium">Active Staff</p></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-[8px] p-4 flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div><p className="text-2xl font-black text-blue-700">{pendingUsers.length + activeStaff.length}</p><p className="text-xs text-blue-600 font-medium">Total</p></div>
                    </div>
                </div>

                {/* Tabs, Search & Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex gap-1 bg-neutral-100 p-1 rounded-[8px] shrink-0">
                            {(['pending', 'active'] as ActiveTab[]).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-[4px] text-xs font-bold capitalize transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === tab ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
                                    {tab === 'pending' && pendingUsers.length > 0 && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                                    )}
                                    {tab === 'pending' ? 'Pending Queue' : 'Active Staff'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-1">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, username, phone or email..."
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-[8px] border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                            </div>
                            <button onClick={fetchAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0 shadow-sm">
                                <RefreshCw className="w-4 h-4" /><span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'active' && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setRoleFilter('all')}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${roleFilter === 'all' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                            >
                                All Staff
                            </button>
                            {STAFF_ROLES.map(role => (
                                <button
                                    key={role.value}
                                    onClick={() => setRoleFilter(role.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${roleFilter === role.value ? role.color : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                                >
                                    {React.cloneElement(role.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : activeTab === 'pending' ? (
                    /* ── PENDING QUEUE ── */
                    filteredPending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400 bg-white border border-neutral-200 rounded-[12px]">
                            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-300" />
                            <p className="font-medium text-neutral-500">No pending requests</p>
                            <p className="text-xs mt-1">All sign-ups have been processed</p>
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
                                                <Clock className="w-2.5 h-2.5" /> Awaiting Approval
                                            </span>
                                        </div>
                                    </div>
                                    {isSuperAdmin && (
                                        <div className="flex items-center gap-2 sm:shrink-0">
                                            <button onClick={() => submitReject(u._id)}
                                                disabled={rejectId === u._id}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-rose-200 text-rose-600 bg-rose-50 text-sm font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50">
                                                {rejectId === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                                Reject
                                            </button>
                                            <button onClick={() => openApprove(u)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-primary text-white text-sm font-bold shadow-md shadow-emerald-200 hover:bg-primary/90 transition-colors">
                                                <UserCheck className="w-4 h-4" />Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* ── ACTIVE STAFF CARDS ── */
                    filteredActive.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400 bg-white border border-neutral-200 rounded-[12px]">
                            <Users className="w-10 h-10 mb-2" />
                            <p className="font-medium text-neutral-500">No active staff yet</p>
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
                                                {u.staffRole ? u.staffRole.charAt(0).toUpperCase() + u.staffRole.slice(1) : 'Staff'}
                                            </span>
                                        </div>
                                        <p className="font-bold text-neutral-900">{u.name}</p>
                                        <p className="text-[11px] font-medium text-neutral-600">@{u.username}</p>
                                        <p className="text-[11px] text-neutral-500 mb-3">{u.phone}</p>
                                        <div className="border-t border-neutral-100 pt-3">
                                            <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1.5">Module Access</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(u.allowedModules ?? []).slice(0, 4).map(m => (
                                                    <span key={m} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-semibold rounded-[4px] capitalize">{m}</span>
                                                ))}
                                                {(u.allowedModules ?? []).length > 4 && (
                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-[4px]">+{u.allowedModules.length - 4} more</span>
                                                )}
                                                {(u.allowedModules ?? []).length === 0 && (
                                                    <span className="text-[10px] text-neutral-400 italic">No modules assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>

            {/* ── MULTI-STEP APPROVAL MODAL ── */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !isSaving && setModal(null)}>
                    <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-primary">
                                    {modal.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">{modal.user.name}</p>
                                    <p className="text-xs text-neutral-500">@{modal.user.username} • {modal.user.phone}</p>
                                </div>
                            </div>
                            {/* Step indicator */}
                            <div className="flex items-center gap-1.5">
                                {(['role', 'modules', 'confirm'] as ModalStep[]).map((s, i) => (
                                    <React.Fragment key={s}>
                                        <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-colors ${modal.step === s ? 'bg-primary text-white' : i < ['role','modules','confirm'].indexOf(modal.step) ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'}`}>{i + 1}</div>
                                        {i < 2 && <div className={`w-4 h-0.5 ${i < ['role','modules','confirm'].indexOf(modal.step) ? 'bg-primary' : 'bg-neutral-200'}`} />}
                                    </React.Fragment>
                                ))}
                                <button onClick={() => setModal(null)} className="ml-2 p-1.5 rounded-[4px] hover:bg-neutral-100 text-neutral-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[65vh] overflow-y-auto">
                            {/* Step 1: Choose Role */}
                            {modal.step === 'role' && (
                                <div>
                                    <p className="text-sm font-bold text-neutral-700 mb-4">Assign a staff position to <span className="text-primary">{modal.user.name}</span>:</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {STAFF_ROLES.map(sr => (
                                            <button key={sr.value} onClick={() => selectRole(sr.value)}
                                                className={`flex items-center gap-4 p-4 rounded-[8px] border-2 text-left transition-all hover:shadow-sm group ${modal.staffRole === sr.value ? `border-primary bg-primary/5` : 'border-neutral-200 hover:border-neutral-300'}`}>
                                                <div className={`p-2.5 rounded-[8px] border ${sr.color}`}>{sr.icon}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-neutral-900">{sr.label}</p>
                                                    <p className="text-xs text-neutral-500">Default: {sr.defaultModules.length} modules</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Module Access */}
                            {modal.step === 'modules' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-bold text-neutral-700">Choose module access for <span className="text-primary capitalize">{modal.staffRole}</span>:</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setModal(p => p ? { ...p, allowedModules: ALL_MODULES.map(m => m.id) } : p)} className="text-[10px] text-primary font-bold hover:underline">All</button>
                                            <span className="text-neutral-300">|</span>
                                            <button onClick={() => setModal(p => p ? { ...p, allowedModules: [] } : p)} className="text-[10px] text-neutral-500 font-bold hover:underline">None</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_MODULES.map(m => {
                                            const checked = modal.allowedModules.includes(m.id);
                                            return (
                                                <button key={m.id} onClick={() => toggleModule(m.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-semibold border transition-all text-left ${checked ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-primary border-primary' : 'border-neutral-300'}`}>
                                                        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                    {m.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirm */}
                            {modal.step === 'confirm' && (
                                <div className="space-y-4">
                                    <div className="bg-primary/10 border border-primary/30 rounded-[8px] p-4">
                                        <p className="text-sm font-bold text-emerald-800 mb-3">Review before approving</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-neutral-500">Name</span><span className="font-semibold text-neutral-900">{modal.user.name}</span></div>
                                            <div className="flex justify-between"><span className="text-neutral-500">Username</span><span className="font-semibold text-neutral-900">@{modal.user.username}</span></div>
                                            <div className="flex justify-between"><span className="text-neutral-500">Phone</span><span className="font-semibold text-neutral-900">{modal.user.phone}</span></div>
                                            <div className="flex justify-between"><span className="text-neutral-500">Position</span><span className="font-semibold text-neutral-900 capitalize">{modal.staffRole}</span></div>
                                            <div className="flex justify-between"><span className="text-neutral-500">Modules</span><span className="font-semibold text-neutral-900">{modal.allowedModules.length} modules</span></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-neutral-400 mb-2">Assigned Modules</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {modal.allowedModules.map(m => (
                                                <span key={m} className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-[4px] capitalize">{m}</span>
                                            ))}
                                            {modal.allowedModules.length === 0 && <span className="text-xs text-neutral-400 italic">No modules — staff won't see anything</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-neutral-100 bg-neutral-50/50">
                            <button onClick={() => setModal(p => p ? { ...p, step: p.step === 'modules' ? 'role' : 'modules' } : p)}
                                disabled={modal.step === 'role'}
                                className="px-4 py-2 rounded-[8px] text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-colors disabled:opacity-30">
                                Back
                            </button>
                            {modal.step === 'confirm' ? (
                                <button onClick={submitApproval} disabled={isSaving}
                                    className="px-5 py-2 rounded-[8px] text-sm font-bold bg-primary text-white shadow-md shadow-emerald-200 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Confirm Approval
                                </button>
                            ) : (
                                <button
                                    onClick={() => setModal(p => p ? { ...p, step: p.step === 'role' ? 'modules' : 'confirm' } : p)}
                                    disabled={modal.step === 'role' && !modal.staffRole}
                                    className="px-5 py-2 rounded-[8px] text-sm font-bold bg-primary text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2">
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminStaff;
