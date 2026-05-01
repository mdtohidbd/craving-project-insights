import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Lock, Smartphone, Save, ShieldCheck, AlertCircle, Phone, Truck } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [smsNumber, setSmsNumber] = useState("+1 (555) 0123");
    const [newSmsNumber, setNewSmsNumber] = useState("");

    // Delivery Fee state
    const [deliveryFee, setDeliveryFee] = useState<number>(50);
    const [newDeliveryFee, setNewDeliveryFee] = useState<string>("50");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        if (data.deliveryFee !== undefined) {
                            setDeliveryFee(data.deliveryFee);
                            setNewDeliveryFee(data.deliveryFee.toString());
                        }
                        if (data.smsNumber) {
                            setSmsNumber(data.smsNumber);
                            setNewSmsNumber(data.smsNumber);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveDeliveryFee = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryFee: Number(newDeliveryFee) })
            });

            if (res.ok) {
                setDeliveryFee(Number(newDeliveryFee));
                toast.success("Delivery fee updated successfully!");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Failed to update delivery fee:", error);
            toast.error("Failed to update delivery fee.");
        }
    };

    const handleSaveSmsNumber = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ smsNumber: newSmsNumber })
            });

            if (res.ok) {
                setSmsNumber(newSmsNumber);
                toast.success("SMS number updated successfully!");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Failed to update SMS number:", error);
            toast.error("Failed to update SMS number.");
        }
    };

    return (
        <AdminLayout title="Settings">
            <div className="max-w-4xl space-y-8">

                {/* Security Settings */}
                <div className="bg-white border border-neutral-200/60 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-[12px] flex items-center justify-center shadow-inner">
                                <Lock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">Security & Password</h2>
                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Update your admin login credentials</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="8+ characters"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
                            <p className="text-xs font-bold text-neutral-400 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                End-to-end encrypted session
                            </p>
                            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-black rounded-[12px] hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* SMS Settings */}
                <div className="bg-white border border-neutral-200/60 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-[12px] flex items-center justify-center shadow-inner">
                                <Smartphone className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">SMS Notifications</h2>
                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Manage where order alerts are sent</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center gap-5 p-6 bg-rose-50/30 border border-rose-100 rounded-[12px]">
                                <div className="w-12 h-12 rounded-[8px] bg-white flex items-center justify-center shadow-sm">
                                    <Phone className="w-6 h-6 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Live Number</p>
                                    <p className="text-xl font-black text-neutral-900 tracking-tight">{smsNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">Update Receiver</label>
                                <input
                                    type="text"
                                    value={newSmsNumber}
                                    onChange={(e) => setNewSmsNumber(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="e.g. +1 (555) 0000"
                                />
                                <p className="text-[10px] font-bold text-neutral-400 mt-2 flex items-center gap-1.5 ml-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                    Requires country code (e.g., +880)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-neutral-100">
                            <button onClick={handleSaveSmsNumber} className="flex items-center justify-center gap-2 px-8 py-3 bg-rose-500 text-white text-sm font-black rounded-[12px] hover:bg-rose-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-rose-500/20">
                                <Save className="w-4 h-4" />
                                Save SMS Config
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="bg-white border border-neutral-200/60 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-[12px] flex items-center justify-center shadow-inner">
                                <Truck className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">Delivery Configuration</h2>
                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Configure delivery charges across the site</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center gap-5 p-6 bg-amber-50/30 border border-amber-100 rounded-[12px]">
                                <div className="w-12 h-12 rounded-[8px] bg-white flex items-center justify-center shadow-sm">
                                    <Truck className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Active Fee</p>
                                    <p className="text-xl font-black text-neutral-900 tracking-tight">৳{deliveryFee}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">New Delivery Fee (৳)</label>
                                <input
                                    type="number"
                                    value={newDeliveryFee}
                                    onChange={(e) => setNewDeliveryFee(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="e.g. 50"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-neutral-100">
                            <button onClick={handleSaveDeliveryFee} className="flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 text-white text-sm font-black rounded-[12px] hover:bg-amber-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                                <Save className="w-4 h-4" />
                                Save Fee Settings
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
