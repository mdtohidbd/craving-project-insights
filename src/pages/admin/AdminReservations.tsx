import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Search, Calendar as CalendarIcon, Filter, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

const AdminReservations = () => {
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const response = await fetch(`${apiUrl}/reservations`);
            if (response.ok) {
                const data = await response.json();
                setReservations(data);
            } else {
                toast.error("Failed to fetch reservations");
            }
        } catch (error) {
            console.error("Error fetching reservations:", error);
            toast.error("Network error. Could not fetch reservations.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const response = await fetch(`${apiUrl}/reservations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast.success(`Reservation ${newStatus} successfully`);
                fetchReservations();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating reservation:", error);
            toast.error("Error updating status");
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Reservation",
            message: "Are you sure you want to delete this reservation? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    const response = await fetch(`${apiUrl}/reservations/${id}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        toast.success("Reservation deleted successfully");
                        fetchReservations();
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    } else {
                        toast.error("Failed to delete reservation");
                    }
                } catch (error) {
                    console.error("Error deleting reservation:", error);
                    toast.error("Error deleting reservation");
                }
            }
        });
    };

    const filteredReservations = reservations.filter(res => {
        const matchesSearch = 
            res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            res.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.phone.includes(searchTerm);
            
        const matchesStatus = statusFilter === "all" || res.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return "bg-green-100 text-green-700 border border-green-200";
            case 'pending': return "bg-yellow-100 text-yellow-700 border border-yellow-200";
            case 'cancelled': return "bg-red-100 text-red-700 border border-red-200";
            default: return "bg-neutral-100 text-neutral-600";
        }
    };

    return (
        <AdminLayout title="Table Reservations">
            <div className="space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white border border-neutral-200 p-4 rounded-[8px]">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search by Name, Booking ID or Phone..." 
                            className="w-full bg-white border border-neutral-200 rounded-[4px] pl-10 pr-4 py-2 text-neutral-900 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-neutral-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-5 h-5 text-neutral-400" />
                        <select 
                            className="bg-white border border-neutral-200 rounded-[4px] px-4 py-2 text-neutral-900 focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-auto"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Reservations List */}
                <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Booking ID & Name</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Date & Time</th>
                                    <th className="px-6 py-4 font-medium">Guests</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                            Loading reservations...
                                        </td>
                                    </tr>
                                ) : filteredReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                                            No reservations found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReservations.map((res) => (
                                        <tr key={res._id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-neutral-900">{res.name}</p>
                                                <span className="text-xs text-neutral-500 font-mono">{res.bookingId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-neutral-600">{res.phone}</p>
                                                {res.requests && (
                                                    <p className="text-xs text-neutral-500 truncate max-w-[150px] mt-1" title={res.requests}>
                                                        Note: {res.requests}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-neutral-600 mb-1">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-sm">{res.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-neutral-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{res.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium border border-neutral-200">
                                                    {res.guests}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusStyle(res.status)}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {res.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(res._id, 'confirmed')}
                                                            title="Confirm Booking"
                                                            className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(res._id, 'cancelled')}
                                                            title="Cancel Booking"
                                                            className="p-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(res._id)}
                                                    title="Delete Booking"
                                                    className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 border border-neutral-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-[12px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-[12px] transition-all shadow-lg shadow-rose-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminReservations;
