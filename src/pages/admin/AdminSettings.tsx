import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Lock, Smartphone, Save, ShieldCheck, AlertCircle, Phone, Truck, Globe } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/context/SettingsContext";

const AdminSettings = () => {
    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { settings, updateSettings, isLoading: settingsLoading } = useSettings();

    const [websiteName, setWebsiteName] = useState("");
    const [smsNumber, setSmsNumber] = useState("");
    const [deliveryFee, setDeliveryFee] = useState<string>("50");

    useEffect(() => {
        if (!settingsLoading && settings) {
            setWebsiteName(settings.websiteName);
            setSmsNumber(settings.smsNumber);
            setDeliveryFee(settings.deliveryFee.toString());
        }
    }, [settings, settingsLoading]);

    const handleSaveGeneral = async () => {
        try {
            await updateSettings({ websiteName });
            toast.success("Website name updated successfully!");
        } catch (error) {
            toast.error("Failed to update website name.");
        }
    };

    const handleSaveDeliveryFee = async () => {
        try {
            await updateSettings({ deliveryFee: Number(deliveryFee) });
            toast.success("Delivery fee updated successfully!");
        } catch (error) {
            toast.error("Failed to update delivery fee.");
        }
    };

    const handleSaveSmsNumber = async () => {
        try {
            await updateSettings({ smsNumber });
            toast.success("SMS number updated successfully!");
        } catch (error) {
            toast.error("Failed to update SMS number.");
        }
    };

    return (
        <AdminLayout title="Settings">
            <div className="max-w-4xl space-y-8 pb-12">

                {/* General Settings */}
                <div className="bg-white border border-neutral-200/60 rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center shadow-inner">
                                <Globe className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">General Information</h2>
                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Basic website identity settings</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">Website Name</label>
                                <input
                                    type="text"
                                    value={websiteName}
                                    onChange={(e) => setWebsiteName(e.target.value)}
                                    className="w-full bg-neutral-50/50 border border-neutral-200 text-neutral-900 rounded-[12px] px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="e.g. Craving"
                                />
                                <p className="text-[10px] font-bold text-neutral-400 mt-2 flex items-center gap-1.5 ml-1">
                                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                                    This name appears across the entire website
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-neutral-100">
                            <button onClick={handleSaveGeneral} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 text-white text-sm font-black rounded-[12px] hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                                <Save className="w-4 h-4" />
                                Save Identity
                            </button>
                        </div>
                    </div>
                </div>

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
                                    <p className="text-xl font-black text-neutral-900 tracking-tight">{settings.smsNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">Update Receiver</label>
                                <input
                                    type="text"
                                    value={smsNumber}
                                    onChange={(e) => setSmsNumber(e.target.value)}
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
                                    <p className="text-xl font-black text-neutral-900 tracking-tight">৳{settings.deliveryFee}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest ml-1">New Delivery Fee (৳)</label>
                                <input
                                    type="number"
                                    value={deliveryFee}
                                    onChange={(e) => setDeliveryFee(e.target.value)}
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
