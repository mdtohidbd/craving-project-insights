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
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Lock className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-100">Security & Password</h2>
                                <p className="text-sm text-neutral-400">Update your admin login credentials</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
                                    placeholder="8+ characters"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-neutral-600"
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4 mt-6 border-t border-neutral-800">
                            <p className="text-xs text-neutral-500 flex items-center gap-1.5 flex-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Secure connection active.
                            </p>
                            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-500/20">
                                <Save className="w-4 h-4" />
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Smartphone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-100">SMS Notifications</h2>
                                <p className="text-sm text-neutral-400">Manage where order alerts are sent</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">

                        <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-lg max-w-md">
                            <div className="mt-0.5"><Phone className="w-5 h-5 text-neutral-500" /></div>
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Current receiving number</p>
                                <p className="text-lg font-medium text-neutral-100">{smsNumber}</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Update Phone Number</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newSmsNumber}
                                    onChange={(e) => setNewSmsNumber(e.target.value)}
                                    className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g. +1 (555) 0000"
                                />
                            </div>
                            <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Include country code for international numbers.
                            </p>
                        </div>

                        <div className="flex items-center justify-end py-4 mt-6 border-t border-neutral-800">
                            <button onClick={handleSaveSmsNumber} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-emerald-950 text-sm font-medium rounded-lg hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20">
                                <Save className="w-4 h-4" />
                                Save Number
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delivery Settings */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Truck className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-100">Delivery Configuration</h2>
                                <p className="text-sm text-neutral-400">Configure delivery charges across the site</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">

                        <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-800 rounded-lg max-w-md">
                            <div className="mt-0.5"><Truck className="w-5 h-5 text-neutral-500" /></div>
                            <div>
                                <p className="text-sm text-neutral-400 mb-1">Current Delivery Fee</p>
                                <p className="text-lg font-medium text-neutral-100">৳{deliveryFee}</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Update Delivery Fee (৳)</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={newDeliveryFee}
                                    onChange={(e) => setNewDeliveryFee(e.target.value)}
                                    className="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-neutral-600"
                                    placeholder="e.g. 50"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end py-4 mt-6 border-t border-neutral-800">
                            <button onClick={handleSaveDeliveryFee} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-amber-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors shadow-sm shadow-amber-500/20">
                                <Save className="w-4 h-4" />
                                Save Fee
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
