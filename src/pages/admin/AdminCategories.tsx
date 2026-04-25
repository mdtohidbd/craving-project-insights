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

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Category",
            message: "Are you sure you want to delete this category? This action cannot be undone.",
            onConfirm: async () => {
                // Validate MongoDB ObjectId format
                const objectIdRegex = /^[0-9a-fA-F]{24}$/;
                if (!objectIdRegex.test(id)) {
                    toast.error("Invalid category ID. Cannot delete category.");
                    console.error("Invalid ObjectId:", id);
                    return;
                }
                
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    const res = await fetch(`${apiUrl}/categories/${id}`, { method: "DELETE" });
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || "Failed to delete category");
                    }
                    fetchCategories();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    toast.success("Category deleted successfully");
                } catch (err) {
                    console.error("Failed to delete category:", err);
                    toast.error("Failed to delete category. Please try again.");
                }
            }
        });
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

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save category");
            }

            toast.success(editingCategory ? "Category updated successfully" : "Category added successfully");
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            console.error("Failed to save category:", err);
            toast.error(err.message || "Failed to save category");
        }
    };

    return (
        <AdminLayout title="Categories">
            <div className="max-w-md mx-auto">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-900">Categories</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>

                    {/* Categories List */}
                    <div className="divide-y divide-neutral-200">
                        {loading ? (
                            <div className="p-8 text-center text-neutral-500">
                                <p>Loading categories...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500">
                                <Tag className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>No categories found.</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat._id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
                                    <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenModal(cat)}
                                            className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-md"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                                <h3 className="text-lg font-medium text-neutral-900">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-600 mb-1">Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-600 mb-1">Display Order</label>
                                    <input required type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">{editingCategory ? "Save Changes" : "Add Category"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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

export default AdminCategories;
