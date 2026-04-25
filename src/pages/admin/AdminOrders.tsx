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

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'kds' | 'list'>('kds');
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
        // Wait briefly for modal to render before triggering print dialog
        setTimeout(() => {
            window.print();
        }, 150);
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
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-lg shrink-0">
                        <button 
                            onClick={() => setViewMode('kds')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'kds' ? 'bg-neutral-800 text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> KDS Board
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${viewMode === 'list' ? 'bg-neutral-800 text-amber-500' : 'text-neutral-400 hover:text-neutral-200'}`}
                        >
                            <ListIcon className="w-4 h-4" /> List View
                        </button>
                    </div>

                    {viewMode === 'list' && (
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-neutral-600"
                            />
                        </div>
                    )}
                </div>

                {isLoading && orders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 flex-1">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : viewMode === 'kds' ? (
                    /* Kanban Board View */
                    <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
                        <div className="flex gap-6 h-full min-w-max pb-4 items-start">
                            {/* Column 1: New Orders */}
                            <section className="w-[380px] flex flex-col max-h-[calc(100vh-12rem)] bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-lg overflow-hidden shrink-0">
                                <header className="p-5 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-neutral-100">New Orders</h3>
                                    <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">{pendingOrders.length}</span>
                                </header>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {pendingOrders.map((order) => (
                                        <article key={order._id} className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-lg p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-amber-500 leading-none cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                                                        {order.customerInfo.name || "Walk-in"}
                                                    </h4>
                                                    <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1.5 block">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm text-neutral-300 flex items-center gap-1.5 font-medium">
                                                        <Clock className="w-4 h-4 text-neutral-500" />
                                                        {getElapsedTime(order.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <hr className="border-neutral-800 my-3"/>
                                            <ul className="space-y-3 text-sm text-neutral-200">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="font-semibold text-amber-500 mt-0.5">{item.quantity}x</span>
                                                        <div>
                                                            <p className="font-medium">{item.title}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'preparing'); }}
                                                    disabled={processingId === order._id}
                                                    className="bg-amber-500 text-amber-950 text-sm font-semibold px-4 py-2 rounded flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>Start Cooking <ArrowRight className="w-4 h-4" /></>
                                                    )}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                    {pendingOrders.length === 0 && (
                                        <div className="text-center p-8 text-neutral-500 text-sm">No new orders</div>
                                    )}
                                </div>
                            </section>

                            {/* Column 2: Cooking */}
                            <section className="w-[380px] flex flex-col max-h-[calc(100vh-12rem)] bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-lg overflow-hidden shrink-0">
                                <header className="p-5 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-neutral-100">Cooking</h3>
                                    <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">{preparingOrders.length}</span>
                                </header>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {preparingOrders.map((order) => {
                                        const isUrgent = (new Date().getTime() - new Date(order.createdAt).getTime()) > 15 * 60000; // 15 mins
                                        return (
                                            <article key={order._id} className={`bg-neutral-900/80 backdrop-blur-md border rounded-lg p-5 shadow-lg relative overflow-hidden group ${isUrgent ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-neutral-700/50 hover:border-blue-500/50 transition-colors'}`}>
                                                <div className={`absolute top-0 left-0 w-1 h-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-neutral-100 leading-none cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                                                            {order.customerInfo.name || "Walk-in"}
                                                        </h4>
                                                        <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1.5 block">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-sm flex items-center gap-1.5 font-bold ${isUrgent ? 'text-rose-500' : 'text-neutral-300'}`}>
                                                            <Clock className="w-4 h-4" />
                                                            {getElapsedTime(order.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <hr className="border-neutral-800 my-3"/>
                                                <ul className="space-y-3 text-sm text-neutral-200">
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <span className="font-semibold text-blue-400 mt-0.5">{item.quantity}x</span>
                                                            <div>
                                                                <p className="font-medium">{item.title}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'pending'); }}
                                                        disabled={processingId === order._id}
                                                        className="border border-neutral-700 text-neutral-300 text-sm font-medium px-4 py-2 rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
                                                    >
                                                        Revert
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'ready'); }}
                                                        disabled={processingId === order._id}
                                                        className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {processingId === order._id ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>Mark Ready <CheckCircle className="w-4 h-4" /></>
                                                        )}
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                    {preparingOrders.length === 0 && (
                                        <div className="text-center p-8 text-neutral-500 text-sm">No orders currently cooking</div>
                                    )}
                                </div>
                            </section>

                            {/* Column 3: Ready for Serve */}
                            <section className="w-[380px] flex flex-col max-h-[calc(100vh-12rem)] bg-neutral-950/80 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-lg overflow-hidden shrink-0">
                                <header className="p-5 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-neutral-100">Ready for Serve</h3>
                                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">{readyOrders.length}</span>
                                </header>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {readyOrders.map((order) => (
                                        <article key={order._id} className="bg-neutral-900/60 backdrop-blur-md border border-emerald-500/30 rounded-lg p-5 shadow-lg relative overflow-hidden opacity-95">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-neutral-100 leading-none cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                                                        {order.customerInfo.name || "Walk-in"}
                                                    </h4>
                                                    <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1.5 block">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm text-emerald-400 flex items-center gap-1.5 font-bold">
                                                        <CheckCheck className="w-4 h-4" />
                                                        Ready
                                                    </span>
                                                </div>
                                            </div>
                                            <hr className="border-neutral-800 my-3"/>
                                            <ul className="space-y-3 text-sm text-neutral-400">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="font-semibold text-neutral-500 mt-0.5">{item.quantity}x</span>
                                                        <div>
                                                            <p className="font-medium line-through">{item.title}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-5 pt-4 border-t border-neutral-800 flex gap-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handlePrintOrder(order); }}
                                                    className="px-3 py-2 border border-neutral-700 text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded flex items-center justify-center transition-colors shadow-sm"
                                                    title="Print Receipt"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        updateOrderStatus(order._id, 'completed', `Order for ${order.customerInfo.name || 'Walk-in'} served! 🎉`); 
                                                    }}
                                                    disabled={processingId === order._id}
                                                    className="bg-emerald-500 text-emerald-950 text-sm font-semibold px-4 py-2 rounded flex flex-1 items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingId === order._id ? (
                                                        <div className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>Serve & Complete <CheckCheck className="w-4 h-4 ml-1" /></>
                                                    )}
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                    {readyOrders.length === 0 && (
                                        <div className="text-center p-8 text-neutral-500 text-sm">No orders ready</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    /* Card Grid List View */
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
                            {filteredListOrders.map((order) => (
                                <div key={order._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm hover:border-amber-500/50 transition-colors flex flex-col group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-neutral-700 group-hover:bg-amber-500 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="w-4 h-4 text-amber-500" />
                                                <h4 className="font-bold text-neutral-100">#{order._id.slice(-6).toUpperCase()}</h4>
                                            </div>
                                            <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-lg text-amber-500">৳{Math.round(order.total)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-neutral-950 rounded-lg p-3 mb-4 border border-neutral-800/50 flex-1">
                                        <p className="font-medium text-neutral-200 line-clamp-1">{order.customerInfo.name || "Walk-in Customer"}</p>
                                        <p className="text-xs text-neutral-500 mt-0.5">{order.customerInfo.phone || "N/A"}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border uppercase tracking-wider ${
                                            order.smsStatus === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.smsStatus === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {order.smsStatus === 'sent' && <Check className="w-3 h-3" />}
                                            {order.smsStatus === 'failed' && <X className="w-3 h-3" />}
                                            {order.smsStatus === 'pending' && <Info className="w-3 h-3" />}
                                            SMS {order.smsStatus}
                                        </span>

                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            className={`bg-neutral-950 border text-xs rounded-md px-2 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                                                order.status === 'completed' ? 'border-emerald-500/30 text-emerald-400' :
                                                order.status === 'pending' ? 'border-amber-500/30 text-amber-400' :
                                                order.status === 'preparing' ? 'border-blue-500/30 text-blue-400' :
                                                order.status === 'ready' ? 'border-emerald-500/50 text-emerald-500' :
                                                order.status === 'cancelled' ? 'border-rose-500/30 text-rose-400' :
                                                'border-neutral-700 text-neutral-300'
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
                                        className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-amber-950"
                                    >
                                        View Details
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {filteredListOrders.length === 0 && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
                                    <Search className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No orders found matching "{searchTerm}"</p>
                                </div>
                            )}
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
