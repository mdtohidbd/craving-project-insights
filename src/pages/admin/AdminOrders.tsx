import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Check, X, Info, Search, FileText, Printer, Clock, ArrowRight, CheckCircle, CheckCheck, LayoutGrid, List as ListIcon, Users } from "lucide-react";
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
    orderType: 'dine-in' | 'takeaway' | 'online';
    tableNumber?: string;
    deliveryManId?: string;
    deliveryStatus?: 'pending' | 'assigned' | 'out_for_delivery' | 'delivered';
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
        <div className={`bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'border-rose-200 ring-4 ring-rose-500/5' : ''}`}>
            {/* Urgent Indicator */}
            {isUrgent(order.createdAt) && order.status !== 'ready' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                        <FileText className="w-4 h-4 text-neutral-600 group-hover:text-amber-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-serif font-bold text-lg text-neutral-900 leading-none">#{order._id.slice(-6).toUpperCase()}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${order.orderType === 'online' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                order.orderType === 'takeaway' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {order.orderType}
                            </span>
                            {order.orderType === 'dine-in' && order.tableNumber && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                                    <Users className="w-2 h-2" /> T-{order.tableNumber}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className={`w-3 h-3 ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-rose-500' : 'text-neutral-400'}`} />
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-rose-600' : 'text-neutral-500'}`}>
                                {getElapsedTime(order.createdAt)} ago
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => onSelect(order, false)} className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-amber-200 hover:decoration-amber-500 transition-all">
                    Details
                </button>
            </div>

            <div className="mb-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Order Items</p>
                <div className="bg-neutral-50/50 rounded-xl p-3 border border-neutral-100 space-y-2.5">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center">{item.quantity}</span>
                                <span className="text-neutral-800 font-medium">{item.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 mt-auto">
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-semibold text-neutral-600 truncate">{order.customerInfo?.name || "Walk-in Guest"}</p>
                </div>

                <div className="flex gap-2">
                    {order.status === 'pending' && (
                        <button
                            onClick={() => onUpdateStatus(order._id, 'preparing')}
                            className="flex-1 py-3 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-200 active:scale-95"
                        >
                            <Clock className="w-3.5 h-3.5" /> Start Cooking
                        </button>
                    )}
                    {order.status === 'preparing' && (
                        <button
                            onClick={() => onUpdateStatus(order._id, 'ready')}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button
                            onClick={() => {
                                if (order.orderType === 'dine-in') {
                                    onUpdateStatus(order._id, 'completed');
                                } else {
                                    onSelect(order, true); // Open assignment modal
                                }
                            }}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            {order.orderType === 'dine-in' ? 'Serve & Complete' : 'Complete & Deliver'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
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

    const fetchDeliveryMen = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/delivery-men`);
            if (res.ok) setDeliveryMen(await res.json());
        } catch (error) { }
    };

    useEffect(() => {
        fetchOrders();
        fetchDeliveryMen();
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

    const assignDeliveryMan = async (deliveryManId: string) => {
        if (!selectedOrder) return;
        try {
            setProcessingId(selectedOrder._id);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            updateOrderStatus(selectedOrder._id, 'out_for_delivery', `Order assigned to courier. Status updated to Out for Delivery.`);

            // Also update deliveryManId
            await fetch(`${apiUrl}/orders/${selectedOrder._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deliveryManId,
                    deliveryStatus: 'assigned'
                }),
            });

            setShowAssignmentModal(false);
            setSelectedOrder(null);
        } catch (error) {
            toast.error("Failed to assign delivery man");
        } finally {
            setProcessingId(null);
        }
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
                <div className="flex flex-col sm:flex-row justify-between gap-6 items-center mb-6">
                    <div className="flex bg-white border border-neutral-200 p-1.5 rounded-2xl shrink-0 shadow-sm">
                        <button
                            onClick={() => setViewMode('kds')}
                            className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2.5 ${viewMode === 'kds' ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> KDS BOARD
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2.5 ${viewMode === 'list' ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
                        >
                            <ListIcon className="w-4 h-4" /> LIST VIEW
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-sm w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-100/50 border border-neutral-200 text-neutral-900 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-neutral-400 text-[13px] font-medium"
                        />
                    </div>
                </div>

                {isLoading && orders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 flex-1">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {viewMode === 'list' ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
                                    {filteredListOrders.map((order) => (
                                        <div key={order._id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-200 group-hover:bg-amber-500 transition-colors"></div>

                                            <div className="flex justify-between items-start mb-5">
                                                <div>
                                                    <div className="flex items-center gap-2.5 mb-1.5">
                                                        <FileText className="w-4 h-4 text-amber-600" />
                                                        <h4 className="font-serif font-bold text-lg text-neutral-900">#{order._id.slice(-6).toUpperCase()}</h4>
                                                    </div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                                        {new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-serif font-bold text-xl text-amber-600">৳{Math.round(order.total)}</span>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-50 rounded-xl p-4 mb-5 border border-neutral-100 flex-1 group-hover:bg-white transition-colors">
                                                <p className="font-bold text-neutral-900 text-sm leading-tight mb-1">{order.customerInfo.name || "Walk-in Guest"}</p>
                                                <p className="text-[11px] font-medium text-neutral-500">{order.customerInfo.phone || "No phone provided"}</p>
                                            </div>

                                            <div className="flex items-center justify-between mb-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${order.smsStatus === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-sm shadow-emerald-50' :
                                                    order.smsStatus === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-50' :
                                                        'bg-amber-50 text-amber-600 border-amber-200/50 shadow-sm shadow-amber-50'
                                                    }`}>
                                                    {order.smsStatus === 'sent' && <Check className="w-3 h-3" />}
                                                    {order.smsStatus === 'failed' && <X className="w-3 h-3" />}
                                                    {order.smsStatus === 'pending' && <Info className="w-3 h-3" />}
                                                    SMS {order.smsStatus}
                                                </span>

                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`bg-white border text-[11px] rounded-lg px-2.5 py-2 font-bold uppercase tracking-tighter focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer ${order.status === 'completed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/10' :
                                                        order.status === 'pending' ? 'border-amber-200 text-amber-600 bg-amber-50/10' :
                                                            order.status === 'preparing' ? 'border-blue-200 text-blue-600 bg-blue-50/10' :
                                                                order.status === 'ready' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/10' :
                                                                    order.status === 'cancelled' ? 'border-rose-200 text-rose-600 bg-rose-50/10' :
                                                                        'border-neutral-200 text-neutral-600 bg-neutral-50/10'
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
                                                className="w-full py-3 bg-neutral-900 group-hover:bg-amber-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-neutral-100 group-hover:shadow-amber-200"
                                            >
                                                View Details
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                            <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-0 -mx-2 px-2">
                                {/* Column 1: New Orders (Pending) */}
                                <div className="flex-1 min-w-[380px] flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl">
                                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                            <h3 className="font-serif font-bold text-xl text-neutral-900 tracking-tight">New Orders</h3>
                                        </div>
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-200">
                                            {pendingOrders.length} {pendingOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                        {pendingOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={(order: any, isAssignment: boolean) => {
                                                setSelectedOrder(order);
                                                setShowAssignmentModal(isAssignment || false);
                                            }} />
                                        ))}
                                        {pendingOrders.length === 0 && (
                                            <div className="h-60 flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <p className="text-xs font-medium italic">No new orders waiting</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Cooking (Preparing) */}
                                <div className="flex-1 min-w-[380px] flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl">
                                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            <h3 className="font-serif font-bold text-xl text-neutral-900 tracking-tight">Cooking</h3>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-200">
                                            {preparingOrders.length} {preparingOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                        {preparingOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={(order: any, isAssignment: boolean) => {
                                                setSelectedOrder(order);
                                                setShowAssignmentModal(isAssignment || false);
                                            }} />
                                        ))}
                                        {preparingOrders.length === 0 && (
                                            <div className="h-60 flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <p className="text-xs font-medium italic">No orders currently cooking</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3: Ready for Serve */}
                                <div className="flex-1 min-w-[380px] flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl">
                                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <h3 className="font-serif font-bold text-xl text-neutral-900 tracking-tight">Ready for Serve</h3>
                                        </div>
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
                                            {readyOrders.length} {readyOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                        {readyOrders.map(order => (
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onSelect={(order: any, isAssignment: boolean) => {
                                                setSelectedOrder(order);
                                                setShowAssignmentModal(isAssignment || false);
                                            }} />
                                        ))}
                                        {readyOrders.length === 0 && (
                                            <div className="h-60 flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <p className="text-xs font-medium italic">No orders ready for serve</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delivery Assignment Modal */}
            {showAssignmentModal && selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h3 className="font-serif font-bold text-xl text-neutral-900 tracking-tight">Assign Delivery Man</h3>
                                <p className="text-xs text-neutral-500 mt-1">Select a courier for Order #{selectedOrder._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={() => { setShowAssignmentModal(false); setSelectedOrder(null); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {deliveryMen.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="text-sm text-neutral-500">No delivery men found. Please create one in the Delivery tab.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {deliveryMen.filter(dm => dm.status === 'active').map(dm => (
                                        <button
                                            key={dm._id}
                                            onClick={() => assignDeliveryMan(dm._id)}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-neutral-50 hover:border-amber-500 hover:bg-amber-50 group transition-all text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 font-bold border border-neutral-100 group-hover:border-amber-200 shadow-sm">
                                                    {dm.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900 group-hover:text-amber-900 transition-colors">{dm.name}</p>
                                                    <p className="text-xs text-neutral-500">{dm.phone}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-neutral-100 group-hover:border-amber-200 opacity-100 transition-all">
                                                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
