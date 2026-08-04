import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, User, MessageSquare, Phone, MapPin, Eye, X, Send, Award, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

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
    loyaltyPoints?: number; // Added points
}

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [smsMessage, setSmsMessage] = useState("");
    const [isSendingSMS, setIsSendingSMS] = useState(false);

    const [isBulkSmsModalOpen, setIsBulkSmsModalOpen] = useState(false);
    const [selectedBulkCustomers, setSelectedBulkCustomers] = useState<Customer[]>([]);
    const [bulkSmsMessage, setBulkSmsMessage] = useState("");
    const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);

    // Track redeemed coupons locally for visual confirmation
    const [generatedCoupons, setGeneratedCoupons] = useState<string[]>([]);

    const fetchCustomers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/customers`);
            if (res.ok) {
                const data = await res.json();
                
                // Add default points calculation if not present
                const mappedData = data.map((c: Customer) => {
                    const totalSpent = c.orders?.reduce((sum, o) => sum + o.total, 0) || 0;
                    // Seed initial points: 1 point per ৳100 spent, plus 10 points signup bonus
                    const points = Math.floor(totalSpent / 100) + 10;
                    return {
                        ...c,
                        loyaltyPoints: points
                    };
                });
                
                setCustomers(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            toast.error(t("pos.failed_to_fetch_customers", "Failed to fetch customers"));
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
                toast.success(t("customers.msg_sent", "Message sent successfully!"));
                setSmsMessage("");
                setSelectedCustomer(null);
            } else {
                toast.error(t("customers.msg_failed", "Failed to send message. Check MimSMS configuration."));
            }
        } catch (error) {
            console.error(error);
            toast.error(t("pos.an_error_occurred_while_sending_sms", "An error occurred while sending SMS."));
        } finally {
            setIsSendingSMS(false);
        }
    };

    const handleSendBulkSMS = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBulkCustomers.length === 0 || !bulkSmsMessage.trim()) return;

        setIsSendingBulkSms(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/customers/bulk-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: bulkSmsMessage,
                    customerIds: selectedBulkCustomers.map(c => c._id)
                }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(t("customers.bulk_msg_sent", "Bulk message sent to {{count}} customers successfully!", { count: data.count }));
                setBulkSmsMessage("");
                setIsBulkSmsModalOpen(false);
            } else {
                toast.error(t("pos.failed_to_send_bulk_message_check_config", "Failed to send bulk message. Check configuration."));
            }
        } catch (error) {
            console.error(error);
            toast.error(t("pos.an_error_occurred_while_sending_bulk_sms", "An error occurred while sending bulk SMS."));
        } finally {
            setIsSendingBulkSms(false);
        }
    };

    // Loyalty Tier calculation based on total orders
    const getLoyaltyTier = (ordersCount: number) => {
        if (ordersCount >= 10) return { name: "Gold Member", color: "text-amber-600 bg-amber-50 border-amber-200" };
        if (ordersCount >= 5) return { name: "Silver Member", color: "text-slate-600 bg-slate-50 border-slate-200" };
        return { name: "Bronze Member", color: "text-yellow-800 bg-yellow-50/50 border-yellow-200" };
    };

    // Handle point redemption
    const handleRedeemPoints = (pointsToRedeem: number, discountAmount: number) => {
        if (!selectedCustomer) return;
        const currentPoints = selectedCustomer.loyaltyPoints || 0;
        
        if (currentPoints < pointsToRedeem) {
            toast.error("Insufficient loyalty points!");
            return;
        }

        const coupon = `LOYAL-${discountAmount}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        // Update customer in local state
        setCustomers(prev => prev.map(c => c._id === selectedCustomer._id ? {
            ...c,
            loyaltyPoints: currentPoints - pointsToRedeem
        } : c));

        // Update selected customer state
        setSelectedCustomer(prev => prev ? {
            ...prev,
            loyaltyPoints: currentPoints - pointsToRedeem
        } : null);

        setGeneratedCoupons(prev => [coupon, ...prev]);
        toast.success(`Redeemed ${pointsToRedeem} points! Coupon code generated: ${coupon}`, {
            duration: 5000
        });
    };

    // Helper to get favorite items from history
    const getFavoriteItems = (orders: Order[]) => {
        if (!orders || orders.length === 0) return [];
        const counts: Record<string, number> = {};
        orders.forEach(o => {
            o.items?.forEach(item => {
                counts[item.title] = (counts[item.title] || 0) + item.quantity;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([title, qty]) => ({ title, qty }));
    };

    return (
        <AdminLayout title="Customers">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder={t("customers.search_placeholder", "Search customers by name or phone...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[8px] pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-400 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setSelectedBulkCustomers(customers.filter(c => c.phone && c.phone !== 'N/A'));
                            setBulkSmsMessage("");
                            setIsBulkSmsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[8px] font-medium transition-colors shrink-0 text-sm"
                    >
                        <MessageSquare className="w-5 h-5" />
                        {t("customers.send_bulk_sms", "Send Bulk SMS")}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCustomers.map(customer => {
                            const tier = getLoyaltyTier(customer.orders?.length || 0);
                            return (
                                <div key={customer._id} className="bg-white border border-neutral-200 rounded-[12px] p-5 hover:border-neutral-300 transition-all flex flex-col justify-between h-full hover:shadow-sm">
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-neutral-900">{customer.name}</h3>
                                                    <p className="text-[10px] text-neutral-400">{t("customers.joined", "Joined")} {new Date(customer.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${tier.color}`}>
                                                {tier.name}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Phone className="w-4 h-4 text-neutral-400" />
                                                {customer.phone}
                                            </div>
                                            <div className="flex items-start gap-2 text-sm text-neutral-500">
                                                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-neutral-400" />
                                                <span className="line-clamp-2">{customer.address}</span>
                                            </div>
                                            
                                            {/* Loyalty Points display in cards */}
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 p-2 rounded-[8px] mt-2">
                                                <Award className="w-4 h-4" />
                                                <span>Loyalty Balance: {customer.loyaltyPoints || 0} Points</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setGeneratedCoupons([]);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-bold rounded-[8px] transition-colors border border-neutral-200"
                                        >
                                            <Eye className="w-4 h-4" /> {t("customers.view_details", "View Details")}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredCustomers.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-dashed border-neutral-300 rounded-[12px]">
                                <User className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-neutral-700 mb-1">{t("customers.no_customers_found", "No customers found")}</h3>
                                <p className="text-neutral-500 text-sm">{t("customers.try_adjusting_search", "Try adjusting your search query.")}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Customer Details Modal with Loyalty additions */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="relative bg-white border border-neutral-200 rounded-[24px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-black text-neutral-900">{selectedCustomer.name}'s Profile</h2>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getLoyaltyTier(selectedCustomer.orders?.length || 0).color}`}>
                                            {getLoyaltyTier(selectedCustomer.orders?.length || 0).name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">{selectedCustomer.phone} • {selectedCustomer.address}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content Body */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 custom-scrollbar">
                                
                                {/* Left Column: Order History */}
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-neutral-400" /> {t("customers.order_history", "Order History")}
                                    </h3>
                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                        {selectedCustomer.orders?.length > 0 ? selectedCustomer.orders.map(order => (
                                            <div key={order._id} className="bg-neutral-50 border border-neutral-200 rounded-[12px] p-4 hover:border-neutral-300 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-mono text-neutral-400 uppercase">#{order._id.slice(-6)}</span>
                                                        <p className="text-xs font-bold text-neutral-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-100 text-primary' : 'bg-neutral-200 text-neutral-600'}`}>
                                                            {order.status}
                                                        </span>
                                                        <p className="font-black text-neutral-900 text-sm mt-1">৳{Math.round(order.total)}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-neutral-200/60 space-y-1">
                                                    {order.items?.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-xs text-neutral-500">
                                                            <span>{item.quantity}x {item.title}</span>
                                                            <span>৳{Math.round(item.price * item.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-neutral-400 text-xs">{t("customers.no_orders_yet", "No orders yet.")}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Loyalty Redemption Panel & Direct Message */}
                                <div className="w-full lg:w-96 shrink-0 space-y-6">
                                    
                                    {/* Loyalty CRM Rewards Point Panel */}
                                    <div className="bg-indigo-50/50 border border-indigo-200 rounded-[16px] p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Gift className="w-5 h-5 text-indigo-600" />
                                            <h4 className="text-sm font-bold text-indigo-900">Loyalty Rewards Redemption</h4>
                                        </div>

                                        {/* Point Stats */}
                                        <div className="flex items-center justify-between bg-white border border-indigo-100 p-4 rounded-[12px] shadow-sm">
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Balance</p>
                                                <p className="text-2xl font-black text-indigo-700 mt-1">{selectedCustomer.loyaltyPoints || 0} pts</p>
                                            </div>
                                            <div className="text-right border-l pl-4 border-indigo-100">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Redeem Value</p>
                                                <p className="text-lg font-black text-emerald-600 mt-1">৳{((selectedCustomer.loyaltyPoints || 0) * 0.5).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Redeem Action buttons */}
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRedeemPoints(50, 25)}
                                                disabled={(selectedCustomer.loyaltyPoints || 0) < 50}
                                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-neutral-200 hover:border-indigo-400 disabled:opacity-50 hover:bg-indigo-50 rounded-[10px] text-xs font-bold transition-all text-neutral-800"
                                            >
                                                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Redeem 50 Pts</span>
                                                <span className="text-indigo-600">৳25.00 Off Coupon</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRedeemPoints(100, 60)}
                                                disabled={(selectedCustomer.loyaltyPoints || 0) < 100}
                                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-neutral-200 hover:border-indigo-400 disabled:opacity-50 hover:bg-indigo-50 rounded-[10px] text-xs font-bold transition-all text-neutral-800"
                                            >
                                                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Redeem 100 Pts</span>
                                                <span className="text-indigo-600">৳60.00 Off Coupon</span>
                                            </button>
                                        </div>

                                        {/* Generated Coupons list */}
                                        {generatedCoupons.length > 0 && (
                                            <div className="bg-white border border-indigo-100 p-3 rounded-[12px] space-y-2 text-xs">
                                                <p className="font-bold text-neutral-500 text-[10px] uppercase">Active Coupon Codes</p>
                                                {generatedCoupons.map((code) => (
                                                    <div key={code} className="flex justify-between items-center bg-yellow-50 border border-yellow-200 px-2.5 py-1.5 rounded-[6px] font-mono font-bold text-yellow-800">
                                                        <span>{code}</span>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Ready</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Direct SMS Panel */}
                                    <div className="bg-neutral-50 border border-neutral-200 rounded-[16px] p-5">
                                        <h4 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-neutral-500" /> Direct SMS Notification
                                        </h4>
                                        <form onSubmit={handleSendSMS} className="space-y-4">
                                            <textarea
                                                required
                                                rows={3}
                                                value={smsMessage}
                                                onChange={(e) => setSmsMessage(e.target.value)}
                                                placeholder="Type custom SMS notification..."
                                                className="w-full bg-white border border-neutral-200 rounded-[8px] p-3 text-xs text-neutral-900 focus:outline-none focus:border-indigo-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSendingSMS || !smsMessage.trim()}
                                                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-[8px] transition-colors"
                                            >
                                                {isSendingSMS ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                Send SMS Alert
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk SMS Modal */}
            <AnimatePresence>
                {isBulkSmsModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="relative bg-white border border-neutral-200 rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                                <div>
                                    <h2 className="text-lg font-black text-neutral-900">{t("customers.send_bulk_sms", "Send Bulk SMS")}</h2>
                                    <p className="text-xs text-neutral-400">{t("customers.bulk_sms_desc", "Send a promotional or alert message to multiple customers")}</p>
                                </div>
                                <button
                                    onClick={() => setIsBulkSmsModalOpen(false)}
                                    className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                                <div>
                                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        <span>Target Broadcast Group ({selectedBulkCustomers.length})</span>
                                    </h3>
                                    <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-[8px] flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {selectedBulkCustomers.length > 0 ? (
                                            selectedBulkCustomers.map(customer => (
                                                <div key={customer._id} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    <span>{customer.name}</span>
                                                    <button 
                                                        onClick={() => setSelectedBulkCustomers(prev => prev.filter(c => c._id !== customer._id))}
                                                        className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-neutral-500 w-full text-center py-2">{t("customers.no_customers_selected", "No customers selected")}</p>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={handleSendBulkSMS} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Broadcasting Message Content</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={bulkSmsMessage}
                                            onChange={(e) => setBulkSmsMessage(e.target.value)}
                                            placeholder="Type your promotional blast here..."
                                            className="w-full bg-white border border-neutral-200 rounded-[8px] p-3 text-xs text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSendingBulkSms || selectedBulkCustomers.length === 0 || !bulkSmsMessage.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-[8px] transition-colors"
                                    >
                                        {isSendingBulkSms ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Dispatch Broadcast to {selectedBulkCustomers.length} Customers
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminCustomers;
