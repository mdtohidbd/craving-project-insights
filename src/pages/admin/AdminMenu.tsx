import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Edit, Trash2, List, X, Upload, Image as ImageIcon } from "lucide-react";

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
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        title: "", price: "", category: "", description: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

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

    const filteredData = menuItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Menu Management">
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
                        Add Menu Item
                    </button>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Image</th>
                                    <th className="px-6 py-4 font-medium">Title</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Price</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            {item.image ? (
                                                <img src={item.image.startsWith('http') ? item.image : ''} alt={item.title} className="w-10 h-10 rounded object-cover border border-neutral-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-100">{item.title}</td>
                                        <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                                        <td className="px-6 py-4 text-neutral-300">{item.price}</td>
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
            </div>
        </AdminLayout>
    );
};

export default AdminMenu;
