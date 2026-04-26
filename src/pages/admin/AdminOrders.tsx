import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Check, X, Info, Search, FileText, Printer, Clock, ArrowRight, CheckCircle, CheckCheck, LayoutGrid, List as ListIcon } from "lucide-react";
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

const KDSOrderCard = ({ order, onUpdateStatus, onSelect }: { order: Order, onUpdateStatus: any, onSelect: any }) => {
    const getElapsedTime = (createdAt: string) => {
        const diff = new Date().getTime() - new Date(createdAt).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    const isUrgent = (createdAt: string) => {
        const diff = new Date().getTime() - new Date(createdAt).getTime();
        return diff > 15 * 60000; // 15 minutes
    };

    return (
        <div className={`bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'border-red-200 bg-red-50/30' : 'border-neutral-100'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-neutral-100 p-1.5 rounded-lg">
                        <FileText className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 leading-none">#{order._id.slice(-6).toUpperCase()}</h4>
                        <p className="text-xs font-semibold text-neutral-700 mt-1 line-clamp-1">{order.customerInfo?.name || "Walk-in Customer"}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <Clock className={`w-3 h-3 ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-red-500' : 'text-neutral-400'}`} />
                            <span className={`text-[10px] font-medium ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-red-600' : 'text-neutral-500'}`}>
                                {getElapsedTime(order.createdAt)} ago
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onSelect} className="text-amber-600 hover:text-amber-700 text-xs font-semibold underline underline-offset-4">
                    Details
                </button>
            </div>

            <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-neutral-700 font-medium">
                            <span className="text-amber-600 font-bold mr-1">{item.quantity}x</span> {item.title}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                {order.status === 'pending' && (
                    <button 
                        onClick={() => onUpdateStatus(order._id, 'preparing')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200"
                    >
                        <Clock className="w-3.5 h-3.5" /> Start Cooking
                    </button>
                )}
                {order.status === 'preparing' && (
                    <button 
                        onClick={() => onUpdateStatus(order._id, 'ready')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                    </button>
                )}
                {order.status === 'ready' && (
                    <button 
                        onClick={() => onUpdateStatus(order._id, 'completed')}
                        className="flex-1 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        <CheckCheck className="w-3.5 h-3.5" /> Serve & Complete
                    </button>
                )}
            </div>
        </div>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'kds'>('kds');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
        // Set up auto-refresh for KDS every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string, actionName?: string) => {
        try {
            setProcessingId(orderId);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                if (newStatus === 'completed') {
                    toast.success(actionName ? actionName : `Order #${orderId.slice(-6).toUpperCase()} has been served & completed! 🎉`, {
                        description: "The order has been removed from the KDS board.",
                        duration: 5000,
                    });
                } else if (newStatus === 'ready') {
                    toast.success(`Order #${orderId.slice(-6).toUpperCase()} is ready for serve! 🍽️`);
                } else if (newStatus === 'preparing') {
                    toast.info(`Cooking started for Order #${orderId.slice(-6).toUpperCase()} 👨‍🍳`);
                } else {
                    toast.success(`Order status updated to ${newStatus}`);
                }
                await fetchOrders();
            } else {
                toast.error("Failed to update order status");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while updating");
        } finally {
            setProcessingId(null);
        }
    };

    const getElapsedTime = (createdAt: string) => {
        const diff = new Date().getTime() - new Date(createdAt).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    const handlePrintOrder = (order: Order) => {
        setSelectedOrder(order);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const filteredListOrders = orders.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.customerInfo.name && o.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (o.customerInfo.phone && o.customerInfo.phone.includes(searchTerm))
    );

    return (
        <AdminLayout title="Kitchen Display System">
            <div className="space-y-6 print:hidden h-full flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between gap-6 items-center mb-2">
                    <div className="flex bg-neutral-900/90 border border-neutral-800 p-1.5 rounded-xl shrink-0 shadow-xl backdrop-blur-md">
                        <button 
                            onClick={() => setViewMode('kds')}
                            className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2.5 ${viewMode === 'kds' ? 'bg-neutral-800 text-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> KDS BOARD
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2.5 ${viewMode === 'list' ? 'bg-neutral-800 text-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-neutral-500 hover:text-neutral-300'}`}
                        >
                            <ListIcon className="w-4 h-4" /> LIST VIEW
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-sm w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-neutral-400 text-sm font-medium"
                        />
                    </div>
                </div>

                {isLoading && orders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 flex-1">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    /* Conditional View Rendering */
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {viewMode === 'list' ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
                                    {filteredListOrders.map((order) => (
                                        <div key={order._id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:border-amber-500 transition-colors flex flex-col group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-neutral-300 group-hover:bg-amber-500 transition-colors"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="w-4 h-4 text-amber-500" />
                                                        <h4 className="font-bold text-neutral-900">#{order._id.slice(-6).toUpperCase()}</h4>
                                                    </div>
                                                    <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-lg text-amber-500">৳{Math.round(order.total)}</span>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-50 rounded-lg p-3 mb-4 border border-neutral-200 flex-1">
                                                <p className="font-medium text-neutral-900 line-clamp-1">{order.customerInfo.name || "Walk-in Customer"}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{order.customerInfo.phone || "N/A"}</p>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border uppercase tracking-wider ${
                                                    order.smsStatus === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    order.smsStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    {order.smsStatus === 'sent' && <Check className="w-3 h-3" />}
                                                    {order.smsStatus === 'failed' && <X className="w-3 h-3" />}
                                                    {order.smsStatus === 'pending' && <Info className="w-3 h-3" />}
                                                    SMS {order.smsStatus}
                                                </span>

                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`bg-white border text-xs rounded-md px-2 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                                                        order.status === 'completed' ? 'border-emerald-300 text-emerald-600' :
                                                        order.status === 'pending' ? 'border-amber-300 text-amber-600' :
                                                        order.status === 'preparing' ? 'border-blue-300 text-blue-600' :
                                                        order.status === 'ready' ? 'border-emerald-300 text-emerald-600' :
                                                        order.status === 'cancelled' ? 'border-rose-300 text-rose-600' :
                                                        'border-neutral-300 text-neutral-600'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-white"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {filteredListOrders.length === 0 && (
                                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
                                            <Search className="w-12 h-12 mb-4 opacity-50" />
                                            <p>No orders found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-0 -mx-2 px-2">
                                {/* Column 1: New Orders (Pending) */}
                                <div className="flex-1 min-w-[360px] flex flex-col bg-neutral-900/40 rounded-2xl border border-neutral-800 overflow-hidden backdrop-blur-sm">
                                    <div className="p-6 border-b border-neutral-800/50 flex justify-between items-center">
                                        <h3 className="font-serif font-bold text-xl text-neutral-100 tracking-tight">New Orders</h3>
                                        <span className="bg-amber-500/10 text-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                            {pendingOrders.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {pendingOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={() => setSelectedOrder(order)} />
                                        ))}
                                        {pendingOrders.length === 0 && (
                                            <div className="h-60 flex items-center justify-center text-neutral-600 text-sm font-medium italic opacity-60">
                                                No new orders
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Cooking (Preparing) */}
                                <div className="flex-1 min-w-[360px] flex flex-col bg-neutral-900/40 rounded-2xl border border-neutral-800 overflow-hidden backdrop-blur-sm">
                                    <div className="p-6 border-b border-neutral-800/50 flex justify-between items-center">
                                        <h3 className="font-serif font-bold text-xl text-neutral-100 tracking-tight">Cooking</h3>
                                        <span className="bg-blue-500/10 text-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                            {preparingOrders.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {preparingOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={() => setSelectedOrder(order)} />
                                        ))}
                                        {preparingOrders.length === 0 && (
                                            <div className="h-60 flex items-center justify-center text-neutral-600 text-sm font-medium italic opacity-60">
                                                No orders currently cooking
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3: Ready for Serve */}
                                <div className="flex-1 min-w-[360px] flex flex-col bg-neutral-900/40 rounded-2xl border border-neutral-800 overflow-hidden backdrop-blur-sm">
                                    <div className="p-6 border-b border-neutral-800/50 flex justify-between items-center">
                                        <h3 className="font-serif font-bold text-xl text-neutral-100 tracking-tight">Ready for Serve</h3>
                                        <span className="bg-emerald-500/10 text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                            {readyOrders.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                        {readyOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={() => setSelectedOrder(order)} />
                                        ))}
                                        {readyOrders.length === 0 && (
                                            <div className="h-60 flex items-center justify-center text-neutral-600 text-sm font-medium italic opacity-60">
                                                No orders ready
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
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
                        <div id="printable-slip" className="p-6 md:p-8 bg-white text-left relative overflow-hidden print:p-0 print:m-0">
                            <div className="absolute top-0 left-0 right-0 h-2 opacity-80 print:hidden" style={{ backgroundColor: '#eab308', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}></div>
                            
                            <div className="text-center mb-6 border-b border-gray-200 pb-6 pt-2">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-white font-serif text-2xl font-bold border-4 border-amber-500">C</div>
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-[hsl(195_30%_14%)] mb-1">Cravings...</h3>
                                <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Fine Dining Restaurant</p>
                                <p className="text-[10px] text-gray-400 mt-1">123 Culinary Ave, Foodie City</p>
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
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-[13px] capitalize text-amber-600">{selectedOrder.status}</span>
                            </div>

                            <div className="border-t border-b border-dashed border-gray-300 py-4 mb-6 space-y-3">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    <span>Description</span>
                                    <span>Amount</span>
                                </div>
                                {selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 pr-4">
                                            <span className="font-bold block text-gray-800">{item.quantity}x {item.title}</span>
                                            <span className="text-[10px] text-gray-400">৳{item.price} each</span>
                                        </div>
                                        <span className="font-bold text-gray-800">৳{Math.round(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-sm mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-800">৳{Math.round(selectedOrder.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tax & Fees</span>
                                    <span className="font-medium text-gray-800">৳{Math.round((selectedOrder.total || 0) - (selectedOrder.subtotal || 0))}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                    <span className="font-bold text-base text-gray-800 uppercase tracking-tight">Total Amount</span>
                                    <span className="font-bold text-xl text-neutral-900">৳{Math.round(selectedOrder.total || 0)}</span>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-2xl p-5 text-xs text-neutral-500 border border-neutral-100 mb-8">
                                <span className="font-bold text-neutral-800 block mb-2 uppercase tracking-widest text-[9px]">Customer Information</span>
                                <div className="space-y-1">
                                    <p className="flex justify-between"><span className="text-neutral-400">Name:</span> <span className="font-semibold text-neutral-700">{selectedOrder.customerInfo?.name || "Walk-in Customer"}</span></p>
                                    <p className="flex justify-between"><span className="text-neutral-400">Phone:</span> <span className="font-semibold text-neutral-700">{selectedOrder.customerInfo?.phone || "N/A"}</span></p>
                                    <p className="flex flex-col gap-1 mt-2">
                                        <span className="text-neutral-400">Address:</span> 
                                        <span className="font-medium text-neutral-700 whitespace-pre-line leading-relaxed">{selectedOrder.customerInfo?.address}</span>
                                    </p>
                                </div>
                                {selectedOrder.customerInfo?.notes && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200/50">
                                        <span className="font-bold text-neutral-800 block mb-1">Notes:</span> 
                                        <p className="italic text-neutral-600">{selectedOrder.customerInfo.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="text-center pt-4">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${selectedOrder._id}`} 
                                    alt="QR Code" 
                                    className="mx-auto mb-4 border-4 border-white shadow-md rounded-xl"
                                    width="100"
                                    height="100"
                                />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Thank you for your visit!</p>
                                <p className="text-[9px] text-gray-300">Visit us again at www.craving-restaurant.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #eab308;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminOrders;
