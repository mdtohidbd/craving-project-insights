import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'sonner';
import {
    Truck, UserPlus, Phone, Bike, Trash2, ToggleLeft, ToggleRight,
    Package, CheckCircle2, Loader2, RefreshCw, X, Users, BarChart2,
    MessageSquare, Copy, Check, Send
} from 'lucide-react';

interface DeliveryManEnriched {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    vehicleDetails?: string;
    status: 'active' | 'inactive';
    activeOrders: number;
    totalOrders: number;
}

const EMPTY_FORM = { name: '', phone: '', email: '', vehicleDetails: '', username: '', password: '' };

const AdminDeliverymen = () => {
    const [deliveryMen, setDeliveryMen] = useState<DeliveryManEnriched[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [selectedCourier, setSelectedCourier] = useState<DeliveryManEnriched | null>(null);
    const [smsMessage, setSmsMessage] = useState('');
    const [isSendingSMS, setIsSendingSMS] = useState(false);
    const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/delivery-men`);
            if (res.ok) setDeliveryMen(await res.json());
        } catch { toast.error('Failed to load deliverymen'); }
        finally { setIsLoading(false); }
    }, [apiUrl]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!form.username || !form.password) {
            toast.error('Username and password are required for the deliveryman to log in.');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${apiUrl}/delivery-men`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            toast.success(`${form.name} registered as staff courier`);
            setIsModalOpen(false);
            setForm(EMPTY_FORM);
            fetchData();
        } catch (err: any) { toast.error(err.message || 'Failed to create deliveryman'); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Remove ${name} and their staff account?`)) return;
        try {
            await fetch(`${apiUrl}/delivery-men/${id}`, { method: 'DELETE' });
            toast.success(`${name} removed`);
            fetchData();
        } catch { toast.error('Delete failed'); }
    };

    const handleToggle = async (id: string) => {
        setTogglingId(id);
        try {
            const res = await fetch(`${apiUrl}/delivery-men/${id}/toggle-status`, { method: 'PATCH' });
            if (res.ok) {
                const updated = await res.json();
                setDeliveryMen(prev => prev.map(dm => dm._id === id ? { ...dm, status: updated.status } : dm));
                toast.success(`Status updated`);
            }
        } catch { toast.error('Failed to toggle status'); }
        finally { setTogglingId(null); }
    };

    const handleSendSMS = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourier || !smsMessage.trim()) return;

        setIsSendingSMS(true);
        try {
            const res = await fetch(`${apiUrl}/delivery-men/${selectedCourier._id}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: smsMessage }),
            });

            if (res.ok) {
                toast.success("Message sent successfully!");
                setSmsMessage("");
                setSelectedCourier(null);
            } else {
                toast.error("Failed to send message. Check MimSMS configuration.");
            }
        } catch (error) {
            toast.error("An error occurred while sending SMS.");
        } finally {
            setIsSendingSMS(false);
        }
    };

    const handleCopyPhone = (id: string, phone: string) => {
        navigator.clipboard.writeText(phone);
        setCopiedPhoneId(id);
        toast.success("Phone number copied to clipboard!");
        setTimeout(() => setCopiedPhoneId(null), 2000);
    };

    const activeCount = deliveryMen.filter(d => d.status === 'active').length;
    const busyCount = deliveryMen.filter(d => d.activeOrders > 0).length;

    return (
        <AdminLayout title="Deliveryman Management">
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-neutral-900">Deliveryman Fleet</h2>
                        <p className="text-sm text-neutral-500 mt-1">Manage your courier team — add, activate, and track workload</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} className="p-2.5 rounded-[8px] border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-[8px] font-bold text-sm shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
                            <UserPlus className="w-4 h-4" /> Add Courier
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-neutral-900">{deliveryMen.length}</p>
                        <p className="text-xs font-medium text-neutral-500 mt-1">Total Couriers</p>
                    </div>
                    <div className="bg-primary/10 border border-emerald-100 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-primary">{activeCount}</p>
                        <p className="text-xs font-medium text-primary mt-1">Active</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-[8px] p-4 text-center shadow-sm">
                        <p className="text-3xl font-black text-amber-700">{busyCount}</p>
                        <p className="text-xs font-medium text-amber-600 mt-1">On Delivery</p>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : deliveryMen.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white border border-dashed border-neutral-200 rounded-[12px] text-neutral-400">
                        <Users className="w-10 h-10 mb-2" />
                        <p className="font-medium">No couriers registered yet</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-3 text-sm text-primary font-bold hover:underline">+ Add First Courier</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deliveryMen.map(dm => (
                            <div key={dm._id} className={`bg-white border rounded-[12px] p-5 shadow-sm transition-all hover:shadow-md ${dm.status === 'inactive' ? 'opacity-60 border-neutral-200' : dm.activeOrders > 0 ? 'border-amber-200' : 'border-neutral-200'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center font-black text-lg ${dm.status === 'active' ? 'bg-gradient-to-br from-primary/15 to-primary/30 text-primary' : 'bg-neutral-100 text-neutral-400'}`}>
                                        {dm.name.charAt(0).toUpperCase()}
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggle(dm._id)}
                                            disabled={togglingId === dm._id}
                                            title={dm.status === 'active' ? 'Deactivate' : 'Activate'}
                                            className="p-1.5 rounded-[4px] hover:bg-neutral-100 text-neutral-400 transition-colors disabled:opacity-50">
                                            {togglingId === dm._id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : dm.status === 'active' ? (
                                                <ToggleRight className="w-5 h-5 text-primary" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button onClick={() => handleDelete(dm._id, dm.name)}
                                            className="p-1.5 rounded-[4px] hover:bg-rose-50 text-neutral-300 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="font-bold text-neutral-900 mb-0.5">{dm.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1 group relative">
                                    <Phone className="w-3 h-3" />
                                    <span>{dm.phone}</span>
                                    <button 
                                        onClick={() => handleCopyPhone(dm._id, dm.phone)}
                                        className="ml-1 p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-indigo-600 transition-colors"
                                        title="Copy Phone Number"
                                    >
                                        {copiedPhoneId === dm._id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                                {dm.vehicleDetails && (
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
                                        <Truck className="w-3 h-3" />{dm.vehicleDetails}
                                    </div>
                                )}

                                <div className="flex gap-2 mb-3 mt-2">
                                    <button
                                        onClick={() => setSelectedCourier(dm)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-[4px] transition-colors border border-indigo-100"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Send Message
                                    </button>
                                </div>

                                {/* Status + workload */}
                                <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${dm.status === 'active' ? 'bg-emerald-100 text-primary border-primary/30' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                                        {dm.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : null}
                                        {dm.status}
                                    </span>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        <span title="Active orders" className={`flex items-center gap-1 font-bold ${dm.activeOrders > 0 ? 'text-amber-600' : ''}`}>
                                            <Package className="w-3 h-3" />{dm.activeOrders} active
                                        </span>
                                        <span title="Total orders" className="flex items-center gap-1">
                                            <BarChart2 className="w-3 h-3" />{dm.totalOrders} total
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <div>
                                <p className="font-black text-neutral-900 text-lg">Add New Courier</p>
                                <p className="text-xs text-neutral-500">Register a deliveryman to the fleet & create account</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-[8px] hover:bg-neutral-100 text-neutral-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 block">Full Name *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 block">Phone *</label>
                                    <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+880..."
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">Username *</label>
                                    <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                        placeholder="john_delivery"
                                        className="w-full bg-primary/5 border border-primary/20 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">Password *</label>
                                    <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-primary/5 border border-primary/20 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 block">Email (optional)</label>
                                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="courier@example.com" type="email"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1 block">Vehicle Details (optional)</label>
                                <input value={form.vehicleDetails} onChange={e => setForm({ ...form, vehicleDetails: e.target.value })}
                                    placeholder="e.g. Bike — DHA-KA-1234"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-[8px] text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="px-5 py-2.5 rounded-[8px] text-sm font-bold bg-primary text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Register Courier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send SMS Modal */}
            {selectedCourier && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCourier(null)}>
                    <div className="bg-white rounded-[12px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">Message Courier</p>
                                    <p className="text-xs text-neutral-500">{selectedCourier.name} • {selectedCourier.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCourier(null)} className="p-2 rounded-[8px] hover:bg-neutral-100 text-neutral-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSendSMS} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-600 mb-2 block">Your Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={smsMessage}
                                        onChange={(e) => setSmsMessage(e.target.value)}
                                        placeholder="Type your message to the courier..."
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                                    ></textarea>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setSelectedCourier(null)}
                                        className="px-4 py-2.5 rounded-[8px] text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSendingSMS || !smsMessage.trim()}
                                        className="px-5 py-2.5 rounded-[8px] text-sm font-bold bg-indigo-500 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2">
                                        {isSendingSMS ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send SMS
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDeliverymen;
