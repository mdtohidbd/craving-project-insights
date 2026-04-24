import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Minus, Trash2, CreditCard, ShoppingBag, Utensils, Receipt } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
    _id: string;
    id: number;
    title: string;
    price: string | number;
    category: string;
    image: string;
}

interface CartItem {
    menuItem: MenuItem;
    quantity: number;
}

const AdminPOS = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<{ name: string, order: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState("Walk-in Customer");
    const [orderType, setOrderType] = useState("Dine-in"); // Dine-in, Takeaway

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setIsLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const [menuRes, catRes] = await Promise.all([
                    fetch(`${apiUrl}/menu`),
                    fetch(`${apiUrl}/categories`)
                ]);
                
                if (menuRes.ok && catRes.ok) {
                    setMenuItems(await menuRes.ok ? await menuRes.json() : []);
                    const fetchedCats = await catRes.ok ? await catRes.json() : [];
                    // Ensure "All" is at the beginning if not present
                    if (!fetchedCats.some((c: any) => c.name === "All")) {
                        fetchedCats.unshift({ name: "All", order: 0 });
                    }
                    setCategories(fetchedCats);
                }
            } catch (err) {
                console.error("Failed to fetch POS data:", err);
                toast.error("Failed to load menu items");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMenuData();
    }, []);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.menuItem._id === item._id);
            if (existing) {
                return prev.map(c => 
                    c.menuItem._id === item._id 
                    ? { ...c, quantity: c.quantity + 1 } 
                    : c
                );
            }
            return [...prev, { menuItem: item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(c => {
                if (c.menuItem._id === itemId) {
                    const newQ = c.quantity + delta;
                    return newQ > 0 ? { ...c, quantity: newQ } : c;
                }
                return c;
            });
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(c => c.menuItem._id !== itemId));
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (confirm("Clear current ticket?")) {
            setCart([]);
            setCustomerName("Walk-in Customer");
            setOrderType("Dine-in");
        }
    };

    const subtotal = cart.reduce((acc, curr) => {
        const price = typeof curr.menuItem.price === 'string' 
            ? parseFloat(curr.menuItem.price.replace(/[^0-9.]/g, '')) 
            : Number(curr.menuItem.price);
        return acc + (price || 0) * curr.quantity;
    }, 0);
    
    // Configurable tax/fees can go here. Assuming 0 for now based on existing checkout.
    const total = subtotal; 

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        try {
            setIsProcessing(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            const orderData = {
                customerInfo: {
                    name: customerName,
                    phone: "N/A",
                    address: `POS - ${orderType}`,
                    notes: "In-store order"
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: typeof c.menuItem.price === 'string' ? parseFloat(c.menuItem.price.replace(/[^0-9.]/g, '')) : Number(c.menuItem.price),
                    quantity: c.quantity
                })),
                subtotal,
                tax: 0,
                total,
                status: "completed", // POS orders are typically completed instantly or put to 'preparing'
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                toast.success("Order processed successfully!");
                setCart([]);
                setCustomerName("Walk-in Customer");
            } else {
                toast.error("Failed to process order");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            toast.error("An error occurred during checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="POS System">
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
                
                {/* Left Side: Menu Grid */}
                <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Top Bar / Filters */}
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-neutral-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 custom-scrollbar hide-scroll-bar">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedCategory === cat.name
                                            ? 'bg-amber-500 text-amber-950'
                                            : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Items Grid */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                <Utensils className="w-12 h-12 mb-4 opacity-50" />
                                <p>No items found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map(item => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => addToCart(item)}
                                        className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all group flex flex-col h-full"
                                    >
                                        <div className="h-24 sm:h-32 bg-neutral-800 overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image.startsWith('http') ? item.image : ''} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                    <Utensils className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1 justify-between">
                                            <div>
                                                <h4 className="font-medium text-sm text-neutral-200 line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                                <span className="text-xs text-neutral-500 block truncate">{item.category}</span>
                                            </div>
                                            <div className="mt-2 text-amber-400 font-semibold text-sm">
                                                ৳{typeof item.price === 'string' ? item.price.replace(/[^0-9.]/g, '') : item.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Ticket / Cart */}
                <div className="w-full lg:w-96 flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-amber-500" />
                            Current Ticket
                        </h2>
                        <button 
                            onClick={clearCart}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-400/10 rounded-md transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Order Details Form */}
                    <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 space-y-3">
                        <input 
                            type="text" 
                            placeholder="Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setOrderType("Dine-in")}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border ${orderType === 'Dine-in' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'}`}
                            >
                                Dine-in
                            </button>
                            <button 
                                onClick={() => setOrderType("Takeaway")}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors border ${orderType === 'Takeaway' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'}`}
                            >
                                Takeaway
                            </button>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">Ticket is empty</p>
                                <p className="text-xs mt-1">Select items from the menu</p>
                            </div>
                        ) : (
                            cart.map(c => {
                                const priceVal = typeof c.menuItem.price === 'string' ? parseFloat(c.menuItem.price.replace(/[^0-9.]/g, '')) : Number(c.menuItem.price);
                                return (
                                    <div key={c.menuItem._id} className="flex gap-3 bg-neutral-950 border border-neutral-800 p-3 rounded-xl group">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-neutral-200 line-clamp-1">{c.menuItem.title}</h4>
                                            <div className="text-xs text-neutral-500 mt-0.5">৳{priceVal} each</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-sm font-semibold text-amber-400">৳{priceVal * c.quantity}</div>
                                            <div className="flex items-center gap-2 bg-neutral-900 rounded-md p-1 border border-neutral-800">
                                                <button onClick={() => updateQuantity(c.menuItem._id, -1)} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-medium w-4 text-center">{c.quantity}</span>
                                                <button onClick={() => updateQuantity(c.menuItem._id, 1)} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeFromCart(c.menuItem._id)} className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded text-neutral-500 transition-colors ml-1">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Checkout Section */}
                    <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-neutral-400">
                                <span>Subtotal</span>
                                <span>৳{subtotal}</span>
                            </div>
                            {/* Can add tax, discount here if needed */}
                            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-neutral-800">
                                <span>Total</span>
                                <span className="text-amber-500">৳{total}</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-amber-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20 disabled:shadow-none"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Process Order
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
            
            <style>{`
                .hide-scroll-bar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scroll-bar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminPOS;
