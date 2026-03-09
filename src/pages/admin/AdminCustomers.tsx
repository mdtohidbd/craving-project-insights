import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, User, MessageSquare, Phone, MapPin, Eye, X, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
    title: string;
    price: number;
    quantity: number;
}

interface Order {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface Customer {
    _id: string;
    name: string;
    phone: string;
    address: string;
    orders: Order[];
    createdAt: string;
}

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [smsMessage, setSmsMessage] = useState("");
    const [isSendingSMS, setIsSendingSMS] = useState(false);

    const fetchCustomers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/customers`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            toast.error("Failed to fetch customers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    const handleSendSMS = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !smsMessage.trim()) return;

        setIsSendingSMS(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/customers/${selectedCustomer._id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: smsMessage }),
            });

            if (res.ok) {
                toast.success("Message sent successfully!");
                setSmsMessage("");
                setSelectedCustomer(null);
            } else {
                toast.error("Failed to send message. Check MimSMS configuration.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while sending SMS.");
        } finally {
            setIsSendingSMS(false);
        }
    };

    return (
        <AdminLayout title="Customers">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search customers by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCustomers.map(customer => (
                            <div key={customer._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-100">{customer.name}</h3>
                                            <p className="text-xs text-neutral-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-800/50 text-neutral-300 text-xs px-2.5 py-1 rounded-full font-medium">
                                        {customer.orders?.length || 0} Orders
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Phone className="w-4 h-4" />
                                        {customer.phone}
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-neutral-400">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{customer.address}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors border border-neutral-700 hover:border-neutral-600"
                                    >
                                        <Eye className="w-4 h-4" /> View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-dashed border-neutral-800 rounded-xl">
                                <User className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-neutral-300 mb-1">No customers found</h3>
                                <p className="text-neutral-500 text-sm">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Customer Details Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedCustomer(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-neutral-800 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-100">{selectedCustomer.name}'s Profile</h2>
                                    <p className="text-sm text-neutral-400">{selectedCustomer.phone} • {selectedCustomer.address}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8 custom-scrollbar">
                                {/* Order History Column */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-indigo-400" /> Order History
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedCustomer.orders?.length > 0 ? selectedCustomer.orders.map(order => (
                                            <div key={order._id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-xs font-mono text-neutral-500 uppercase">#{order._id.slice(-6)}</span>
                                                        <p className="text-sm font-medium text-neutral-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                                                            {order.status}
                                                        </span>
                                                        <p className="font-bold text-neutral-100 mt-1">৳{order.total.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-neutral-800/50 space-y-1">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs text-neutral-400">
                                                            <span>{item.quantity}x {item.title}</span>
                                                            <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-neutral-500 text-sm">No orders yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Send SMS Column */}
                                <div className="w-full md:w-80 shrink-0">
                                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-indigo-400" /> Send Message
                                    </h3>
                                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                                        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                                            Send a direct SMS to <span className="text-neutral-200 font-medium">{selectedCustomer.phone}</span> using the MimSMS API integration.
                                        </p>
                                        <form onSubmit={handleSendSMS} className="space-y-4">
                                            <textarea
                                                required
                                                rows={4}
                                                value={smsMessage}
                                                onChange={(e) => setSmsMessage(e.target.value)}
                                                placeholder="Type your message here..."
                                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                            ></textarea>
                                            <button
                                                type="submit"
                                                disabled={isSendingSMS || !smsMessage.trim()}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                {isSendingSMS ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                Send SMS
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminCustomers;
