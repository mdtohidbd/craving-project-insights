import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit, Trash2, Users, Clock, CheckCircle, XCircle, Search, ShoppingCart, Calendar, Home, Settings, X } from "lucide-react";

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
    const [searchTerm, setSearchTerm] = useState("");
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
                { _id: "1", tableNumber: "T1", capacity: 4, sortOrder: 1, status: "Free" },
                { _id: "2", tableNumber: "T2", capacity: 2, sortOrder: 2, status: "Occupied", currentOrder: "ORD-001", occupiedTime: "30 min", server: "John" },
                { _id: "3", tableNumber: "T3", capacity: 6, sortOrder: 3, status: "Reserved", server: "Sarah" },
                { _id: "4", tableNumber: "T4", capacity: 4, sortOrder: 4, status: "Free" },
                { _id: "5", tableNumber: "T5", capacity: 8, sortOrder: 5, status: "Occupied", currentOrder: "ORD-002", occupiedTime: "45 min", server: "Mike" },
                { _id: "6", tableNumber: "T6", capacity: 2, sortOrder: 6, status: "Cleaning" }
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
            
            if (editingTable) {
                await fetch(`${apiUrl}/tables/${editingTable._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            } else {
                await fetch(`${apiUrl}/tables`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
            }
            
            setIsModalOpen(false);
            fetchTables();
        } catch (err) {
            console.error("Failed to save table:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this table?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/tables/${id}`, { method: "DELETE" });
            fetchTables();
        } catch (err) {
            console.error("Failed to delete table:", err);
        }
    };

    // Table status modal functions
    const handleStatusClick = (table: Table) => {
        setSelectedTable(table);
        setIsStatusModalOpen(true);
    };

    const handleStatusAction = async (action: string) => {
        if (!selectedTable) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            let newStatus = selectedTable.status;
            let updateData: Record<string, any> = {};

            switch (action) {
                case 'newOrder':
                    // Navigate to POS with table selected
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

            // Update table status
            await fetch(`${apiUrl}/tables/${selectedTable._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, ...updateData })
            });

            setIsStatusModalOpen(false);
            fetchTables();
        } catch (err) {
            console.error("Failed to update table status:", err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Free": return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
            case "Occupied": return "bg-rose-400/10 text-rose-400 border-rose-400/20";
            case "Reserved": return "bg-amber-400/10 text-amber-400 border-amber-400/20";
            case "Cleaning": return "bg-blue-400/10 text-blue-400 border-blue-400/20";
            default: return "bg-neutral-400/10 text-neutral-400 border-neutral-400/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Free": return <CheckCircle className="w-3 h-3" />;
            case "Occupied": return <Users className="w-3 h-3" />;
            case "Reserved": return <Clock className="w-3 h-3" />;
            case "Cleaning": return <XCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const filteredTables = tables.filter(table =>
        table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusCounts = {
        total: tables.length,
        available: tables.filter(t => t.status === "Free").length,
        occupied: tables.filter(t => t.status === "Occupied").length,
        reserved: tables.filter(t => t.status === "Reserved").length,
        cleaning: tables.filter(t => t.status === "Cleaning").length
    };

    return (
        <AdminLayout title="Table Management">
            <div className="space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">Total Tables</p>
                                <p className="text-2xl font-bold text-white">{statusCounts.total}</p>
                            </div>
                            <div className="p-2 bg-neutral-800 rounded-lg">
                                <Users className="w-5 h-5 text-neutral-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">Available</p>
                                <p className="text-2xl font-bold text-emerald-400">{statusCounts.available}</p>
                            </div>
                            <div className="p-2 bg-emerald-400/10 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">Occupied</p>
                                <p className="text-2xl font-bold text-rose-400">{statusCounts.occupied}</p>
                            </div>
                            <div className="p-2 bg-rose-400/10 rounded-lg">
                                <Users className="w-5 h-5 text-rose-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">Reserved</p>
                                <p className="text-2xl font-bold text-amber-400">{statusCounts.reserved}</p>
                            </div>
                            <div className="p-2 bg-amber-400/10 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-400">Cleaning</p>
                                <p className="text-2xl font-bold text-blue-400">{statusCounts.cleaning}</p>
                            </div>
                            <div className="p-2 bg-blue-400/10 rounded-lg">
                                <XCircle className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-500"
                        />
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Table
                    </button>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTables.map((table) => (
                        <div key={table._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{table.tableNumber}</h3>
                                    <p className="text-sm text-neutral-400">Capacity: {table.capacity}</p>
                                </div>
                                <button
                                    onClick={() => handleStatusClick(table)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(table.status)}`}
                                >
                                    {getStatusIcon(table.status)}
                                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                </button>
                            </div>
                            
                            {table.status === "Occupied" && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Order:</span>
                                        <span className="text-neutral-300">{table.currentOrder}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Time:</span>
                                        <span className="text-neutral-300">{table.occupiedTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Server:</span>
                                        <span className="text-neutral-300">{table.server}</span>
                                    </div>
                                </div>
                            )}
                            
                            {table.status === "Reserved" && table.server && (
                                <div className="text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Reserved by:</span>
                                        <span className="text-neutral-300">{table.server}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-800">
                                <button
                                    onClick={() => handleOpenModal(table)}
                                    className="flex-1 p-2 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                                >
                                    <Edit className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => handleDelete(table._id)}
                                    className="flex-1 p-2 text-neutral-400 hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-md"
                                >
                                    <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && filteredTables.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-neutral-500 opacity-50" />
                        <p className="text-neutral-500">No tables found.</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <p className="text-neutral-500">Loading tables...</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Table Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <h3 className="text-lg font-medium text-white">{editingTable ? "Edit Table" : "Add Table"}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Table Number</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.tableNumber}
                                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., T1, Table 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Name (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., Window Table, VIP Room"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        placeholder="Number of seats"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Sort Order</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                                        placeholder="Display order"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                    {editingTable ? "Save Changes" : "Add Table"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Status Modal */}
            {isStatusModalOpen && selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Table {selectedTable.tableNumber}</h3>
                                <p className="text-sm text-neutral-400">
                                    {selectedTable.name && `${selectedTable.name} • `}
                                    Capacity: {selectedTable.capacity} • Status: {selectedTable.status}
                                </p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsStatusModalOpen(false)} 
                                className="text-neutral-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-3">
                                {/* Actions based on current status */}
                                {selectedTable.status === "Free" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusAction('newOrder')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            <span className="font-medium">New Order</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusAction('reserve')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <Calendar className="w-5 h-5" />
                                            <span className="font-medium">Reserve</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusAction('markCleaning')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <Home className="w-5 h-5" />
                                            <span className="font-medium">Mark Cleaning</span>
                                        </button>
                                    </>
                                )}
                                
                                {selectedTable.status === "Occupied" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusAction('markFree')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-medium">Mark as Free</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusAction('markCleaning')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <Home className="w-5 h-5" />
                                            <span className="font-medium">Mark Cleaning</span>
                                        </button>
                                    </>
                                )}
                                
                                {selectedTable.status === "Reserved" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusAction('newOrder')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            <span className="font-medium">Start Order</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusAction('markFree')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-medium">Cancel Reservation</span>
                                        </button>
                                    </>
                                )}
                                
                                {selectedTable.status === "Cleaning" && (
                                    <button
                                        onClick={() => handleStatusAction('markFree')}
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Mark as Available</span>
                                    </button>
                                )}
                                
                                <div className="border-t border-neutral-800 pt-3 mt-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleStatusAction('edit')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span className="text-sm font-medium">Edit Table</span>
                                        </button>
                                        <button
                                            onClick={() => handleStatusAction('delete')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTables;
