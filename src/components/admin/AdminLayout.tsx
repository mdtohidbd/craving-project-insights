import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Package, MessageSquare,
    Settings, Bell, Menu, ArrowUpRight, Tag, List, ShoppingCart, Users
} from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Orders", path: "/admin/orders", icon: <ShoppingCart className="w-5 h-5" /> },
        { label: "Customers", path: "/admin/customers", icon: <Users className="w-5 h-5" /> },
        { label: "Menu Items", path: "/admin/menu", icon: <List className="w-5 h-5" /> },
        { label: "Categories", path: "/admin/categories", icon: <Tag className="w-5 h-5" /> },
        { label: "Inventory", path: "/admin/inventory", icon: <Package className="w-5 h-5" /> },
        { label: "Messages", path: "/admin/messages", icon: <MessageSquare className="w-5 h-5" /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        S
                    </div>
                    <span className="text-lg font-semibold tracking-tight">Skybridge Admin</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800/50 font-medium'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-neutral-50 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                        Back to Website
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-neutral-400 hover:text-neutral-50 transition-colors rounded-md hover:bg-neutral-800"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-semibold">{title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-neutral-400 hover:text-neutral-50 transition-colors rounded-full hover:bg-neutral-800">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Dashboard/Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar relative z-0">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
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
