import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, MessageSquare,
    Settings, Bell, Menu, ArrowUpRight, Tag, List, ShoppingCart, Users, Calendar,
    Table, CreditCard, BarChart3, Truck, LogOut, ShieldCheck, Layers, UserCog
} from "lucide-react"; // Updated to clear Vite cache
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useModules } from "../../context/ModuleContext";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isSuperAdmin } = useAuth();
    const { isModuleActive } = useModules();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!isSuperAdmin) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const fetchPending = async () => {
            try {
                const token = localStorage.getItem('craving_auth_token');
                const res = await fetch(`${apiUrl}/auth/pending-count`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) { const d = await res.json(); setPendingCount(d.count); }
            } catch {}
        };
        fetchPending();
        const iv = setInterval(fetchPending, 30000);
        return () => clearInterval(iv);
    }, [isSuperAdmin]);

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filterNotificationsByModule = (notifs: any[]) => {
        if (isSuperAdmin) return notifs;
        const allowed = user?.allowedModules || [];

        if (user?.staffRole === 'delivery') {
            return notifs.filter(n => n.targetUserId === user._id);
        }

        return notifs.filter(n => {
            if (n.type === 'order' && allowed.includes('orders') && !n.targetUserId) return true;
            if (n.type === 'reservation' && allowed.includes('reservations')) return true;
            if (n.type === 'message' && allowed.includes('messages')) return true;
            if (n.type === 'stock' && allowed.includes('inventory')) return true;
            if (n.type === 'staff_signup' && allowed.includes('staff')) return true;
            
            // Allow if targeted to this specific user
            if (n.targetUserId === user?._id) return true;
            return false;
        });
    };

    const fetchNotifications = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(filterNotificationsByModule(data));
            }
        } catch (err) { }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [user, isSuperAdmin]); // added dependencies to refetch if user changes

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
            if (unreadIds.length === 0) return;
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/notifications/read-all`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: unreadIds })
            });
        } catch (err) { }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to format time relative to now
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
        return date.toLocaleDateString();
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
        toast.success('Logged out successfully');
    };

    const allNavItems = [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" />, module: "dashboard" },
        { label: "Tables", path: "/admin/tables", icon: <Table className="w-5 h-5" />, module: "tables" },
        { label: "POS System", path: "/admin/pos", icon: <CreditCard className="w-5 h-5" />, module: "pos" },
        { label: "Orders", path: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" />, module: "orders" },
        { label: "Delivery", path: "/admin/delivery", icon: <Truck className="w-5 h-5" />, module: "delivery" },
        { label: "Customers", path: "/admin/customers", icon: <Users className="w-5 h-5" />, module: "customers" },
        { label: "Menu Items", path: "/admin/menu", icon: <List className="w-5 h-5" />, module: "menu" },
        { label: "Inventory", path: "/admin/inventory", icon: <Package className="w-5 h-5" />, module: "inventory" },
        { label: "Reservations", path: "/admin/reservations", icon: <Calendar className="w-5 h-5" />, module: "reservations" },
        { label: "Notifications", path: "/admin/notifications", icon: <Bell className="w-5 h-5" />, module: "notifications" },
        { label: "Messages", path: "/admin/messages", icon: <MessageSquare className="w-5 h-5" />, module: "messages" },
        { label: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" />, module: "settings" },
        { label: "Users",       path: "/admin/users",       icon: <ShieldCheck className="w-5 h-5" />, module: "users",       superAdminOnly: true },
        { label: "Staff",       path: "/admin/staff",       icon: <UserCog className="w-5 h-5" />,   module: "staff",       superAdminOnly: true },
        { label: "Deliverymen", path: "/admin/deliverymen", icon: <Users className="w-5 h-5" />,       module: "deliverymen", superAdminOnly: true },
        { label: "Modules",     path: "/admin/modules",     icon: <Layers className="w-5 h-5" />,    module: "modules",     superAdminOnly: true },
    ];

    const navItems = allNavItems.filter((item) => {
        if ((item as any).superAdminOnly) return isSuperAdmin;
        // Hide globally disabled modules from non-superadmins
        if (!isModuleActive(item.module)) return false;
        if (isSuperAdmin) return true;
        return (user?.allowedModules ?? []).includes(item.module);
    });

    return (
        <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-hidden font-sans flex-col">
            {/* Slick Horizontal Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-50 px-4 lg:px-8 shrink-0 print:hidden shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/admin" className="flex items-center gap-3 group transition-transform active:scale-95">
                                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-xl shadow-primary/30 rotate-6 group-hover:rotate-0 transition-all duration-500">
                                    S
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black tracking-tight leading-none text-neutral-900 group-hover:text-primary transition-colors">Skybridge</span>
                                    <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em] mt-1.5 opacity-80">Management</span>
                                </div>
                            </Link>
                            <div className="h-8 w-px bg-neutral-200/60 hidden sm:block mx-2" />
                            <h1 className="text-xl font-extrabold text-black uppercase tracking-[0.15em] hidden sm:block">
                                {title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* User Info */}
                            {user && (
                                <div className="hidden sm:flex items-center gap-2 border-r border-neutral-200 pr-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-primary font-bold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-neutral-800 leading-none">{user.name}</span>
                                        <span className="text-[10px] font-semibold text-neutral-400 capitalize mt-0.5">{user.role}</span>
                                    </div>
                                </div>
                            )}
                            {/* Notification Dropdown Container */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`relative p-2.5 transition-all rounded-xl ${isNotificationOpen
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                        }`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white bg-rose-500 animate-pulse ${isNotificationOpen ? 'hidden' : ''}`} />
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right z-50">
                                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                            <h3 className="font-bold text-neutral-900 text-sm">Notifications</h3>
                                            <Link to="/admin/notifications" onClick={() => setIsNotificationOpen(false)} className="text-[11px] font-bold text-primary hover:underline">View All</Link>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <div key={n._id} className="p-4 hover:bg-neutral-50 border-b border-neutral-50 transition-colors cursor-pointer group">
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                                            <div className="space-y-1">
                                                                <p className="text-[13px] font-bold text-neutral-900 group-hover:text-primary transition-colors">{n.title}</p>
                                                                <p className="text-[12px] text-neutral-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                                <p className="text-[10px] font-medium text-neutral-400 mt-2 lowercase">{formatTime(n.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                                                    <p className="text-sm text-neutral-400">All caught up!</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={markAllAsRead}
                                            className="w-full py-3 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors border-t border-neutral-100 uppercase tracking-wider"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Nav Items - Premium Mushy Design */}
                    <nav className="border-t border-neutral-100/50 bg-neutral-50/30">
                        <div className="flex items-center gap-2 py-2.5 px-2 overflow-x-auto no-scrollbar scroll-smooth">
                            {navItems.map((item) => {
                                const cleanPath = item.path.replace(/\/$/, '');
                                const cleanCurrent = location.pathname.replace(/\/$/, '') || '/';
                                const isActive = cleanCurrent === cleanPath || (cleanPath !== '/admin' && cleanCurrent.startsWith(cleanPath));
                                
                                const showBadge = item.module === 'staff' && pendingCount > 0;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        {...(isActive ? { "data-active": "true" } : {})}
                                        ref={(el) => {
                                            if (isActive && el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                            }
                                        }}
                                        className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all duration-300 whitespace-nowrap active:scale-[0.97] group ${isActive
                                            ? 'bg-white text-primary font-black shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_0_rgba(0,0,0,0.02)] scale-105 z-10'
                                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/60 font-bold hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`transition-all duration-500 ${isActive ? 'scale-110 rotate-0 text-primary' : 'group-hover:scale-110 group-hover:rotate-3 opacity-70 group-hover:opacity-100'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-[13px] tracking-tight transition-colors ${isActive ? 'text-neutral-900' : ''}`}>{item.label}</span>
                                        
                                        {/* Active Indicator Line */}
                                        {isActive && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
                                        )}

                                        {showBadge && (
                                            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar print:overflow-visible print:p-0 print:block bg-neutral-50" data-lenis-prevent="true">
                <div className="max-w-7xl mx-auto print:max-w-none print:m-0">
                    {children}
                </div>
            </main>

            {/* Global styles for dark theme custom scrollbar and utilities */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d4d4d4;
          border-radius: 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;
