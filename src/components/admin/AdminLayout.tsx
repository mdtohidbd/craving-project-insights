import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Package, MessageSquare,
    Settings, Bell, Menu, ArrowUpRight, Tag, List, ShoppingCart, Users, Calendar,
    Table, CreditCard, BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    
    // Global Order Notification Polling
    const lastOrderTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const checkForNewOrders = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/orders`);
                if (res.ok) {
                    const data = await res.json();
                    if (!Array.isArray(data) || data.length === 0) return;
                    
                    const maxTime = Math.max(...data.map((o: any) => new Date(o.createdAt).getTime()));
                    
                    if (lastOrderTimeRef.current === null) {
                        // First load, just set the max time
                        lastOrderTimeRef.current = maxTime;
                    } else if (maxTime > lastOrderTimeRef.current) {
                        // New orders found!
                        const newOrdersCount = data.filter((o: any) => new Date(o.createdAt).getTime() > lastOrderTimeRef.current!).length;
                        
                        toast.success(`New Order Received! 🛎️`, {
                            description: `You have ${newOrdersCount} new order(s). Please check the Orders panel.`,
                            duration: 10000,
                        });
                        
                        lastOrderTimeRef.current = maxTime;
                    }
                }
            } catch (err) {
                // Silently fail if API is down
            }
        };

        checkForNewOrders();
        const interval = setInterval(checkForNewOrders, 10000); // Check every 10 seconds
        
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Tables", path: "/admin/tables", icon: <Table className="w-5 h-5" /> },
        { label: "POS System", path: "/admin/pos", icon: <CreditCard className="w-5 h-5" /> },
        { label: "Orders", path: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
        { label: "Customers", path: "/admin/customers", icon: <Users className="w-5 h-5" /> },
        { label: "Menu Items", path: "/admin/menu", icon: <List className="w-5 h-5" /> },
        { label: "Categories", path: "/admin/categories", icon: <Tag className="w-5 h-5" /> },
        { label: "Inventory", path: "/admin/inventory", icon: <Package className="w-5 h-5" /> },
        { label: "Reservations", path: "/admin/reservations", icon: <Calendar className="w-5 h-5" /> },
        { label: "Reports", path: "/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Messages", path: "/admin/messages", icon: <MessageSquare className="w-5 h-5" /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-white text-neutral-900 overflow-hidden font-sans flex-col">
            {/* Header with Horizontal Navigation */}
            <header className="bg-white border-b border-neutral-200 shrink-0 print:hidden">
                {/* Top Bar */}
                <div className="h-16 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                S
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Skybridge Admin</span>
                        </div>
                        <h1 className="text-xl font-semibold text-neutral-600">| {title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Horizontal Navigation */}
                <nav className="border-t border-neutral-200">
                    <div className="px-4 lg:px-8">
                        <div className="flex items-center gap-1 py-3 overflow-x-auto custom-scrollbar" data-lenis-prevent="true">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${isActive
                                            ? 'bg-neutral-100 text-neutral-900 font-medium'
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-medium'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar relative z-0 print:overflow-visible print:p-0 print:block" data-lenis-prevent="true">
                <div className="max-w-7xl mx-auto print:max-w-none print:m-0">
                    {children}
                </div>
            </main>

            {/* Global styles for dark theme custom scrollbar */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 20px;
        }
      `}</style>
        </div>
    );
};

export default AdminLayout;
