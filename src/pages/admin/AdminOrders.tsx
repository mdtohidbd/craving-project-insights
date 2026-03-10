import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Check, X, Info, Search, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    menuItemId: string;
    title: string;
    price: number;
    quantity: number;
}

interface Order {
    _id: string;
    customerInfo: {
        name: string;
        phone: string;
        address: string;
        notes?: string;
    };
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    smsStatus: string;
    createdAt: string;
}

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/orders`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to fetch orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Order marked as ${newStatus}`);
                fetchOrders();
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    return (
        <AdminLayout title="Orders">
            <div className="space-y-6 print:hidden">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-400">
                                <thead className="bg-neutral-900/50 text-xs uppercase text-neutral-500 border-b border-neutral-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Order ID</th>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Total</th>
                                        <th className="px-6 py-4 font-medium">SMS Status</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-neutral-800/50 rounded-lg">
                                                        <FileText className="w-4 h-4 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-neutral-100">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-neutral-200">{order.customerInfo.name}</p>
                                                <p className="text-xs">{order.customerInfo.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-neutral-100">
                                                ৳{Math.round(order.total)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.smsStatus === 'sent'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : order.smsStatus === 'failed'
                                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                    {order.smsStatus === 'sent' && <Check className="w-3 h-3" />}
                                                    {order.smsStatus === 'failed' && <X className="w-3 h-3" />}
                                                    {order.smsStatus === 'pending' && <Info className="w-3 h-3" />}
                                                    {order.smsStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className="bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-amber-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-amber-400 hover:text-amber-300 font-medium text-xs">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Slip Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0 print:block">
                    <div className="bg-white text-[hsl(195_30%_8%)] rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col print:shadow-none print:max-w-none print:rounded-none print:max-h-none print:overflow-visible">
                        
                        {/* Non-printable header controls */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10" data-html2canvas-ignore>
                            <h3 className="font-semibold text-gray-800">Order Slip</h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.print()}
                                    className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                    title="Print Order Slip"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Area - Based on Checkout.tsx receipt */}
                        <div id="printable-slip" className="p-6 md:p-8 bg-white text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 opacity-80" style={{ backgroundColor: '#eab308', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}></div>
                            <div className="text-center mb-6 border-b border-gray-200 pb-6 pt-2">
                                <h3 className="font-serif font-bold text-2xl text-[hsl(195_30%_14%)] mb-1">Cravings...</h3>
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Order Receipt</p>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-bold">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-xs">{new Date(selectedOrder.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-6">
                                <span className="text-gray-500">Payment Status</span>
                                <span className="font-medium text-[13px] capitalize">{selectedOrder.status}</span>
                            </div>

                            <div className="border-t border-b border-dashed border-gray-300 py-4 mb-6 space-y-3">
                                {selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 pr-4">
                                            <span className="font-bold block text-gray-800">{item.quantity}x {item.title}</span>
                                        </div>
                                        <span className="font-medium text-gray-800">৳{Math.round(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-800">৳{Math.round(selectedOrder.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="font-medium text-gray-800">৳{Math.round((selectedOrder.total || 0) - (selectedOrder.subtotal || 0))}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="font-bold text-base text-gray-800">Total</span>
                                    <span className="font-bold text-lg text-[#eab308]">৳{Math.round(selectedOrder.total || 0)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100">
                                <span className="font-bold text-gray-700 block mb-1">Delivery Details:</span>
                                {selectedOrder.customerInfo?.name} <br/>
                                {selectedOrder.customerInfo?.phone} <br/>
                                <span className="whitespace-pre-line">{selectedOrder.customerInfo?.address}</span>
                                {selectedOrder.customerInfo?.notes && (
                                    <>
                                        <br/><br/>
                                        <span className="font-semibold text-gray-700">Notes:</span> {selectedOrder.customerInfo.notes}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
