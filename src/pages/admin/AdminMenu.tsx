import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Edit, Trash2, List, X, Upload, Image as ImageIcon, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
    _id: string;
    id: number;
    title: string;
    price: string;
    category: string;
    description: string;
    image: string;
    sku?: string;
    discountPrice?: string;
    taxIncluded?: boolean;
    available?: boolean;
}

const AdminMenu = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<{ _id?: string, name: string, order: number }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        title: "", price: "", category: "", description: "", sku: "", discountPrice: "", taxIncluded: false, available: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Category management states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({ name: "", order: 0 });
    const [editingCategory, setEditingCategory] = useState<{ _id?: string, name: string, order: number } | null>(null);
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

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const [menuRes, catRes] = await Promise.all([
                fetch(`${apiUrl}/menu`),
                fetch(`${apiUrl}/categories`)
            ]);

            const menuItemsData = await menuRes.json();
            const categoriesData = await catRes.json();
            
            setMenuItems(menuItemsData);
            
            // Get categories from items that are not in the categories collection
            const itemCategories = Array.from(new Set(menuItemsData.map((m: any) => m.category))).filter(Boolean) as string[];
            const existingCategoryNames = categoriesData.map((c: any) => c.name);
            
            const mergedCategories = [...categoriesData];
            itemCategories.forEach(catName => {
                if (!existingCategoryNames.includes(catName)) {
                    mergedCategories.push({ name: catName, order: mergedCategories.length + 1 });
                }
            });
            
            setCategories(mergedCategories);
        } catch (err) {
            console.error("Failed to fetch menu or categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Menu Item",
            message: "Are you sure you want to delete this menu item? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/menu/${id}`, { method: "DELETE" });
                    fetchData();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    toast.success("Menu item deleted successfully");
                } catch (err) {
                    console.error("Failed to delete menu item:", err);
                    toast.error("Failed to delete menu item");
                }
            }
        });
    };

    // Category management functions
    const handleOpenCategoryModal = (category?: { _id?: string, name: string, order: number }) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormData({ name: category.name, order: category.order });
        } else {
            setEditingCategory(null);
            setCategoryFormData({ name: "", order: categories.length + 1 });
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            const response = await fetch(editingCategory ? `${apiUrl}/categories/${editingCategory._id}` : `${apiUrl}/categories`, {
                method: editingCategory ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoryFormData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save category");
            }
            
            toast.success(editingCategory ? "Category updated successfully" : "Category added successfully");
            setIsCategoryModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error("Failed to save category:", err);
            toast.error(err.message || "Failed to save category");
        }
    };

    const handleDeleteCategory = (id?: string) => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            title: "Delete Category",
            message: "Are you sure you want to delete this category? All items in this category will be affected.",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/categories/${id}`, { method: "DELETE" });
                    fetchData();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    toast.success("Category deleted successfully");
                } catch (err) {
                    console.error("Failed to delete category:", err);
                    toast.error("Failed to delete category");
                }
            }
        });
    };

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title, price: item.price,
                category: item.category, description: item.description || "",
                sku: item.sku || "", discountPrice: item.discountPrice || "",
                taxIncluded: item.taxIncluded || false, available: item.available ?? true
            });
        } else {
            setEditingItem(null);
            setFormData({ title: "", price: "", category: "", description: "", sku: "", discountPrice: "", taxIncluded: false, available: true });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const data = new FormData();
            data.append("title", formData.title);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("description", formData.description);
            data.append("sku", formData.sku);
            data.append("discountPrice", formData.discountPrice);
            data.append("taxIncluded", String(formData.taxIncluded));
            data.append("available", String(formData.available));
            if (imageFile) {
                data.append("image", imageFile);
            }

            const url = editingItem ? `${apiUrl}/menu/${editingItem._id}` : `${apiUrl}/menu`;
            const method = editingItem ? "PUT" : "POST";

            const response = await fetch(url, { method, body: data });
            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.message || "Failed to save menu item");
            }

            toast.success(editingItem ? "Menu item updated successfully" : "Menu item added successfully");
            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error("Failed to save menu item:", err);
            toast.error(err.message || "Failed to save menu item");
        }
    };

    const filteredData = menuItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="Menu Management">
            <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
                {/* Categories Sidebar */}
                <div className="w-full lg:w-80 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-neutral-900">Categories</h2>
                        </div>
                        <button
                            onClick={() => handleOpenCategoryModal()}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div
                            onClick={() => setSelectedCategory("All")}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                selectedCategory === "All"
                                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                                    : "bg-neutral-50 border border-neutral-100 text-neutral-700 hover:bg-neutral-100"
                            }`}
                        >
                            <span className="font-medium text-sm">All Items</span>
                        </div>
                        
                        {categories.filter(c => c.name !== "All").sort((a, b) => a.order - b.order).map((category) => {
                            return (
                                <div key={category.name} 
                                    className={`w-full px-4 py-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                                        selectedCategory === category.name
                                            ? "bg-blue-50 border border-blue-200 text-blue-700"
                                            : "bg-neutral-50 border border-neutral-100 text-neutral-700 hover:bg-neutral-100"
                                    }`}
                                    onClick={() => setSelectedCategory(category.name)}
                                >
                                    <span className="font-medium text-sm">{category.name}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(category); }}
                                            className="text-neutral-500 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); }}
                                            className="text-neutral-500 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-rose-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Menu Items Section */}
                <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm w-full">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-neutral-900">Menu Items</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="relative w-full mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-neutral-300 text-neutral-900 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-400"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-neutral-500 bg-transparent border-b border-neutral-200">
                                <tr>
                                    <th className="px-2 py-4 font-medium">Name</th>
                                    <th className="px-4 py-4 font-medium">Category</th>
                                    <th className="px-4 py-4 font-medium">Price</th>
                                    <th className="px-4 py-4 font-medium">Available</th>
                                    <th className="px-2 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item._id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-2 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-neutral-900">{item.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-600">{item.category}</td>
                                        <td className="px-4 py-4 text-neutral-900 font-medium">
                                            <span className="text-emerald-600">{item.price}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white">
                                                Yes
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors rounded-md">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-rose-500 hover:bg-rose-50 transition-colors rounded-md">
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
                                <List className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p>No menu items found.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="p-8 text-center text-neutral-500">
                                <p>Loading menu...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden my-auto border-none">
                        <div className="flex items-center justify-between px-8 py-6">
                            <h3 className="text-[1.35rem] font-medium text-neutral-900 tracking-tight">{editingItem ? "Edit Menu Item" : "Add New Item"}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="px-8 pb-8 space-y-6">
                            <div>
                                <input required type="text" placeholder="Name *" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white border border-neutral-400 rounded-3xl px-5 py-3.5 text-neutral-900 focus:outline-none focus:border-blue-500 placeholder:text-neutral-800 font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <input type="text" placeholder="SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-white border border-neutral-400 rounded-3xl px-5 py-3.5 text-neutral-900 focus:outline-none focus:border-blue-500 placeholder:text-neutral-800 font-medium" />
                                </div>
                                <div className="relative">
                                    <label className="absolute -top-2 left-4 bg-white px-1.5 text-xs font-semibold text-neutral-700 tracking-wide">Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-neutral-400 rounded-3xl px-5 py-3.5 text-neutral-900 focus:outline-none focus:border-blue-500 appearance-none font-medium">
                                        <option value="" disabled>None</option>
                                        {categories.filter(c => c.name !== "All").map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <input required type="text" placeholder="Price *" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white border border-neutral-400 rounded-3xl px-5 py-3.5 text-neutral-900 focus:outline-none focus:border-blue-500 placeholder:text-neutral-800 font-medium" />
                                </div>
                                <div>
                                    <input type="text" placeholder="Discount Price" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full bg-white border border-neutral-400 rounded-3xl px-5 py-3.5 text-neutral-900 focus:outline-none focus:border-blue-500 placeholder:text-neutral-800 font-medium" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 tracking-wide mb-2">Description</label>
                                <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#f8f9fa] border border-neutral-200 rounded-3xl px-5 py-4 text-neutral-900 focus:outline-none focus:border-blue-500 resize-none font-medium" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 tracking-wide mb-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Image (Optional)
                                </label>
                                <div className="relative w-full border border-neutral-400 rounded-3xl p-1.5 flex items-center bg-[#f8f9fa] overflow-hidden">
                                    <button type="button" onClick={() => document.getElementById('imageUpload')?.click()} className="px-6 py-2.5 bg-[#1a73e8] text-white font-medium rounded-full text-sm hover:bg-blue-700 transition-colors shrink-0">
                                        Choose File
                                    </button>
                                    <span className="px-4 text-sm text-neutral-700 truncate font-medium">
                                        {imageFile ? imageFile.name : "No file chosen"}
                                    </span>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                                        }}
                                        className="hidden"
                                        required={!editingItem}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-8 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formData.taxIncluded} onChange={e => setFormData({ ...formData, taxIncluded: e.target.checked })} className="w-5 h-5 border-neutral-400 rounded text-blue-600 focus:ring-blue-500 bg-white" />
                                    <span className="text-sm font-medium text-neutral-800">Tax Included</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 border-neutral-400 rounded text-[#0e8388] focus:ring-[#0e8388] bg-white accent-[#0e8388]" />
                                    <span className="text-sm font-medium text-neutral-800">Available</span>
                                </label>
                            </div>
                            <div className="pt-8 flex justify-end gap-4 mt-2 border-t border-transparent">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-white border border-[#1a73e8] text-[#1a73e8] font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-sm">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-[#1a73e8] text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                                    {editingItem ? "Update Item" : "Save Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                            <h3 className="text-lg font-medium text-neutral-900">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-600 mb-1">Category Name</label>
                                <input required type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-600 mb-1">Display Order</label>
                                <input required type="number" value={categoryFormData.order} onChange={e => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) })} className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                    {editingCategory ? "Save Changes" : "Add Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

export default AdminMenu;
