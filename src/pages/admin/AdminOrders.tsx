import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Check, X, Info, Search, FileText, Printer, Clock, ArrowRight, CheckCircle, CheckCheck, LayoutGrid, List as ListIcon, Users, Bike, MapPin, Phone, Receipt } from "lucide-react";
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
    discount?: number;
    total: number;
    paymentMethod?: string;
    amountReceived?: number;
    changeAmount?: number;
    status: string;
    smsStatus: string;
    createdAt: string;
    orderType: 'dine-in' | 'takeaway' | 'online';
    tableNumber?: string;
    deliveryManId?: string;
    deliveryStatus?: 'pending' | 'assigned' | 'out_for_delivery' | 'delivered';
}

const KDSOrderCard = ({ order, onUpdateStatus, onSelect, onCompleteOrder }: { order: Order, onUpdateStatus: any, onSelect: any, onCompleteOrder: (order: Order) => void }) => {
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
        <div className={`bg-white border border-neutral-200 rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 lg:hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'border-rose-200 ring-2 lg:ring-4 ring-rose-500/5' : ''}`}>
            {/* Urgent Indicator */}
            {isUrgent(order.createdAt) && order.status !== 'ready' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
            )}

            <div className="flex justify-between items-start mb-3 lg:mb-4">
                <div className="flex items-center gap-2 lg:gap-3">
                    <div className="bg-neutral-50 p-1.5 lg:p-2 rounded-lg lg:rounded-xl border border-neutral-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors shrink-0">
                        <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-neutral-600 group-hover:text-amber-600" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1 lg:mb-1.5">
                            <h4 className="font-serif font-bold text-base lg:text-lg text-neutral-900 leading-none">#{order._id.slice(-6).toUpperCase()}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] lg:text-[8px] font-black uppercase tracking-tighter border ${order.orderType === 'online' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                order.orderType === 'takeaway' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {order.orderType}
                            </span>
                            {order.orderType === 'dine-in' && order.tableNumber && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[7px] lg:text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                                    <Users className="w-2 h-2" /> T-{order.tableNumber}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 lg:mt-1.5">
                            <Clock className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-rose-500' : 'text-neutral-400'}`} />
                            <span className={`text-[8px] lg:text-[10px] uppercase font-bold tracking-wider ${isUrgent(order.createdAt) && order.status !== 'ready' ? 'text-rose-600' : 'text-neutral-500'}`}>
                                {getElapsedTime(order.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={() => onSelect(order, false)} className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 underline underline-offset-4 decoration-amber-200 hover:decoration-amber-500 transition-all">
                    Details
                </button>
            </div>

            <div className="mb-3 lg:mb-4">
                <p className="text-[9px] lg:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 lg:mb-2 px-1">Items</p>
                <div className="bg-neutral-50/50 rounded-lg lg:rounded-xl p-2.5 lg:p-3 border border-neutral-100 space-y-1.5 lg:space-y-2.5">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs lg:text-sm">
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-700 text-[9px] lg:text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded flex items-center justify-center shrink-0">{item.quantity}</span>
                                <span className="text-neutral-800 font-medium line-clamp-1">{item.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 lg:pt-4 mt-auto">
                <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4 px-1">
                    <div className="w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-[10px] lg:text-xs font-semibold text-neutral-600 truncate">{order.customerInfo?.name || "Walk-in Guest"}</p>
                </div>

                <div className="flex gap-2">
                    {order.status === 'pending' && (
                        <button
                            onClick={() => onUpdateStatus(order._id, 'preparing')}
                            className="flex-1 py-2 lg:py-3 bg-neutral-900 hover:bg-black text-white text-[9px] lg:text-[11px] font-bold uppercase tracking-widest rounded-lg lg:rounded-xl transition-all flex items-center justify-center gap-1.5 lg:gap-2 active:scale-95 shadow-sm lg:shadow-lg"
                        >
                            <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="truncate">Start cooking</span>
                        </button>
                    )}
                    {order.status === 'preparing' && (
                        <button
                            onClick={() => onUpdateStatus(order._id, 'ready')}
                            className="flex-1 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white text-[9px] lg:text-[11px] font-bold uppercase tracking-widest rounded-lg lg:rounded-xl transition-all flex items-center justify-center gap-1.5 lg:gap-2 active:scale-95 shadow-sm lg:shadow-lg"
                        >
                            <CheckCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="truncate">Mark Ready</span>
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button
                            onClick={() => onCompleteOrder(order)}
                            className="flex-1 py-2 lg:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] lg:text-[11px] font-bold uppercase tracking-widest rounded-lg lg:rounded-xl transition-all flex items-center justify-center gap-1.5 lg:gap-2 active:scale-95 shadow-sm lg:shadow-lg"
                        >
                            <CheckCheck className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            <span className="truncate">{order.orderType === 'online' ? 'Deliver' : 'Serve'}</span>
                        </button>
                    )}
                    {order.status === 'served' && (
                        <button
                            onClick={() => onSelect(order, true)}
                            className="flex-1 py-2 lg:py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] lg:text-[11px] font-bold uppercase tracking-widest rounded-lg lg:rounded-xl transition-all flex items-center justify-center gap-1.5 lg:gap-2 active:scale-95 shadow-sm lg:shadow-lg"
                        >
                            <Receipt className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="truncate">Bill</span>
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
    const [viewType, setViewType] = useState<'kot' | 'bill'>('kot');

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
        const loadInitialData = async () => {
            await Promise.all([fetchOrders(), fetchDeliveryMen()]);
            
            // Check for orderId in query params
            const params = new URLSearchParams(window.location.search);
            const orderId = params.get('orderId');
            if (orderId) {
                // We need to wait for orders to be fetched
                const checkAndOpen = () => {
                    setOrders(prevOrders => {
                        const order = prevOrders.find(o => o._id === orderId);
                        if (order) {
                            setSelectedOrder(order);
                            setViewType('bill');
                        }
                        return prevOrders;
                    });
                };
                // Small delay to ensure orders state is updated
                setTimeout(checkAndOpen, 500);
            }
        };

        loadInitialData();
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
                } else if (newStatus === 'served') {
                    toast.success(`Order #${orderId.slice(-6).toUpperCase()} has been served! 😊`);
                } else if (newStatus === 'preparing') {
                    toast.info(`Cooking started for Order #${orderId.slice(-6).toUpperCase()} 👨‍🍳`);
                } else if (newStatus === 'assigned') {
                    toast.success(`Order #${orderId.slice(-6).toUpperCase()} has been assigned to courier 🚚`);
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
            
            // For delivery orders, we also want to collect payment if it's not paid yet
            // But usually delivery is paid on delivery or online. 
            // The user specifically asked for "Serve & Complete" which is dine-in.
            // Let's stick to dine-in for now or ask for payment for all.
            
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

    const handleCompleteOrder = async (order: Order) => {
        if (order.orderType === "online") {
            setSelectedOrder(order);
            setShowAssignmentModal(true);
            return;
        }

        // Both dine-in and takeaway should go to 'served' status 
        // so they can be billed/completed at the POS
        await updateOrderStatus(order._id, "served");
    };

    const processDineInPayment = async (order: Order) => {
        try {
            setProcessingId(order._id);
            await updateOrderStatus(order._id, "completed", `Payment collected for Order #${order._id.slice(-6).toUpperCase()}. Status updated to Completed.`);
            
            if (order.tableNumber) {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const tableRes = await fetch(`${apiUrl}/tables`);
                if (tableRes.ok) {
                    const tables = await tableRes.json();
                    const table = tables.find((t: any) => t.tableNumber === order.tableNumber);
                    if (table) {
                        await fetch(`${apiUrl}/tables/${table._id}/status`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                status: "Cleaning",
                                currentOrder: undefined,
                                occupiedTime: undefined
                            })
                        });
                        toast.info(`Table ${order.tableNumber} is now marked for Cleaning.`);
                    }
                }
            }
            
            setSelectedOrder(null);
        } catch (error) {
            console.error("Payment processing error:", error);
            toast.error("Failed to complete payment process");
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
                                                                    order.status === 'served' ? 'border-amber-200 text-amber-600 bg-amber-50/10' :
                                                                        order.status === 'assigned' ? 'border-indigo-200 text-indigo-600 bg-indigo-50/10' :
                                                                            order.status === 'cancelled' ? 'border-rose-200 text-rose-600 bg-rose-50/10' :
                                                                                'border-neutral-200 text-neutral-600 bg-neutral-50/10'
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="ready">Ready</option>
                                                    {order.orderType === 'dine-in' && <option value="served">Served</option>}
                                                    {order.orderType !== 'dine-in' && <option value="assigned">Assigned</option>}
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setViewType(order.status === 'completed' ? 'bill' : 'kot');
                                                }}
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
                            <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 overflow-y-auto md:overflow-y-hidden pb-6 md:pb-0 custom-scrollbar min-h-0">
                                {/* Column 1: New Orders (Pending) */}
                                <div className="w-full md:flex-1 shrink-0 md:shrink flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl md:min-w-0">
                                    <div className="p-4 md:p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50 shrink-0">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                            <h3 className="font-serif font-bold text-lg md:text-xl text-neutral-900 tracking-tight">New Orders</h3>
                                        </div>
                                        <span className="bg-amber-100 text-amber-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold border border-amber-200">
                                            {pendingOrders.length} {pendingOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-4 md:p-5 flex flex-row md:flex-col gap-4 md:gap-0 md:space-y-5 custom-scrollbar snap-x snap-mandatory md:snap-none md:flex-1">
                                        {pendingOrders.map(order => (
                                            <div key={order._id} className="w-[80vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center">
                                                <KDSOrderCard order={order} onUpdateStatus={updateOrderStatus} onCompleteOrder={handleCompleteOrder} onSelect={(order: any, isAssignment: boolean) => {
                                                    setSelectedOrder(order);
                                                    setViewType(order.status === 'completed' ? 'bill' : 'kot');
                                                    setShowAssignmentModal(isAssignment || false);
                                                }} />
                                            </div>
                                        ))}
                                        {pendingOrders.length === 0 && (
                                            <div className="h-48 md:h-60 w-full flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <Clock className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                                <p className="text-[10px] md:text-xs font-medium italic">No new orders waiting</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Cooking (Preparing) */}
                                <div className="w-full md:flex-1 shrink-0 md:shrink flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl md:min-w-0">
                                    <div className="p-4 md:p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50 shrink-0">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            <h3 className="font-serif font-bold text-lg md:text-xl text-neutral-900 tracking-tight">Cooking</h3>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold border border-blue-200">
                                            {preparingOrders.length} {preparingOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-4 md:p-5 flex flex-row md:flex-col gap-4 md:gap-0 md:space-y-5 custom-scrollbar snap-x snap-mandatory md:snap-none md:flex-1">
                                        {preparingOrders.map(order => (
                                            <div key={order._id} className="w-[80vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center">
                                                <KDSOrderCard order={order} onUpdateStatus={updateOrderStatus} onCompleteOrder={handleCompleteOrder} onSelect={(order: any, isAssignment: boolean) => {
                                                    setSelectedOrder(order);
                                                    setViewType(order.status === 'completed' ? 'bill' : 'kot');
                                                    setShowAssignmentModal(isAssignment || false);
                                                }} />
                                            </div>
                                        ))}
                                        {preparingOrders.length === 0 && (
                                            <div className="h-48 md:h-60 w-full flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <Clock className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                                <p className="text-[10px] md:text-xs font-medium italic">No orders currently cooking</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3: Ready for Serve */}
                                <div className="w-full md:flex-1 shrink-0 md:shrink flex flex-col bg-white/40 rounded-3xl border border-neutral-200 overflow-hidden backdrop-blur-xl md:min-w-0">
                                    <div className="p-4 md:p-6 border-b border-neutral-100 flex justify-between items-center bg-white/50 shrink-0">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <h3 className="font-serif font-bold text-lg md:text-xl text-neutral-900 tracking-tight">Ready for Serve</h3>
                                        </div>
                                        <span className="bg-emerald-100 text-emerald-700 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold border border-emerald-200">
                                            {readyOrders.length} {readyOrders.length === 1 ? 'Order' : 'Orders'}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto md:overflow-x-hidden md:overflow-y-auto p-4 md:p-5 flex flex-row md:flex-col gap-4 md:gap-0 md:space-y-5 custom-scrollbar snap-x snap-mandatory md:snap-none md:flex-1">
                                        {readyOrders.map(order => (
                                            <div key={order._id} className="w-[80vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center">
                                                <KDSOrderCard order={order} onUpdateStatus={updateOrderStatus} onCompleteOrder={handleCompleteOrder} onSelect={(order: any, isAssignment: boolean) => {
                                                    setSelectedOrder(order);
                                                    setViewType(order.status === 'completed' ? 'bill' : 'kot');
                                                    setShowAssignmentModal(isAssignment || false);
                                                }} />
                                            </div>
                                        ))}
                                        {readyOrders.length === 0 && (
                                            <div className="h-48 md:h-60 w-full flex flex-col items-center justify-center text-neutral-400 gap-3 opacity-60">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                                                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                                <p className="text-[10px] md:text-xs font-medium italic">No orders ready for serve</p>
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
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        
                        {/* Header with Gradient */}
                        <div className="relative p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white overflow-hidden">
                            {/* Decorative background pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
                            
                            <div className="relative flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest mb-2">
                                        <Bike className="w-3 h-3" /> Logistics Portal
                                    </div>
                                    <h3 className="font-serif font-black text-3xl tracking-tight leading-none">Assign Courier</h3>
                                    <p className="text-indigo-100 text-sm font-medium opacity-90 mt-2">Selecting partner for Order <span className="text-white font-bold">#{selectedOrder._id.slice(-6).toUpperCase()}</span></p>
                                </div>
                                <button 
                                    onClick={() => { setShowAssignmentModal(false); setSelectedOrder(null); }} 
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all hover:scale-110 active:scale-95 border border-white/10 group"
                                >
                                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Order Quick Stats */}
                            <div className="relative mt-8 flex gap-4">
                                <div className="px-4 py-2 bg-black/20 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Order Type</p>
                                    <p className="text-xs font-black uppercase">{selectedOrder.orderType}</p>
                                </div>
                                <div className="px-4 py-2 bg-black/20 rounded-xl backdrop-blur-md border border-white/5">
                                    <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Address</p>
                                    <p className="text-xs font-black truncate max-w-[150px]">{selectedOrder.customerInfo?.address || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-neutral-50/50">
                            {deliveryMen.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-300">
                                        <Users className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-bold text-neutral-900 mb-2">No Couriers Available</h4>
                                    <p className="text-sm text-neutral-500 max-w-[280px] mx-auto">Please ensure you have active delivery personnel registered in your system.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1 px-1">Available Delivery Personnel</p>
                                    {deliveryMen.filter(dm => dm.status === 'active').map(dm => (
                                        <button
                                            key={dm._id}
                                            onClick={() => assignDeliveryMan(dm._id)}
                                            className="group relative flex items-center justify-between p-5 rounded-[2rem] border-2 border-transparent bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.15)] hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 text-left"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 font-black text-2xl border border-indigo-100 group-hover:from-indigo-600 group-hover:to-indigo-700 group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-inner">
                                                        {dm.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-neutral-900 text-lg group-hover:text-indigo-900 transition-colors leading-tight mb-1">{dm.name}</p>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-indigo-600 transition-colors">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="text-[11px] font-bold tracking-wider">{dm.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-neutral-400">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="text-[10px] font-medium italic">Active & Ready</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)] transition-all duration-300">
                                                    <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Help */}
                        <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                Selecting a courier will notify them immediately via SMS
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Unified Order Details Modal (KOT & Bill) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0 print:block">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:rounded-none print:max-h-none print:overflow-visible">
                        
                        {/* Header - Non-printable controls */}
                        <div className="flex flex-col border-b border-neutral-100 print:hidden">
                            <div className="flex justify-between items-center p-6 bg-neutral-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Order Details</h3>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => window.print()} 
                                        className="w-10 h-10 flex items-center justify-center bg-white text-neutral-900 rounded-xl shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all active:scale-95 border border-neutral-100"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedOrder(null)} 
                                        className="w-10 h-10 flex items-center justify-center bg-white text-rose-500 rounded-xl shadow-sm hover:shadow-md hover:bg-rose-50 transition-all active:scale-95 border border-neutral-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* View Switcher Tabs */}
                            <div className="flex p-1 bg-neutral-100 mx-6 mb-4 rounded-xl">
                                <button 
                                    onClick={() => setViewType('kot')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewType === 'kot' ? 'bg-white text-orange-600 shadow-sm' : 'text-neutral-500'}`}
                                >
                                    Kitchen Ticket
                                </button>
                                <button 
                                    onClick={() => setViewType('bill')}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewType === 'bill' ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500'}`}
                                >
                                    Customer Bill
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                            {viewType === 'kot' ? (
                                /* KOT View */
                                <div id="printable-kot" className="p-8 text-center print:p-0">
                                    <div className="mb-8 print:mb-4">
                                        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Kitchen Order Ticket</div>
                                        <h2 className="text-4xl font-black text-neutral-900 leading-none">#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                                    </div>
                                    
                                    <div className="flex justify-between items-center py-4 border-y border-dashed border-neutral-200 mb-6 px-2">
                                        <div className="text-left">
                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Table / Area</div>
                                            <div className="text-lg font-black text-neutral-900">{selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : selectedOrder.orderType.toUpperCase()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order Time</div>
                                            <div className="text-sm font-bold text-neutral-900">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 text-left">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className="bg-neutral-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0">
                                                    {item.quantity}
                                                </div>
                                                <div className="flex-1 pt-0.5">
                                                    <span className="font-black text-xl text-neutral-900 uppercase tracking-tight leading-tight block">{item.title}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedOrder.customerInfo?.notes && (
                                        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Kitchen Notes:</p>
                                            <p className="text-xs font-bold text-neutral-800 italic">"{selectedOrder.customerInfo.notes}"</p>
                                        </div>
                                    )}

                                    <div className="py-4 border-t border-dashed border-neutral-200">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em]">*** KITCHEN COPY ***</p>
                                    </div>
                                </div>
                            ) : (
                                /* Bill View */
                                <div id="printable-bill" className="p-8 print:p-0">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-serif font-black text-neutral-900 mb-1">CRAVING</h2>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Restaurant & Cafe</p>
                                        <div className="w-12 h-0.5 bg-neutral-900 mx-auto mt-4" />
                                    </div>

                                    <div className="flex justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-6 pb-4 border-b border-neutral-100">
                                        <span>Order #{selectedOrder._id.slice(-6).toUpperCase()}</span>
                                        <span>{new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
                                            <span>Item Description</span>
                                            <span>Amount</span>
                                        </div>
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-neutral-900 leading-tight">{item.title}</div>
                                                    <div className="text-[11px] text-neutral-500">{item.quantity} x ৳{item.price.toFixed(2)}</div>
                                                </div>
                                                <div className="text-sm font-bold text-neutral-900">৳{(item.quantity * item.price).toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 border-t border-dashed border-neutral-200 pt-6 mb-8">
                                        <div className="flex justify-between text-sm text-neutral-600 font-medium">
                                            <span>Subtotal</span>
                                            <span>৳{selectedOrder.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-neutral-600 font-medium">
                                            <span>VAT / Tax</span>
                                            <span>৳{selectedOrder.tax.toFixed(2)}</span>
                                        </div>
                                        {selectedOrder.discount && selectedOrder.discount > 0 ? (
                                            <div className="flex justify-between text-sm text-rose-600 font-bold italic">
                                                <span>Discount</span>
                                                <span>-৳{selectedOrder.discount.toFixed(2)}</span>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between text-xl font-serif font-black text-neutral-900 pt-4 mt-2 border-t border-neutral-900">
                                            <span>Grand Total</span>
                                            <span>৳{selectedOrder.total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-2 mb-6">
                                        <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            <span>Payment Details</span>
                                            <span>{selectedOrder.paymentMethod || 'CASH'}</span>
                                        </div>
                                        {selectedOrder.amountReceived ? (
                                            <>
                                                <div className="flex justify-between text-xs font-bold text-neutral-700">
                                                    <span>Paid Amount</span>
                                                    <span>৳{selectedOrder.amountReceived.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold text-emerald-600">
                                                    <span>Change Returned</span>
                                                    <span>৳{selectedOrder.changeAmount?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Thank You For Dining With Us!</p>
                                        <p className="text-[9px] text-neutral-300">cravingpos.com</p>
                                    </div>

                                    {selectedOrder.status === 'served' && (
                                        <div className="mt-8 pt-6 border-t border-dashed border-neutral-200 print:hidden">
                                            <button 
                                                onClick={() => processDineInPayment(selectedOrder)}
                                                disabled={processingId === selectedOrder._id}
                                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-xl shadow-emerald-200"
                                            >
                                                {processingId === selectedOrder._id ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-5 h-5" />
                                                )}
                                                Collect Payment & Complete
                                            </button>
                                            <p className="text-[9px] text-center text-neutral-400 mt-4 font-bold uppercase tracking-widest leading-relaxed">
                                                This will mark the order as completed and set the table to cleaning status
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
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
