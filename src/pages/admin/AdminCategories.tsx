import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit, Trash2, Tag, X } from "lucide-react";

interface Category {
    _id: string; // From mongoose
    id?: string;
    name: string;
    order: number;
}

const AdminCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", order: 0 });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/categories`);
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/categories/${id}`, { method: "DELETE" });
            fetchCategories();
        } catch (err) {
            console.error("Failed to delete category:", err);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, order: category.order });
        } else {
            setEditingCategory(null);
            setFormData({ name: "", order: (categories.length || 0) + 1 });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingCategory ? "PUT" : "POST";
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const url = editingCategory
                ? `${apiUrl}/categories/${editingCategory._id}`
                : `${apiUrl}/categories`;

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            console.error("Failed to save category:", err);
        }
    };

    return (
        <AdminLayout title="Categories">
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order</th>
                                    <th className="px-6 py-4 font-medium">Category Name</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 text-neutral-400">{cat.order}</td>
                                        <td className="px-6 py-4 font-medium text-neutral-100">{cat.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-md">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && categories.length === 0 && (
                            <div className="p-8 text-center text-neutral-500">
                                <Tag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>No categories found.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="p-8 text-center text-neutral-500">
                                <p>Loading categories...</p>
                            </div>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                                <h3 className="text-lg font-medium text-white">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Display Order</label>
                                    <input required type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">{editingCategory ? "Save Changes" : "Add Category"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
