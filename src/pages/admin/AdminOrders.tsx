import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Check, X, Info, Search, FileText, Printer, Clock, ArrowRight, CheckCircle, CheckCheck, LayoutGrid, List as ListIcon, Users, Banknote, CreditCard, Smartphone, Bike, MapPin, Phone } from "lucide-react";
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

const KDSOrderCard = ({ order, onUpdateStatus, onSelect, onCollectPayment }: { order: Order, onUpdateStatus: any, onSelect: any, onCollectPayment: (order: Order) => void }) => {
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
                            onClick={() => onCollectPayment(order)}
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

    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card' | 'MFS'>('Cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [changeAmount, setChangeAmount] = useState(0);

    const [showBillPreview, setShowBillPreview] = useState(false);
    const [lastOrderDetails, setLastOrderDetails] = useState<{
        items: OrderItem[];
        subtotal: number;
        tax: number;
        total: number;
        paymentMethods: { method: string; amount: number }[];
        orderId: string;
        date: string;
        table: string;
        customer: string;
    } | null>(null);

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

    const printBillReceipt = (details: any) => {
        if (!details) return;
        const itemsHtml = details.items.map((item: any) => {
            return `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${item.title} x${item.quantity}</span><span>BDT ${(item.price * item.quantity).toFixed(2)}</span></div>`;
        }).join('');
        
        const paymentMethodsHtml = details.paymentMethods.map((pm: any) =>
            `<div style="display:flex;justify-content:space-between;"><span>${pm.method.toUpperCase()}</span><span>BDT ${pm.amount.toFixed(2)}</span></div>`
        ).join('');
        
        const orderNum = `#${details.orderId.slice(-6).toUpperCase()}`;

        const html = `<!DOCTYPE html><html><head><title>Bill Receipt</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
            .solid { border-bottom: 2px solid #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin: 10px 0; }
            img { display: block; margin: 10px auto; }
            @media print { @page { margin: 0; size: 80mm auto; } }
        </style></head><body>
            <div class="center bold" style="font-size:20px;margin-bottom:15px;">CRAVINGS</div>
            <div class="dashed"></div>
            <div class="row"><span>Order #</span><span>${orderNum}</span></div>
            <div class="row"><span>Date</span><span>${details.date}</span></div>
            <div class="dashed"></div>
            <div class="row bold" style="margin-bottom:8px;"><span>Item</span><span>Amount</span></div>
            <div class="solid"></div>
            ${itemsHtml}
            <div class="solid"></div>
            <div class="row"><span>Subtotal</span><span>BDT ${details.subtotal.toFixed(2)}</span></div>
            <div class="row"><span>Tax</span><span>BDT ${details.tax.toFixed(2)}</span></div>
            ${paymentMethodsHtml}
            <div class="solid"></div>
            <div class="total-row"><span>TOTAL</span><span>BDT ${details.total.toFixed(2)}</span></div>
            <div class="dashed"></div>
            <div class="center" style="margin-top:10px;">
                <p style="margin-bottom:10px;">Thank you for your visit!</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${details.orderId}" alt="QR" width="100" height="100" />
            </div>
        </body></html>`;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => {
                if (!printWindow.closed) {
                    printWindow.focus();
                    printWindow.print();
                }
            }, 500);
        } else {
            toast.error("Please allow pop-ups to print the receipt");
        }
    };

    const handleCollectPayment = (order: Order) => {
        setPaymentOrder(order);
        setAmountReceived(order.total.toFixed(2));
        setChangeAmount(0);
        setSelectedPaymentMethod('Cash');
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!paymentOrder) return;
        
        try {
            setProcessingId(paymentOrder._id);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            const res = await fetch(`${apiUrl}/orders/${paymentOrder._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    status: 'completed',
                    paymentMethod: selectedPaymentMethod,
                    amountReceived: parseFloat(amountReceived) || paymentOrder.total,
                    changeAmount: changeAmount || 0
                }),
            });

            if (res.ok) {
                // Update table status to Free if it's a dine-in order
                if (paymentOrder.orderType === 'dine-in' && paymentOrder.tableNumber) {
                    try {
                        // We need the table ID. Since we only have tableNumber, 
                        // we might need to find the table first or use a different endpoint.
                        // Looking at AdminPOS, it uses tableId. 
                        // Let's try to find the table by number if tableId is missing.
                        const tableRes = await fetch(`${apiUrl}/tables`);
                        if (tableRes.ok) {
                            const tables = await tableRes.json();
                            const table = tables.find((t: any) => t.tableNumber === paymentOrder.tableNumber);
                            if (table) {
                                await fetch(`${apiUrl}/tables/${table._id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        status: 'Free',
                                        currentOrder: undefined,
                                        occupiedTime: undefined
                                    })
                                });
                            }
                        }
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                toast.success(`Payment collected and Order #${paymentOrder._id.slice(-6).toUpperCase()} completed!`);
                setShowPaymentModal(false);
                
                // Set order details for printing
                setLastOrderDetails({
                    items: paymentOrder.items,
                    subtotal: paymentOrder.subtotal,
                    tax: paymentOrder.tax,
                    total: paymentOrder.total,
                    paymentMethods: [{ method: selectedPaymentMethod, amount: paymentOrder.total }],
                    orderId: paymentOrder._id,
                    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
                    table: paymentOrder.tableNumber || "N/A",
                    customer: paymentOrder.customerInfo.name || "Walk-in"
                });
                setShowBillPreview(true);
                
                // If it's a takeaway or online order, open the assignment modal
                if (paymentOrder.orderType !== 'dine-in') {
                    setSelectedOrder(paymentOrder);
                    setShowAssignmentModal(true);
                } else {
                    setPaymentOrder(null);
                }
                
                await fetchOrders();
            } else {
                toast.error("Failed to process payment");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during payment");
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
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onCollectPayment={handleCollectPayment} onSelect={(order: any, isAssignment: boolean) => {
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
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onCollectPayment={handleCollectPayment} onSelect={(order: any, isAssignment: boolean) => {
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
                                            <KDSOrderCard key={order._id} order={order} onUpdateStatus={updateOrderStatus} onCollectPayment={handleCollectPayment} onSelect={(order: any, isAssignment: boolean) => {
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

            {/* KOT (Kitchen Order Ticket) Modal - Triggered by 'Details' */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0 print:block">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-none print:rounded-none print:max-h-none print:overflow-visible">
                        
                        {/* Header - Non-printable controls */}
                        <div className="flex justify-between items-center p-6 border-b-4 border-orange-500 bg-orange-50/50 print:hidden">
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Kitchen Ticket</h3>
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">Cooking Details</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.print()} 
                                    className="w-12 h-12 flex items-center justify-center bg-white text-neutral-900 rounded-2xl shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all active:scale-95 border border-neutral-100"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setSelectedOrder(null)} 
                                    className="w-12 h-12 flex items-center justify-center bg-white text-rose-500 rounded-2xl shadow-sm hover:shadow-md hover:bg-rose-50 transition-all active:scale-95 border border-neutral-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Area - KOT Style */}
                        <div id="printable-kot" className="p-10 overflow-y-auto custom-scrollbar text-center bg-white print:p-0 print:m-0">
                            <div className="mb-8 print:mb-4">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Order Reference</div>
                                <h2 className="text-4xl font-black text-neutral-900 leading-none">#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                            </div>
                            
                            <div className="flex justify-between items-center py-5 border-y border-dashed border-neutral-200 mb-8 px-2 print:mb-4">
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Table / Area</div>
                                    <div className="text-xl font-black text-neutral-900">{selectedOrder.tableNumber || selectedOrder.customerInfo?.address || "N/A"}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order Time</div>
                                    <div className="text-sm font-bold text-neutral-900">{new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>

                            <div className="space-y-5 mb-8 text-left print:mb-4">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Items to Prepare:</p>
                                {selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 group">
                                        <div className="bg-neutral-900 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-neutral-200">
                                            {item.quantity}
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <span className="font-black text-2xl text-neutral-900 uppercase tracking-tight leading-tight block">{item.title}</span>
                                            {item.notes && <span className="text-xs font-bold text-rose-500 italic block mt-1">Note: {item.notes}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedOrder.customerInfo?.notes && (
                                <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left print:mb-4">
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Kitchen Notes:</p>
                                    <p className="text-sm font-bold text-neutral-800 italic">"{selectedOrder.customerInfo.notes}"</p>
                                </div>
                            )}

                            <div className="py-6 bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed print:border-solid">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Customer</p>
                                <p className="text-xs font-bold text-neutral-700 uppercase">{selectedOrder.customerInfo?.name || "Walk-in Guest"}</p>
                            </div>
                            
                            <div className="mt-8 text-[10px] font-black text-neutral-300 uppercase tracking-[0.4em] print:hidden">
                                *** End of Kitchen Ticket ***
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Collection Modal */}
            {showPaymentModal && paymentOrder && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-emerald-600 p-6 text-white relative">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold mb-1">Collect Payment</h3>
                            <p className="text-emerald-100 text-xs">Order #{paymentOrder._id.slice(-6).toUpperCase()}</p>
                            
                            <div className="mt-6">
                                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Payable Amount</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-emerald-200 text-lg font-medium uppercase">BDT</span>
                                    <span className="text-4xl font-black">{paymentOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Payment Method Selection */}
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Choose Payment Method</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'Cash', icon: Banknote, color: 'emerald' },
                                        { id: 'Card', icon: CreditCard, color: 'blue' },
                                        { id: 'MFS', icon: Smartphone, color: 'purple' }
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedPaymentMethod(method.id as any)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                                                selectedPaymentMethod === method.id 
                                                ? `bg-${method.color}-50 border-${method.color}-500 text-${method.color}-600` 
                                                : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                            }`}
                                        >
                                            <method.icon className="w-6 h-6" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{method.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Received Input (only for Cash) */}
                            {selectedPaymentMethod === 'Cash' && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Amount Received</p>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm group-focus-within:text-emerald-500 transition-colors">BDT</div>
                                        <input
                                            type="number"
                                            value={amountReceived}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setAmountReceived(val);
                                                const received = parseFloat(val) || 0;
                                                setChangeAmount(Math.max(0, received - paymentOrder.total));
                                            }}
                                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-2xl pl-14 pr-4 py-4 text-xl font-black focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        {[500, 1000, 2000].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setAmountReceived(val.toString());
                                                    setChangeAmount(Math.max(0, val - paymentOrder.total));
                                                }}
                                                className="py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-600 transition-colors"
                                            >
                                                BDT {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Change to Return */}
                            {selectedPaymentMethod === 'Cash' && parseFloat(amountReceived) > paymentOrder.total && (
                                <div className="flex justify-between items-center p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in slide-in-from-top-2">
                                    <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Change to Return</span>
                                    <span className="text-xl font-black text-amber-800">BDT {changeAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processPayment}
                                    disabled={processingId === paymentOrder._id || (selectedPaymentMethod === 'Cash' && (parseFloat(amountReceived) < paymentOrder.total))}
                                    className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingId === paymentOrder._id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            {selectedPaymentMethod === 'Cash' ? `Exact Amount (BDT${paymentOrder.total.toFixed(2)})` : 'Confirm Payment'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bill Preview Modal */}
            {showBillPreview && lastOrderDetails && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-yellow-400 border-b-4">
                            <h3 className="text-xl font-medium text-neutral-800">Order Slip</h3>
                            <div className="flex gap-2">
                                <button onClick={() => printBillReceipt(lastOrderDetails)} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowBillPreview(false)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-[#0f172a] mb-2">Cravings...</h2>
                                <p className="text-sm font-medium text-neutral-500 tracking-[0.2em] uppercase">Order Receipt</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Order ID</span>
                                    <span className="font-bold text-neutral-900">#{lastOrderDetails.orderId.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Date</span>
                                    <span className="font-medium text-neutral-900">{lastOrderDetails.date}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Payment Status</span>
                                    <span className="font-medium text-neutral-900">Paid</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-neutral-300 py-6">
                                {lastOrderDetails.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start mb-4 last:mb-0">
                                        <span className="font-bold text-neutral-900 text-[15px]">{item.quantity}x {item.title}</span>
                                        <span className="font-medium text-neutral-900">৳{(item.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-neutral-300 py-6 space-y-4">
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="font-medium text-neutral-900">৳{lastOrderDetails.subtotal.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Tax</span>
                                    <span className="font-medium text-neutral-900">৳{lastOrderDetails.tax.toFixed(0)}</span>
                                </div>
                                <div className="space-y-1">
                                    {lastOrderDetails.paymentMethods.map((pm, idx) => (
                                        <div key={idx} className="flex justify-between text-[15px] italic text-neutral-600">
                                            <span>{pm.method}</span>
                                            <span>৳{pm.amount.toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xl font-black mt-2">
                                    <span className="text-neutral-900">Total</span>
                                    <span className="text-yellow-500">৳{lastOrderDetails.total.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-2xl p-6 mt-2">
                                <h4 className="font-bold text-neutral-900 mb-2">Details:</h4>
                                <div className="text-neutral-600 text-[15px] space-y-1">
                                    <p>Customer: {lastOrderDetails.customer}</p>
                                    <p>Table/Area: {lastOrderDetails.table}</p>
                                </div>
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
