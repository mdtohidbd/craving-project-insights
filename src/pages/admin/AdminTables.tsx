import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit, Trash2, Users, Clock, CheckCircle, XCircle, Search, ShoppingCart, Calendar, Home, Settings, X, RefreshCcw, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Table {
    _id: string;
    tableNumber: string;
    name?: string;
    capacity: number;
    sortOrder: number;
    status: "Free" | "Occupied" | "Reserved" | "Cleaning";
    currentOrder?: string;
    occupiedTime?: string;
    server?: string;
    createdAt?: string;
    updatedAt?: string;
}

const AdminTables = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({
        tableNumber: "",
        name: "",
        capacity: 4,
        sortOrder: 0
    });

    // Table status modal state
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
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

    const fetchTables = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/tables`);
            if (res.ok) {
                const data = await res.json();
                setTables(data);
            } else {
                throw new Error('Failed to fetch tables');
            }
        } catch (error) {
            console.error("Failed to fetch tables:", error);
            // Fallback to mock data if API fails
            setTables([
                { _id: "1", tableNumber: "T!", capacity: 4, sortOrder: 1, status: "Free" },
                { _id: "2", tableNumber: "t2", capacity: 4, sortOrder: 2, status: "Free" },
                { _id: "3", tableNumber: "T2", capacity: 4, sortOrder: 3, status: "Reserved" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleOpenModal = (table?: Table) => {
        if (table) {
            setEditingTable(table);
            setFormData({
                tableNumber: table.tableNumber,
                name: table.name || "",
                capacity: table.capacity,
                sortOrder: table.sortOrder
            });
        } else {
            setEditingTable(null);
            setFormData({ tableNumber: "", name: "", capacity: 4, sortOrder: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            const response = await fetch(editingTable ? `${apiUrl}/tables/${editingTable._id}` : `${apiUrl}/tables`, {
                method: editingTable ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to save table");
            }
            
            toast.success(editingTable ? "Table updated successfully" : "Table added successfully");
            setIsModalOpen(false);
            fetchTables();
        } catch (err: any) {
            console.error("Failed to save table:", err);
            toast.error(err.message || "Failed to save table");
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Table",
            message: "Are you sure you want to delete this table? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/tables/${id}`, { method: "DELETE" });
                    toast.success("Table deleted successfully");
                    fetchTables();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error("Failed to delete table:", err);
                    toast.error("Failed to delete table");
                }
            }
        });
    };

    const handleStatusAction = async (action: string) => {
        if (!selectedTable) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            let newStatus = selectedTable.status;
            let updateData: Record<string, any> = {};

            switch (action) {
                case 'newOrder':
                    window.location.href = `/admin/pos?table=${selectedTable._id}`;
                    return;
                case 'reserve':
                    newStatus = 'Reserved';
                    break;
                case 'markCleaning':
                    newStatus = 'Cleaning';
                    break;
                case 'markFree':
                    newStatus = 'Free';
                    updateData = { currentOrder: undefined, occupiedTime: undefined, server: undefined };
                    break;
                case 'edit':
                    handleOpenModal(selectedTable);
                    setIsStatusModalOpen(false);
                    return;
                case 'delete':
                    handleDelete(selectedTable._id);
                    setIsStatusModalOpen(false);
                    return;
            }

            await fetch(`${apiUrl}/tables/${selectedTable._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, ...updateData })
            });

            setIsStatusModalOpen(false);
            fetchTables();
            toast.success(`Table status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update table status:", err);
            toast.error("Failed to update status");
        }
    };

    const counts = {
        All: tables.length,
        Available: tables.filter(t => t.status === "Free").length,
        Reserved: tables.filter(t => t.status === "Reserved").length,
        "KOT Sent": tables.filter(t => t.status === "Occupied").length,
        "Bill Printed": 0,
        Cleaning: tables.filter(t => t.status === "Cleaning").length
    };

    const filteredTables = tables.filter(table => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Available") return table.status === "Free";
        if (activeFilter === "Reserved") return table.status === "Reserved";
        if (activeFilter === "KOT Sent") return table.status === "Occupied";
        if (activeFilter === "Cleaning") return table.status === "Cleaning";
        return true;
    });

    return (
        <AdminLayout title="Tables">
            <div className="space-y-8 bg-[#f8fafc] min-h-screen -m-6 p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 flex items-center gap-4">
                        <h1 className="text-3xl font-black text-[#0f172a]">Tables</h1>
                        <button 
                            onClick={fetchTables}
                            className="p-2 hover:bg-neutral-100 rounded-full transition-all active:rotate-180 duration-500"
                        >
                            <RefreshCcw className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-neutral-400" />
                            <div className="flex bg-neutral-100 p-1 rounded-full overflow-x-auto custom-scrollbar no-scrollbar">
                                {Object.entries(counts).map(([label, count]) => (
                                    <button
                                        key={label}
                                        onClick={() => setActiveFilter(label)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            activeFilter === label 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                    >
                                        {label} ({count})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Add Table
                        </button>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTables.map((table) => (
                        <div 
                            key={table._id}
                            onClick={() => {
                                setSelectedTable(table);
                                setIsStatusModalOpen(true);
                            }}
                            className={`group relative cursor-pointer border-2 rounded-[2.5rem] p-6 transition-all hover:scale-[1.02] active:scale-95 ${
                                table.status === "Free" ? 'bg-[#f0fdf4] border-[#22c55e] text-[#15803d]' :
                                table.status === "Reserved" ? 'bg-[#f5f3ff] border-[#8b5cf6] text-[#6d28d9]' :
                                table.status === "Occupied" ? 'bg-[#fff1f2] border-[#f43f5e] text-[#be123c]' :
                                'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8]'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black">{table.tableNumber}</h3>
                                    <div className="flex items-center gap-2 opacity-70">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-bold">{table.capacity} seats</span>
                                    </div>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    table.status === "Free" ? 'bg-white/50 text-[#15803d]' :
                                    table.status === "Reserved" ? 'bg-white/50 text-[#6d28d9]' :
                                    table.status === "Occupied" ? 'bg-white/50 text-[#be123c]' :
                                    'bg-white/50 text-[#1d4ed8]'
                                }`}>
                                    {table.status}
                                </div>
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(table); }}
                                    className="p-2 bg-white/80 hover:bg-white rounded-full text-neutral-600 shadow-sm transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(table._id); }}
                                    className="p-2 bg-white/80 hover:bg-white rounded-full text-rose-500 shadow-sm transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && filteredTables.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold">No tables found</p>
                        <p className="text-sm">Try changing your filter or add a new table.</p>
                    </div>
                )}
            </div>

            {/* Modals remain same but styled to match */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-[#0f172a]">{editingTable ? "Edit Table" : "Add Table"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Table Number</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.tableNumber}
                                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    placeholder="e.g., T1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Order</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-2xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-blue-100">
                                    {editingTable ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Status Modal styled as pill actions */}
            {isStatusModalOpen && selectedTable && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    selectedTable.status === "Free" ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                                    selectedTable.status === "Reserved" ? 'bg-purple-500' :
                                    'bg-rose-500'
                                }`} />
                                <h3 className="text-xl font-bold text-[#0f172a]">Table {selectedTable.tableNumber}</h3>
                            </div>
                            <button onClick={() => setIsStatusModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Status Row */}
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-neutral-500 font-bold">Status</span>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black ${
                                selectedTable.status === "Free" ? 'bg-emerald-50 text-emerald-600' :
                                selectedTable.status === "Reserved" ? 'bg-purple-50 text-purple-600' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                                {selectedTable.status === "Free" ? "Available" : selectedTable.status}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleStatusAction('newOrder')}
                                    className="flex-1 py-3.5 bg-[#1d7cf2] hover:bg-[#1a6ed9] text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Order</span>
                                </button>
                                <button
                                    onClick={() => handleStatusAction(selectedTable.status === "Free" ? 'reserve' : 'markFree')}
                                    className="flex-1 py-3.5 bg-[#e2f3f5] hover:bg-[#d1eaed] text-[#0f172a] font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {selectedTable.status === "Free" ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    <span>{selectedTable.status === "Free" ? "Reserve" : "Mark Free"}</span>
                                </button>
                            </div>

                            <button
                                onClick={() => handleStatusAction('markCleaning')}
                                className="w-full py-4 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold rounded-[2rem] border border-neutral-300 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Mark Cleaning</span>
                            </button>

                            <div className="flex gap-4 pt-4 border-t border-neutral-100 items-center">
                                <button
                                    onClick={() => handleStatusAction('edit')}
                                    className="flex-1 py-4 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold rounded-[2rem] border border-neutral-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Table</span>
                                </button>
                                <button
                                    onClick={() => handleStatusAction('delete')}
                                    className="w-12 h-12 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-100"
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

export default AdminTables;
