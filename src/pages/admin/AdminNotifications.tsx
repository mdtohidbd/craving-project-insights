import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
    Bell, ShoppingCart, MessageSquare, AlertCircle,
    CheckCircle2, Clock, Trash2, Filter, Search, Calendar
} from "lucide-react";

interface Notification {
    _id: string;
    type: 'order' | 'reservation' | 'message' | 'stock';
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        return n.type === filter;
    });

    const markAsRead = async (id: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications/${id}/read`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (err) { }
    };

    const deleteNotification = async (id: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n._id !== id));
            }
        } catch (err) { }
    };

    const markAllAsRead = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/notifications/read-all`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) { }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
        return date.toLocaleDateString();
    };

    return (
        <AdminLayout title="Notifications">
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm sticky top-0 z-10">
                    <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg overflow-x-auto no-scrollbar scroll-smooth">
                        {['all', 'unread', 'order', 'reservation', 'message', 'stock'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all whitespace-nowrap ${filter === f
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-4 py-2 uppercase tracking-wider"
                    >
                        Mark all as read
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20">
                            <Clock className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`group relative bg-white border rounded-xl p-5 transition-all hover:shadow-md ${notif.isRead ? 'border-neutral-200 opacity-80' : 'border-primary/20 bg-primary/[0.02] shadow-sm shadow-primary/5'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${notif.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                                        notif.type === 'reservation' ? 'bg-rose-100 text-rose-600' :
                                            notif.type === 'message' ? 'bg-blue-100 text-blue-600' :
                                                'bg-amber-100 text-amber-600'
                                    }`}>
                                    {notif.type === 'order' ? <ShoppingCart className="w-6 h-6" /> :
                                        notif.type === 'reservation' ? <Calendar className="w-6 h-6" /> :
                                            notif.type === 'message' ? <MessageSquare className="w-6 h-6" /> :
                                                <AlertCircle className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-base font-bold truncate ${notif.isRead ? 'text-neutral-700' : 'text-neutral-900'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[11px] font-bold text-neutral-400 whitespace-nowrap flex items-center gap-1.5 ml-4 uppercase tracking-tighter">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-4">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="text-[11px] font-bold text-neutral-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full ring-4 ring-primary/10"></div>
                                )}
                            </div>
                        </div>
                    ))}

                    {!loading && filteredNotifications.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300">
                            <Bell className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-neutral-400">No notifications found</h3>
                            <p className="text-sm text-neutral-400 mt-1">Status: All caught up</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNotifications;
