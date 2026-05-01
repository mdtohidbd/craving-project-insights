import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Truck, Package, MapPin, User, Phone, CheckCircle, Clock,
    ArrowRight, Loader2, RefreshCw, ChevronDown, AlertCircle
} from 'lucide-react';

interface OrderItem { title: string; quantity: number; price: number; }
interface DeliveryOrder {
    _id: string;
    customerInfo: { name: string; phone: string; address: string; };
    items: OrderItem[];
    total: number;
    deliveryStatus: 'pending' | 'assigned' | 'out_for_delivery' | 'delivered';
    deliveryManId?: string;
    orderType: string;
    createdAt: string;
}
interface DeliveryMan { _id: string; name: string; phone: string; status: string; }

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending:          { label: 'Pending',          color: 'bg-neutral-100 text-neutral-600 border-neutral-200',   dot: 'bg-neutral-400' },
    assigned:         { label: 'Assigned',          color: 'bg-blue-100 text-blue-700 border-blue-200',            dot: 'bg-blue-500' },
    out_for_delivery: { label: 'Out for Delivery',  color: 'bg-amber-100 text-amber-700 border-amber-200',         dot: 'bg-amber-500' },
    delivered:        { label: 'Delivered',         color: 'bg-emerald-100 text-primary border-primary/30',   dot: 'bg-primary' },
};

const NEXT_STATUS: Record<string, string> = {
    assigned: 'out_for_delivery',
    out_for_delivery: 'delivered',
};

const AdminDelivery = () => {
    const { user, token, isSuperAdmin } = useAuth();
    const isDeliveryMan = user?.staffRole === 'delivery';

    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [couriers, setCouriers] = useState<DeliveryMan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dmRecord, setDmRecord] = useState<DeliveryMan | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [openAssignId, setOpenAssignId] = useState<string | null>(null);
    const [viewTab, setViewTab] = useState<'active' | 'completed'>('active');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            let dmId = null;
            if (isDeliveryMan) {
                // First get the deliveryman record linked to this user
                const meRes = await fetch(`${apiUrl}/delivery-men/me?userId=${user?._id}`);
                if (meRes.ok) {
                    const me = await meRes.json();
                    setDmRecord(me);
                    dmId = me._id;
                }
            }

            // Deliverymen only see their own assigned orders (row-level security via query param)
            const orderFilter = isDeliveryMan && dmId
                ? `?deliveryManId=${dmId}&orderType=online`
                : `?orderType=online`;

            const [orderRes, dmRes] = await Promise.all([
                fetch(`${apiUrl}/orders${orderFilter}`),
                fetch(`${apiUrl}/delivery-men`),
            ]);
            if (orderRes.ok) {
                const all: DeliveryOrder[] = await orderRes.json();
                setOrders(all);
            }
            if (dmRes.ok) setCouriers((await dmRes.json()).filter((d: DeliveryMan) => d.status === 'active'));
        } catch { toast.error('Failed to load delivery data'); }
        finally { setIsLoading(false); }
    }, [apiUrl, isDeliveryMan, user?._id]);

    useEffect(() => {
        fetchOrders();
        const iv = setInterval(fetchOrders, 30000);
        return () => clearInterval(iv);
    }, [fetchOrders]);

    const updateStatus = async (orderId: string, deliveryStatus: string) => {
        setUpdatingId(orderId);
        try {
            const body: any = { deliveryStatus };
            if (deliveryStatus === 'delivered') body.status = 'completed';
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            toast.success(`Order marked as ${deliveryStatus.replace(/_/g, ' ')}`);
            fetchOrders();
        } catch { toast.error('Failed to update status'); }
        finally { setUpdatingId(null); }
    };

    const assignCourier = async (orderId: string, courierId: string, courierName: string) => {
        setAssigningId(orderId);
        setOpenAssignId(null);
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ deliveryManId: courierId, deliveryStatus: 'assigned' }),
            });
            if (!res.ok) throw new Error();
            toast.success(`Order assigned to ${courierName}`);
            fetchOrders();
        } catch { toast.error('Assignment failed'); }
        finally { setAssigningId(null); }
    };

    const activeOrders = orders.filter(o => o.deliveryStatus !== 'delivered');
    const completedOrdersList = orders.filter(o => o.deliveryStatus === 'delivered');

    const pendingCount = activeOrders.filter(o => o.deliveryStatus === 'pending').length;
    const inProgressCount = activeOrders.filter(o => ['assigned', 'out_for_delivery'].includes(o.deliveryStatus)).length;

    const displayedOrders = viewTab === 'active' ? activeOrders : completedOrdersList;

    return (
        <AdminLayout title="Delivery Operations">
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-neutral-900">
                            {isDeliveryMan ? 'My Deliveries' : 'Delivery Operations'}
                        </h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            {isDeliveryMan
                                ? 'Your assigned delivery orders — update status as you progress'
                                : 'Online orders awaiting assignment and fulfillment'}
                        </p>
                    </div>
                    <button onClick={fetchOrders} className="p-2.5 rounded-[8px] border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors self-start">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats (admin only) */}
                {!isDeliveryMan && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-[8px] p-4 text-center">
                            <p className="text-2xl font-black text-neutral-700">{orders.length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Total Active</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-[8px] p-4 text-center">
                            <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
                            <p className="text-xs text-amber-600 mt-1">Unassigned</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-[8px] p-4 text-center">
                            <p className="text-2xl font-black text-blue-700">{inProgressCount}</p>
                            <p className="text-xs text-blue-600 mt-1">In Progress</p>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="flex gap-2.5 p-1.5 bg-neutral-100/50 rounded-[12px] w-fit">
                    <button
                        onClick={() => setViewTab("active")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${viewTab === "active"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        ACTIVE DELIVERIES
                    </button>
                    <button
                        onClick={() => setViewTab("completed")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${viewTab === "completed"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        COMPLETED DELIVERIES
                    </button>
                </div>

                {/* Unassigned alert for admin */}
                {!isDeliveryMan && pendingCount > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px] text-sm text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span><strong>{pendingCount}</strong> order{pendingCount > 1 ? 's' : ''} waiting for courier assignment.</span>
                    </div>
                )}

                {/* Orders Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white border border-dashed border-neutral-200 rounded-[12px] text-neutral-400">
                        <Package className="w-10 h-10 mb-2" />
                        <p className="font-medium">{isDeliveryMan ? 'No deliveries assigned to you yet' : `No ${viewTab} delivery orders`}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedOrders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.deliveryStatus] || STATUS_CONFIG.pending;
                            const nextStatus = NEXT_STATUS[order.deliveryStatus];
                            const assignedCourier = couriers.find(c => c._id === order.deliveryManId);

                            return (
                                <div key={order._id} className={`bg-white border rounded-[12px] p-5 shadow-sm flex flex-col transition-all hover:shadow-md ${order.deliveryStatus === 'assigned' ? 'border-blue-200' : order.deliveryStatus === 'out_for_delivery' ? 'border-amber-200' : 'border-neutral-200'}`}>
                                    {/* Order ID + Status */}
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="font-black text-neutral-900 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            {statusCfg.label}
                                        </span>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="space-y-2 mb-4 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                            <span className="font-semibold text-neutral-800">{order.customerInfo.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                            {order.customerInfo.phone}
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-neutral-500">
                                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{order.customerInfo.address}</span>
                                        </div>
                                    </div>

                                    {/* Items summary */}
                                    <div className="bg-neutral-50 rounded-[8px] p-2.5 mb-4 text-xs text-neutral-600">
                                        {order.items.slice(0, 2).map((it, i) => (
                                            <p key={i}>{it.quantity}× {it.title}</p>
                                        ))}
                                        {order.items.length > 2 && <p className="text-neutral-400">+{order.items.length - 2} more items</p>}
                                        <p className="font-bold text-neutral-900 mt-1">৳{order.total.toFixed(2)}</p>
                                    </div>

                                    {/* Assigned courier label */}
                                    {assignedCourier && (
                                        <div className="flex items-center gap-2 mb-3 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-[4px]">
                                            <Truck className="w-3.5 h-3.5" />
                                            <span className="font-semibold">{assignedCourier.name}</span>
                                            <span className="text-blue-400">{assignedCourier.phone}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 mt-auto">
                                        {/* Admin: assign courier dropdown for pending orders */}
                                        {!isDeliveryMan && order.deliveryStatus === 'pending' && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenAssignId(openAssignId === order._id ? null : order._id)}
                                                    disabled={assigningId === order._id || couriers.length === 0}
                                                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-[8px] border border-neutral-200 bg-neutral-50 text-sm font-semibold text-neutral-700 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50">
                                                    <span>{couriers.length === 0 ? 'No active couriers' : 'Assign Courier'}</span>
                                                    {assigningId === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                                {openAssignId === order._id && (
                                                    <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-neutral-200 rounded-[8px] shadow-xl z-20 overflow-hidden">
                                                        {couriers.map(c => (
                                                            <button key={c._id} onClick={() => assignCourier(order._id, c._id, c.name)}
                                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2">
                                                                <Truck className="w-3.5 h-3.5 text-neutral-400" />
                                                                <span className="font-medium">{c.name}</span>
                                                                <span className="text-xs text-neutral-400 ml-auto">{c.phone}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Deliveryman OR admin: advance status button */}
                                        {nextStatus && (order.deliveryStatus === 'assigned' || order.deliveryStatus === 'out_for_delivery') && (
                                            <button
                                                onClick={() => updateStatus(order._id, nextStatus)}
                                                disabled={updatingId === order._id}
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${nextStatus === 'delivered' ? 'bg-primary text-white shadow-md shadow-emerald-200 hover:bg-primary/90' : 'bg-primary text-white shadow-md shadow-primary/20 hover:brightness-110'}`}>
                                                {updatingId === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : nextStatus === 'delivered' ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                                {nextStatus === 'delivered' ? 'Mark Delivered' : 'Mark Out for Delivery'}
                                            </button>
                                        )}

                                        {/* Delivered badge */}
                                        {order.deliveryStatus === 'delivered' && (
                                            <div className="flex items-center justify-center gap-2 py-2.5 text-primary text-sm font-bold">
                                                <CheckCircle className="w-4 h-4" /> Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDelivery;
