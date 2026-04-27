import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Package, MessageSquare,
    Settings, Bell, Menu, ArrowUpRight, Tag, List, ShoppingCart, Users, Calendar,
    Table, CreditCard, BarChart3, Truck
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) { }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications/read-all`, { method: 'PATCH' });
            if (res.ok) fetchNotifications();
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

    const navItems = [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Tables", path: "/admin/tables", icon: <Table className="w-5 h-5" /> },
        { label: "POS System", path: "/admin/pos", icon: <CreditCard className="w-5 h-5" /> },
        { label: "Orders", path: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
        { label: "Delivery", path: "/admin/delivery", icon: <Truck className="w-5 h-5" /> },
        { label: "Customers", path: "/admin/customers", icon: <Users className="w-5 h-5" /> },
        { label: "Menu Items", path: "/admin/menu", icon: <List className="w-5 h-5" /> },
        { label: "Inventory", path: "/admin/inventory", icon: <Package className="w-5 h-5" /> },
        { label: "Reservations", path: "/admin/reservations", icon: <Calendar className="w-5 h-5" /> },
        { label: "Notifications", path: "/admin/notifications", icon: <Bell className="w-5 h-5" /> },
        { label: "Messages", path: "/admin/messages", icon: <MessageSquare className="w-5 h-5" /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-neutral-50 text-neutral-900 overflow-hidden font-sans flex-col">
            {/* Slick Horizontal Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky top-0 z-50 px-4 lg:px-8 shrink-0 print:hidden shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/admin" className="flex items-center gap-3 group transition-transform active:scale-95">
                                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                                    S
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold tracking-tight leading-none text-neutral-900">Skybridge</span>
                                    <span className="text-[10px] uppercase font-bold text-primary tracking-widest mt-1">Management</span>
                                </div>
                            </Link>
                            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
                            <h1 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest hidden sm:block">
                                {title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
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
                        </div>
                    </div>

                    {/* Nav Items - Integrated into Header area for slickness */}
                    <nav className="border-t border-neutral-100/50">
                        <div className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap active:scale-95 ${isActive
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 font-semibold'
                                            }`}
                                    >
                                        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[13px] tracking-tight">{item.label}</span>
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
