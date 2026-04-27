import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Truck, Plus, Trash2, Edit, Search, User, Phone, MapPin, Package, CheckCircle, ArrowRight, UserPlus, X, Users } from "lucide-react";
import { toast } from "sonner";

interface DeliveryMan {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleDetails?: string;
    status: 'active' | 'inactive';
}

interface AssignedOrder {
    _id: string;
    customerInfo: {
        name: string;
        phone: string;
        address: string;
    };
    total: number;
    deliveryStatus: string;
    orderType: string;
    tableNumber: string;
    createdAt: string;
}

const AdminDelivery = () => {
    const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
    const [activeDeliveries, setActiveDeliveries] = useState<AssignedOrder[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newCourier, setNewCourier] = useState({ name: '', phone: '', email: '', vehicleDetails: '' });
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [dmRes, orderRes] = await Promise.all([
                fetch(`${apiUrl}/delivery-men`),
                fetch(`${apiUrl}/orders`)
            ]);

            if (dmRes.ok) setDeliveryMen(await dmRes.json());
            if (orderRes.ok) {
                const allOrders = await orderRes.json();
                setActiveDeliveries(allOrders.filter((o: any) =>
                    (o.orderType === 'takeaway' || o.orderType === 'online') &&
                    o.deliveryStatus && o.deliveryStatus !== 'delivered' &&
                    o.status !== 'completed'
                ));
            }
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAddCourier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/delivery-men`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCourier)
            });
            if (res.ok) {
                toast.success("Courier added successfully");
                setIsAddModalOpen(false);
                setNewCourier({ name: '', phone: '', email: '', vehicleDetails: '' });
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to add courier");
        }
    };

    const handleDeleteCourier = async (id: string) => {
        if (!confirm("Are you sure you want to delete this courier?")) return;
        try {
            const res = await fetch(`${apiUrl}/delivery-men/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Courier deleted");
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to delete courier");
        }
    };

    const updateDeliveryStatus = async (orderId: string, status: string) => {
        try {
            const updateData: any = { deliveryStatus: status };
            if (status === 'delivered') {
                updateData.status = 'completed';
            }

            const res = await fetch(`${apiUrl}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (res.ok) {
                toast.success(`Order marked as ${status.replace(/_/g, ' ')}`);
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <AdminLayout title="Delivery Management">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight">Fleet & Fulfillment</h2>
                        <p className="text-neutral-500 mt-1">Manage couriers and monitor active deliveries.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-slate-200"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add New Courier
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Courier List */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200/60 overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif font-bold text-xl text-neutral-900">Active Fleet</h3>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{deliveryMen.length} Total</span>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {deliveryMen.map((dm) => (
                                    <div key={dm._id} className="group p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 font-bold border border-neutral-100 shadow-sm">
                                                    {dm.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900 text-sm leading-none">{dm.name}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${dm.status === 'active' ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                                        {dm.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCourier(dm._id)}
                                                className="p-2 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                <Phone className="w-3 h-3" /> {dm.phone}
                                            </div>
                                            {dm.vehicleDetails && (
                                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                    <Truck className="w-3 h-3" /> {dm.vehicleDetails}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {deliveryMen.length === 0 && (
                                    <div className="text-center py-10">
                                        <Users className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-400 italic">No couriers registered</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Deliveries */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200/60 min-h-[500px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-serif font-bold text-2xl text-neutral-900">Active Shipments</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold text-neutral-700">{activeDeliveries.length} In Progress</span>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : activeDeliveries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-neutral-400 border-2 border-dashed border-neutral-100 rounded-3xl">
                                    <Package className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No active deliveries at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeDeliveries.map((order) => (
                                        <div key={order._id} className="group bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-neutral-200/40 hover:bg-white hover:border-primary/20 transition-all relative overflow-hidden flex flex-col">
                                            {/* Status Badge */}
                                            <div className="absolute top-0 right-0">
                                                <div className={`px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${order.deliveryStatus === 'out_for_delivery' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                    {order.deliveryStatus.replace(/_/g, ' ')}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
                                                        <Package className="w-6 h-6 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-serif font-black text-lg text-neutral-900 tracking-tight">#{order._id.slice(-6).toUpperCase()}</h4>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{order.orderType}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-6">
                                                    <div className="flex items-start gap-3">
                                                        <User className="w-4 h-4 text-neutral-300 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-1">Customer</p>
                                                            <p className="text-sm font-bold text-neutral-900">{order.customerInfo.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="w-4 h-4 text-neutral-300 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider leading-none mb-1">Destination</p>
                                                            <p className="text-sm font-medium text-neutral-600 line-clamp-2 leading-relaxed">{order.customerInfo.address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-neutral-100/50">
                                                {order.deliveryStatus === 'assigned' && (
                                                    <button
                                                        onClick={() => updateDeliveryStatus(order._id, 'out_for_delivery')}
                                                        className="col-span-2 py-3 bg-[#1e293b] hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 group/btn"
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Truck className="w-4 h-4 group-hover/btn:animate-bounce" />
                                                            Mark Out for Delivery
                                                        </div>
                                                    </button>
                                                )}
                                                {order.deliveryStatus === 'out_for_delivery' && (
                                                    <button
                                                        onClick={() => updateDeliveryStatus(order._id, 'delivered')}
                                                        className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-100"
                                                    >
                                                        <div className="flex items-center justify-center gap-2">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Confirm Delivery
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Courier Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h3 className="font-serif font-black text-2xl text-neutral-900 tracking-tight">Onboard Courier</h3>
                                <p className="text-sm text-neutral-500 mt-1">Register a new courier to the fleet.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-neutral-400 hover:text-neutral-900 border border-transparent hover:border-neutral-100">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCourier} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={newCourier.name}
                                        onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Contact Number</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+880..."
                                        value={newCourier.phone}
                                        onChange={(e) => setNewCourier({ ...newCourier, phone: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Email Address (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="courier@example.com"
                                    value={newCourier.email}
                                    onChange={(e) => setNewCourier({ ...newCourier, email: e.target.value })}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Vehicle Details</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bike (DHAKA-METRO-KA-1234)"
                                    value={newCourier.vehicleDetails}
                                    onChange={(e) => setNewCourier({ ...newCourier, vehicleDetails: e.target.value })}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 mt-4"
                            >
                                Register Courier
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDelivery;
