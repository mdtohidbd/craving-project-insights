interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    price: string;
    status: string;
}

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Filter, Edit, Trash2, Package, X } from "lucide-react";

const AdminInventory = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({
        name: "", category: "", stock: 0, unit: "", price: "", status: "In Stock"
    });

    const fetchItems = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const req = await fetch(`${apiUrl}/inventory`);
            const invData = await req.json();

            setInventoryItems(invData);
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/inventory/${id}`, { method: "DELETE" });
            fetchItems();
        } catch (err) {
            console.error("Failed to delete item:", err);
        }
    };

    const handleOpenModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name, category: item.category, stock: item.stock,
                unit: item.unit, price: item.price, status: item.status
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: "", category: "", stock: 0, unit: "", price: "", status: "In Stock"
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? "PUT" : "POST";
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const url = editingItem
                ? `${apiUrl}/inventory/${editingItem.id}`
                : `${apiUrl}/inventory`;

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchItems();
        } catch (err) {
            console.error("Failed to save item:", err);
        }
    };

    const filteredData = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Inventory">
            <div className="space-y-6">

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search items or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-500"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-neutral-800 bg-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Item Name</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Price</th>
                                    <th className="px-6 py-4 font-medium">Stock</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-neutral-100">{item.name}</td>
                                        <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                                        <td className="px-6 py-4 text-neutral-300">{item.price}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{item.stock}</span> <span className="text-neutral-500 text-xs">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'In Stock'
                                                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                                : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(item)} className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-md">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!loading && filteredData.length === 0 && (
                            <div className="p-8 text-center text-neutral-500">
                                <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>No inventory items found.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="p-8 text-center text-neutral-500">
                                <p>Loading inventory...</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination (Visual Only) */}
                    <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400">
                        <span>Showing {filteredData.length} entries</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 bg-neutral-800 rounded-md hover:text-neutral-50 transition-colors">Prev</button>
                            <button className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-md">1</button>
                            <button className="px-3 py-1 bg-neutral-800 rounded-md hover:text-neutral-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                                <h3 className="text-lg font-medium text-white">
                                    {editingItem ? "Edit Item" : "Add Item"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Item Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                                    <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Stock</label>
                                        <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Unit</label>
                                        <input required type="text" placeholder="e.g. kg, pcs" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Price</label>
                                        <input required type="text" placeholder="e.g. $10.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary appearance-none">
                                            <option value="In Stock">In Stock</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                        {editingItem ? "Save Changes" : "Add Item"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </AdminLayout >
    );
};

export default AdminInventory;
