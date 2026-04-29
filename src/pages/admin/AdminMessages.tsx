import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { MessageSquare, Search, Check, X, Smartphone, Bot, User, Info } from "lucide-react";

interface Message {
    _id: string;
    recipientNumber: string;
    messageContent: string;
    type: 'automatic' | 'custom';
    status: 'sent' | 'failed' | 'pending';
    createdAt: string;
    relatedOrderId?: {
        _id: string;
        total: number;
    };
    relatedCustomerId?: {
        _id: string;
        name: string;
    };
}

const AdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const normalizeSmsCurrency = (message: string) => {
        return message.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (_, amount: string) => {
            const parsed = Number(amount);
            if (Number.isNaN(parsed)) return `৳${amount}`;
            return `৳${parsed.toFixed(2)}`;
        });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(msg =>
        msg.recipientNumber.includes(searchQuery) ||
        msg.messageContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.relatedCustomerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );

    return (
        <AdminLayout title="Messages & SMS Logs">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search by phone, name, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-400"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-600">
                                <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Date & Time</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Recipient</th>
                                        <th className="px-6 py-4 font-medium">Message Content</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                    {filteredMessages.map((msg) => (
                                        <tr key={msg._id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-neutral-900">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${msg.type === 'automatic'
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                                    }`}>
                                                    {msg.type === 'automatic' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    {msg.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Smartphone className="w-4 h-4 text-neutral-500" />
                                                    <span className="font-medium text-neutral-900">{msg.recipientNumber}</span>
                                                </div>
                                                {msg.relatedCustomerId && (
                                                    <div className="text-xs text-neutral-500 pl-6">
                                                        {msg.relatedCustomerId.name}
                                                    </div>
                                                )}
                                                {msg.relatedOrderId && (
                                                    <div className="text-xs text-neutral-500 pl-6">
                                                        Order #{msg.relatedOrderId._id.slice(-6).toUpperCase()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-neutral-600 max-w-sm line-clamp-2" title={msg.messageContent}>
                                                    {normalizeSmsCurrency(msg.messageContent)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${msg.status === 'sent'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : msg.status === 'failed'
                                                            ? 'bg-red-100 text-red-700 border-red-200'
                                                            : 'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {msg.status === 'sent' && <Check className="w-3 h-3" />}
                                                    {msg.status === 'failed' && <X className="w-3 h-3" />}
                                                    {msg.status === 'pending' && <Info className="w-3 h-3" />}
                                                    {msg.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMessages.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                                                <p className="text-neutral-600 font-medium">No SMS messages logged yet.</p>
                                                <p className="text-xs mt-1 text-neutral-600">Automatic limits and custom outputs will appear here.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminMessages;
