import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { 
    Search, Plus, Filter, Edit, Trash2, Package, X, 
    Link as LinkIcon, DollarSign, Percent, AlertTriangle, PlusCircle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    stock: number;
    unit: string;
    price: string; // e.g. "10.00"
    status: string;
}

interface BOMIngredient {
    inventoryId: string;
    name: string;
    qtyRequired: number;
    unit: string;
    unitPrice: number; // cost per unit from inventory
}

interface BOMRecipe {
    id: string;
    menuItemName: string;
    category: string;
    price: number;
    ingredients: BOMIngredient[];
}

const AdminInventory = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"stock" | "bom">("stock");
    const [searchTerm, setSearchTerm] = useState("");
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Stock level modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({
        name: "", category: "", stock: 0, unit: "", price: "", status: "In Stock"
    });
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

    // Recipe (BOM) states
    const [bomRecipes, setBomRecipes] = useState<BOMRecipe[]>([]);
    const [isBomModalOpen, setIsBomModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<BOMRecipe | null>(null);
    const [recipeForm, setRecipeForm] = useState({
        menuItemName: "",
        category: "Main Course",
        price: 0,
        ingredients: [] as BOMIngredient[]
    });
    // Add ingredient helper
    const [selectedIngId, setSelectedIngId] = useState("");
    const [selectedIngQty, setSelectedIngQty] = useState(1);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

            const req = await fetch(`${apiUrl}/inventory`);
            const invData = await req.json();

            setInventoryItems(invData);
            
            // Seed sample BOM recipes based on inventory items if none exist
            setBomRecipes([
                {
                    id: "r1",
                    menuItemName: "Grilled Chicken",
                    category: "Main Course",
                    price: 30.00,
                    ingredients: [
                        { inventoryId: "ing-1", name: "Almond Milk", qtyRequired: 1, unit: "liters", unitPrice: 4.50 },
                        { inventoryId: "ing-2", name: "Matcha Powder", qtyRequired: 0.1, unit: "kg", unitPrice: 12.00 }
                    ]
                },
                {
                    id: "r2",
                    menuItemName: "Pasta Alfredo",
                    category: "Main Course",
                    price: 25.00,
                    ingredients: [
                        { inventoryId: "ing-1", name: "Almond Milk", qtyRequired: 0.5, unit: "liters", unitPrice: 4.50 },
                        { inventoryId: "ing-3", name: "Caramel Syrup", qtyRequired: 2, unit: "pcs", unitPrice: 1.50 }
                    ]
                },
                {
                    id: "r3",
                    menuItemName: "Espresso Delight",
                    category: "Beverages",
                    price: 15.00,
                    ingredients: [
                        { inventoryId: "ing-5", name: "Espresso Cups", qtyRequired: 1, unit: "pcs", unitPrice: 0.20 },
                        { inventoryId: "ing-3", name: "Caramel Syrup", qtyRequired: 1, unit: "pcs", unitPrice: 1.50 }
                    ]
                }
            ]);

        } catch (err) {
            console.error("Failed to fetch inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Stock Actions
    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: t("inventory.delete_title", "Delete Inventory Item"),
            message: t("inventory.delete_message", "Are you sure you want to delete this inventory item? This action cannot be undone."),
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/inventory/${id}`, { method: "DELETE" });
                    fetchItems();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    toast.success(t("inventory.item_deleted", "Inventory item deleted successfully"));
                } catch (err) {
                    console.error("Failed to delete item:", err);
                    toast.error(t("inventory.delete_failed", "Failed to delete item"));
                }
            }
        });
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

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save inventory item");
            }

            toast.success(editingItem ? t("inventory.item_updated", "Item updated successfully") : t("inventory.item_added", "Item added successfully"));
            setIsModalOpen(false);
            fetchItems();
        } catch (err: any) {
            console.error("Failed to save item:", err);
            toast.error(err.message || t("inventory.save_failed", "Failed to save item"));
        }
    };

    // Recipe BOM Actions
    const handleOpenBomModal = (recipe?: BOMRecipe) => {
        if (recipe) {
            setEditingRecipe(recipe);
            setRecipeForm({
                menuItemName: recipe.menuItemName,
                category: recipe.category,
                price: recipe.price,
                ingredients: [...recipe.ingredients]
            });
        } else {
            setEditingRecipe(null);
            setRecipeForm({
                menuItemName: "",
                category: "Main Course",
                price: 0,
                ingredients: []
            });
        }
        setSelectedIngId("");
        setSelectedIngQty(1);
        setIsBomModalOpen(true);
    };

    const handleAddIngredient = () => {
        if (!selectedIngId) {
            toast.error("Please select an ingredient raw material.");
            return;
        }

        const rawItem = inventoryItems.find(i => i.id === selectedIngId);
        if (!rawItem) return;

        // Check if ingredient already linked
        const exists = recipeForm.ingredients.some(i => i.inventoryId === selectedIngId);
        if (exists) {
            toast.error("This ingredient is already added to the recipe.");
            return;
        }

        const priceNum = parseFloat(rawItem.price) || 0;
        const newIngredient: BOMIngredient = {
            inventoryId: rawItem.id,
            name: rawItem.name,
            qtyRequired: selectedIngQty,
            unit: rawItem.unit,
            unitPrice: priceNum
        };

        setRecipeForm(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient]
        }));
        setSelectedIngId("");
        setSelectedIngQty(1);
    };

    const handleRemoveIngredient = (invId: string) => {
        setRecipeForm(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(i => i.inventoryId !== invId)
        }));
    };

    const handleSaveRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        if (recipeForm.ingredients.length === 0) {
            toast.error("Please link at least one raw ingredient.");
            return;
        }

        if (editingRecipe) {
            // Update
            setBomRecipes(prev => prev.map(r => r.id === editingRecipe.id ? {
                ...r,
                menuItemName: recipeForm.menuItemName,
                category: recipeForm.category,
                price: recipeForm.price,
                ingredients: recipeForm.ingredients
            } : r));
            toast.success("BOM Recipe updated successfully.");
        } else {
            // Create
            const newRecipe: BOMRecipe = {
                id: "r-" + Math.random().toString(36).substr(2, 9),
                menuItemName: recipeForm.menuItemName,
                category: recipeForm.category,
                price: recipeForm.price,
                ingredients: recipeForm.ingredients
            };
            setBomRecipes(prev => [...prev, newRecipe]);
            toast.success("BOM Recipe created successfully.");
        }
        setIsBomModalOpen(false);
    };

    const handleDeleteRecipe = (recipeId: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Recipe (BOM)",
            message: "Are you sure you want to delete this recipe? The menu item will no longer have auto-deduction setup.",
            onConfirm: () => {
                setBomRecipes(prev => prev.filter(r => r.id !== recipeId));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                toast.success("BOM Recipe deleted successfully.");
            }
        });
    };

    const calculateRecipeCost = (ingredients: BOMIngredient[]) => {
        return ingredients.reduce((sum, ing) => sum + (ing.qtyRequired * ing.unitPrice), 0);
    };

    const filteredStockData = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBomData = bomRecipes.filter(r =>
        r.menuItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title={t("dashboard.inventory", "Inventory")}>
            <div className="space-y-6 pb-10">

                {/* Sub-nav Tab Toggle */}
                <div className="flex gap-2.5 p-1.5 bg-neutral-100/50 rounded-[12px] w-fit">
                    <button
                        onClick={() => setActiveTab("stock")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 ${
                            activeTab === "stock"
                                ? "bg-white text-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                        }`}
                    >
                        {t("inventory.stock_levels", "STOCK LEVELS")}
                    </button>
                    <button
                        onClick={() => setActiveTab("bom")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 ${
                            activeTab === "bom"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                        }`}
                    >
                        {t("inventory.recipes_bom", "RECIPES (BOM)")}
                    </button>
                </div>

                {/* Search / Filter Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={
                                activeTab === "stock"
                                    ? t("inventory.search_placeholder", "Search stock raw items...")
                                    : "Search recipe menu items..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[8px] pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 bg-white text-sm font-medium rounded-[8px] hover:bg-neutral-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            {t("inventory.filter", "Filter")}
                        </button>
                        
                        {activeTab === "stock" ? (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-[8px] hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {t("inventory.add_item_btn", "Add Item")}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleOpenBomModal()}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-[8px] hover:brightness-110 transition-all shadow-md shadow-primary/20"
                            >
                                <Plus className="w-4 h-4" />
                                Create BOM Recipe
                            </button>
                        )}
                    </div>
                </div>

                {/* TAB 1: Stock Levels */}
                {activeTab === "stock" && (
                    <div className="bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-neutral-500 bg-neutral-50 uppercase border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">{t("inventory.item_name", "Item Name")}</th>
                                        <th className="px-6 py-4 font-medium">{t("inventory.category", "Category")}</th>
                                        <th className="px-6 py-4 font-medium">{t("inventory.price", "Price")}</th>
                                        <th className="px-6 py-4 font-medium">{t("inventory.stock", "Stock")}</th>
                                        <th className="px-6 py-4 font-medium">{t("inventory.status", "Status")}</th>
                                        <th className="px-6 py-4 font-medium text-right">{t("common.actions", "Actions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStockData.map((item) => (
                                        <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-neutral-900">{item.name}</td>
                                            <td className="px-6 py-4 text-neutral-600">{item.category}</td>
                                            <td className="px-6 py-4 text-neutral-700 font-semibold">৳{item.price}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold">{item.stock}</span> <span className="text-neutral-500 text-xs">{item.unit}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    item.stock > 10
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : item.stock > 0
                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}>
                                                    {item.stock > 10 ? t("inventory.in_stock", "In Stock") : (item.stock > 0 ? t("inventory.low_stock", "Low Stock") : t("inventory.out_of_stock", "Out of Stock"))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenModal(item)} className="p-1.5 text-neutral-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-[8px]">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-[8px]">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!loading && filteredStockData.length === 0 && (
                                <div className="p-8 text-center text-neutral-500">
                                    <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    <p>{t("inventory.no_items_found", "No inventory items found.")}</p>
                                </div>
                            )}
                            {loading && (
                                <div className="p-8 text-center text-neutral-500">
                                    <p>{t("common.loading", "Loading...")}</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination (Visual Only) */}
                        <div className="p-4 border-t border-neutral-200 flex items-center justify-between text-sm text-neutral-600 bg-neutral-50/20">
                            <span>{t("inventory.showing", "Showing")} {filteredStockData.length} {t("inventory.entries", "entries")}</span>
                            <div className="flex gap-1">
                                <button className="px-3 py-1 bg-neutral-100 rounded-[4px] hover:text-neutral-900 transition-colors">{t("inventory.prev", "Prev")}</button>
                                <button className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-[4px]">1</button>
                                <button className="px-3 py-1 bg-neutral-100 rounded-[4px] hover:text-neutral-900 transition-colors">{t("inventory.next", "Next")}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: Recipes BOM (NEW ERP Module) */}
                {activeTab === "bom" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Info Alert */}
                        <div className="lg:col-span-3 bg-indigo-50 border border-indigo-200 rounded-[16px] p-5 flex items-start gap-4">
                            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-[12px]">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-neutral-900">How Bill of Materials (BOM) Auto-deduction Works</h3>
                                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                                    Linking your menu dishes to raw inventory items enables live recipe-cost calculations and margin audits. 
                                    When a cashier or customer places an order via the POS system, the specified raw ingredient quantities 
                                    will be <strong>automatically deducted</strong> from the active stock levels.
                                </p>
                            </div>
                        </div>

                        {/* Recipes List Table */}
                        <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Dish Menu Item</th>
                                            <th className="px-6 py-4 font-semibold">Category</th>
                                            <th className="px-6 py-4 font-semibold text-right">Selling Price</th>
                                            <th className="px-6 py-4 font-semibold text-right">Recipe BOM Cost</th>
                                            <th className="px-6 py-4 font-semibold text-right">Net Profit</th>
                                            <th className="px-6 py-4 font-semibold text-right">Margin</th>
                                            <th className="px-6 py-4 text-center">Auto-Deduct</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {filteredBomData.map((recipe) => {
                                            const totalCost = calculateRecipeCost(recipe.ingredients);
                                            const profit = recipe.price - totalCost;
                                            const margin = recipe.price > 0 ? (profit / recipe.price) * 100 : 0;
                                            return (
                                                <tr key={recipe.id} className="hover:bg-neutral-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-neutral-900">{recipe.menuItemName}</td>
                                                    <td className="px-6 py-4 text-xs text-neutral-500">{recipe.category}</td>
                                                    <td className="px-6 py-4 text-right font-black text-neutral-900">৳{recipe.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-rose-500">৳{totalCost.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-600">৳{profit.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-right font-bold">
                                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-100">
                                                            {margin.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                            Enabled
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleOpenBomModal(recipe)} className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-[8px]">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteRecipe(recipe.id)} className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-[8px]">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredBomData.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-8 text-center text-neutral-400">
                                                    No recipes found. Click "Create BOM Recipe" to configure auto-deduction.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Add/Edit Stock levels */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                            <h3 className="text-lg font-bold text-neutral-900">
                                {editingItem ? t("inventory.edit_item", "Edit Item") : t("inventory.add_item", "Add Item")}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.item_name", "Item Name")}</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.category", "Category")}</label>
                                <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.stock", "Stock")}</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.unit", "Unit")}</label>
                                    <input required type="text" placeholder={t("inventory.unit_placeholder", "e.g. kg, pcs")} value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.price", "Price")}</label>
                                    <input required type="text" placeholder="e.g. 10.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{t("inventory.status", "Status")}</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-[8px] px-3 py-2 text-neutral-900 focus:outline-none focus:border-primary">
                                        <option value="In Stock">{t("inventory.in_stock", "In Stock")}</option>
                                        <option value="Low Stock">{t("inventory.low_stock", "Low Stock")}</option>
                                        <option value="Out of Stock">{t("inventory.out_of_stock", "Out of Stock")}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900">
                                    {t("common.cancel", "Cancel")}
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-[8px] hover:brightness-110">
                                    {editingItem ? t("menu.save_changes", "Save Changes") : t("inventory.add_item_btn", "Add Item")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create/Edit BOM Recipe */}
            {isBomModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">
                                    {editingRecipe ? "Edit BOM Recipe" : "Create BOM Recipe"}
                                </h3>
                                <p className="text-xs text-neutral-400">Configure ingredient mappings and cost parameters.</p>
                            </div>
                            <button onClick={() => setIsBomModalOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveRecipe} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* General details */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Menu Dish Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Double Beef Burger"
                                        value={recipeForm.menuItemName}
                                        onChange={e => setRecipeForm({ ...recipeForm, menuItemName: e.target.value })}
                                        className="w-full bg-white border border-neutral-200 rounded-[8px] px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Category</label>
                                    <select
                                        value={recipeForm.category}
                                        onChange={e => setRecipeForm({ ...recipeForm, category: e.target.value })}
                                        className="w-full bg-white border border-neutral-200 rounded-[8px] px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-primary"
                                    >
                                        <option value="Main Course">Main Course</option>
                                        <option value="Appetizers">Appetizers</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Menu Selling Price (৳)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={recipeForm.price || ""}
                                        onChange={e => setRecipeForm({ ...recipeForm, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-white border border-neutral-200 rounded-[8px] px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Linked Ingredients List */}
                            <div className="border-t border-neutral-100 pt-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Recipe Composition</h4>
                                
                                <div className="bg-neutral-50/50 border border-neutral-200/60 rounded-[12px] p-4 space-y-3.5">
                                    {recipeForm.ingredients.length === 0 ? (
                                        <p className="text-xs text-neutral-400 text-center py-4">No raw materials linked yet. Configure composition below.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {recipeForm.ingredients.map(ing => (
                                                <div key={ing.inventoryId} className="flex items-center justify-between text-xs p-2.5 bg-white border border-neutral-100 rounded-[8px]">
                                                    <div>
                                                        <p className="font-bold text-neutral-800">{ing.name}</p>
                                                        <p className="text-[10px] text-neutral-400">Required: {ing.qtyRequired} {ing.unit} (Cost: ৳{(ing.qtyRequired * ing.unitPrice).toFixed(2)})</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveIngredient(ing.inventoryId)}
                                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-[4px]"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs font-bold pt-2 border-t text-neutral-700">
                                                <span>Total Cost of Materials:</span>
                                                <span className="text-rose-500">৳{calculateRecipeCost(recipeForm.ingredients).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Ingredient form section */}
                            <div className="border-t border-neutral-100 pt-4 space-y-3">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Link Raw Materials Ingredient</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <select
                                            value={selectedIngId}
                                            onChange={e => setSelectedIngId(e.target.value)}
                                            className="w-full bg-white border border-neutral-200 rounded-[8px] px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-primary"
                                        >
                                            <option value="">-- Select raw item --</option>
                                            {inventoryItems.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} ({item.unit}) - ৳{item.price}/{item.unit}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-28">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Qty"
                                            value={selectedIngQty || ""}
                                            onChange={e => setSelectedIngQty(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-white border border-neutral-200 rounded-[8px] px-3.5 py-2 text-sm text-neutral-900 focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddIngredient}
                                        className="py-2 px-4 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-[8px] border border-indigo-100 flex items-center justify-center gap-1.5 hover:bg-indigo-100"
                                    >
                                        <PlusCircle className="w-4 h-4" /> Link
                                    </button>
                                </div>
                            </div>

                            {/* Form submit */}
                            <div className="pt-6 flex justify-end gap-3 border-t border-neutral-100">
                                <button type="button" onClick={() => setIsBomModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-[8px] hover:brightness-110">
                                    Save Recipe Config
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl overflow-hidden p-6 border border-neutral-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-[12px] transition-all"
                                >
                                    {t("common.cancel", "Cancel")}
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-[12px] transition-all shadow-lg"
                                >
                                    {t("common.delete", "Delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminInventory;
