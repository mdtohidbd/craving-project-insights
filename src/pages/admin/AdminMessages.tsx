import React, { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Phone, Clock, Check, X, Filter, MessageSquare } from "lucide-react";

// Expanded Dummy Data
const initialMessages = [
    { id: 1, from: "+1 (555) 0123", message: "New Order #1042: 2x Latte, 1x Croissant.", time: "Today, 10:42 AM", status: "unread" },
    { id: 2, from: "+1 (555) 0199", message: "Order #1041 ready for pickup.", time: "Today, 10:15 AM", status: "read" },
    { id: 3, from: "+1 (555) 0842", message: "New Order #1040: 1x Espresso, 1x Americano.", time: "Today, 09:30 AM", status: "read" },
    { id: 4, from: "+1 (555) 0921", message: "Customer Inquiry: Do you have almond milk?", time: "Yesterday, 04:20 PM", status: "unread" },
    { id: 5, from: "+1 (555) 0210", message: "Order #1039 cancelled by customer.", time: "Yesterday, 02:15 PM", status: "read" },
    { id: 6, from: "+1 (555) 0456", message: "New Order #1038: 3x Cold Brew, 2x Muffin.", time: "Yesterday, 11:00 AM", status: "read" },
];

const AdminMessages = () => {
    const [messages, setMessages] = useState(initialMessages);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    const handleMarkAsRead = (id: number) => {
        setMessages(messages.map(msg => msg.id === id ? { ...msg, status: "read" } : msg));
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.from.includes(searchTerm) || msg.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || msg.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout title="SMS Messages">
            <div className="space-y-6">

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by number or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-900 p-1 border border-neutral-800 rounded-lg w-full sm:w-auto">
                        <button
                            onClick={() => setFilter("all")}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-neutral-800 text-neutral-50' : 'text-neutral-400 hover:text-neutral-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-primary/20 text-primary' : 'text-neutral-400 hover:text-neutral-200'}`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter("read")}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'read' ? 'bg-neutral-800 text-neutral-50' : 'text-neutral-400 hover:text-neutral-200'}`}
                        >
                            Read
                        </button>
                    </div>
                </div>

                {/* Message List */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-neutral-800/50">
                        {filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-6 transition-colors hover:bg-neutral-800/30 flex flex-col md:flex-row gap-4 md:items-start justify-between ${msg.status === 'unread' ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className={`p-3 rounded-full shrink-0 ${msg.status === 'unread' ? 'bg-primary/20 text-primary' : 'bg-neutral-800 text-neutral-400'}`}>
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-medium ${msg.status === 'unread' ? 'text-primary' : 'text-neutral-200'}`}>
                                                {msg.from}
                                            </h3>
                                            {msg.status === 'unread' && (
                                                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                            )}
                                        </div>
                                        <p className={`text-sm ${msg.status === 'unread' ? 'text-neutral-100 font-medium' : 'text-neutral-400'}`}>
                                            {msg.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                                            <Clock className="w-3 h-3" />
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>

                                {msg.status === 'unread' && (
                                    <div className="flex gap-2 shrink-0 md:mt-0 mt-2 md:pl-0 pl-14">
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id)}
                                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center gap-1 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                            Mark Read
                                        </button>
                                        <button className="px-3 py-2 border border-neutral-700 text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                                            Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredMessages.length === 0 && (
                            <div className="p-12 text-center text-neutral-500">
                                <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-neutral-300 mb-1">No messages found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMessages;
