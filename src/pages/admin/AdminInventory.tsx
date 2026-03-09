import React, { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Package } from "lucide-react";

// Expanded Dummy Data
const inventoryData = [
    { id: 1, name: "Premium Coffee Beans", category: "Beverages", stock: 120, unit: "kg", price: "$24.00", status: "In Stock" },
    { id: 2, name: "Vanilla Syrup", category: "Add-ons", stock: 15, unit: "bottles", price: "$12.50", status: "Low Stock" },
    { id: 3, name: "Croissants", category: "Food", stock: 45, unit: "pcs", price: "$3.50", status: "In Stock" },
    { id: 4, name: "Almond Milk", category: "Dairy Alt", stock: 8, unit: "cartons", price: "$4.00", status: "Low Stock" },
    { id: 5, name: "Espresso Cups", category: "Supplies", stock: 200, unit: "pcs", price: "$1.20", status: "In Stock" },
    { id: 6, name: "Oat Milk", category: "Dairy Alt", stock: 24, unit: "cartons", price: "$4.50", status: "In Stock" },
    { id: 7, name: "Matcha Powder", category: "Beverages", stock: 5, unit: "kg", price: "$45.00", status: "Low Stock" },
    { id: 8, name: "Caramel Syrup", category: "Add-ons", stock: 30, unit: "bottles", price: "$12.50", status: "In Stock" },
];

const AdminInventory = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = inventoryData.filter(item =>
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
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
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
                                                <button className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-md">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredData.length === 0 && (
                            <div className="p-8 text-center text-neutral-500">
                                <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>No inventory items found.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination (Visual Only) */}
                    <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400">
                        <span>Showing 1 to {filteredData.length} of {inventoryData.length} entries</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 bg-neutral-800 rounded-md hover:text-neutral-50 transition-colors">Prev</button>
                            <button className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-md">1</button>
                            <button className="px-3 py-1 bg-neutral-800 rounded-md hover:text-neutral-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminInventory;
