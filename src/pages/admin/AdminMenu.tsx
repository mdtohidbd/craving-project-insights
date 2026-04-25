import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Edit, Trash2, List, X, Upload, Image as ImageIcon, FolderOpen } from "lucide-react";

interface MenuItem {
    _id: string;
    id: number;
    title: string;
    price: string;
    category: string;
    description: string;
    image: string;
}

const AdminMenu = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<{ name: string, order: number }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        title: "", price: "", category: "", description: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Category management states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({ name: "", order: 0 });
    const [editingCategory, setEditingCategory] = useState<{ name: string, order: number } | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const [menuRes, catRes] = await Promise.all([
                fetch(`${apiUrl}/menu`),
                fetch(`${apiUrl}/categories`)
            ]);

            setMenuItems(await menuRes.json());
            setCategories(await catRes.json());
        } catch (err) {
            console.error("Failed to fetch menu or categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this menu item?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/menu/${id}`, { method: "DELETE" });
            fetchData();
        } catch (err) {
            console.error("Failed to delete menu item:", err);
        }
    };

    // Category management functions
    const handleOpenCategoryModal = (category?: { name: string, order: number }) => {
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
            
            if (editingCategory) {
                await fetch(`${apiUrl}/categories/${editingCategory.name}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(categoryFormData)
                });
            } else {
                await fetch(`${apiUrl}/categories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(categoryFormData)
                });
            }
            
            setIsCategoryModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save category:", err);
        }
    };

    const handleDeleteCategory = async (name: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/categories/${name}`, { method: "DELETE" });
            fetchData();
        } catch (err) {
            console.error("Failed to delete category:", err);
        }
    };

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title, price: item.price,
                category: item.category, description: item.description || ""
            });
        } else {
            setEditingItem(null);
            setFormData({ title: "", price: "", category: "", description: "" });
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
            if (imageFile) {
                data.append("image", imageFile);
            }

            const url = editingItem ? `${apiUrl}/menu/${editingItem._id}` : `${apiUrl}/menu`;
            const method = editingItem ? "PUT" : "POST";

            await fetch(url, { method, body: data });
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to save menu item:", err);
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
            <div className="flex gap-6 h-full">
                {/* Categories Sidebar */}
                <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Categories</h2>
                        <button
                            onClick={() => handleOpenCategoryModal()}
                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                                selectedCategory === "All"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                            }`}
                        >
                            <FolderOpen className="w-4 h-4" />
                            <span>All Items</span>
                            <span className="ml-auto text-sm opacity-75">{menuItems.length}</span>
                        </button>
                        
                        {categories.filter(c => c.name !== "All").sort((a, b) => a.order - b.order).map((category) => {
                            const itemCount = menuItems.filter(item => item.category === category.name).length;
                            return (
                                <div key={category.name} className="group">
                                    <button
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                                            selectedCategory === category.name
                                                ? "bg-primary text-primary-foreground"
                                                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                        }`}
                                    >
                                        <FolderOpen className="w-4 h-4" />
                                        <span>{category.name}</span>
                                        <span className="ml-auto text-sm opacity-75">{itemCount}</span>
                                    </button>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto mt-1">
                                        <button
                                            onClick={() => handleOpenCategoryModal(category)}
                                            className="p-1 text-neutral-400 hover:text-primary transition-colors"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.name)}
                                            className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Menu Items Section */}
                <div className="flex-1">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
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
                                Add Item
                            </button>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Name</th>
                                            <th className="px-6 py-4 font-medium">Category</th>
                                            <th className="px-6 py-4 font-medium">Price</th>
                                            <th className="px-6 py-4 font-medium">Available</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item) => (
                                            <tr key={item._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-4 font-medium text-neutral-100">{item.title}</td>
                                                <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                                                <td className="px-6 py-4 text-neutral-300">{item.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                                                        Available
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors hover:bg-rose-400/10 rounded-md">
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
                </div>
            </div>

            {/* Menu Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <h3 className="text-lg font-medium text-white">{editingItem ? "Edit Menu Item" : "Add Menu Item"}</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Price</label>
                                    <input required type="text" placeholder="e.g. $10.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary appearance-none">
                                        <option value="" disabled>Select Category</option>
                                        {categories.filter(c => c.name !== "All").map(c => (
                                            <option key={c.name} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Image Upload</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                                    }}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                                    required={!editingItem}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                    {editingItem ? "Save Changes" : "Add Menu Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden my-auto">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <h3 className="text-lg font-medium text-white">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Category Name</label>
                                <input required type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Display Order</label>
                                <input required type="number" value={categoryFormData.order} onChange={e => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                    {editingCategory ? "Save Changes" : "Add Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminMenu;
