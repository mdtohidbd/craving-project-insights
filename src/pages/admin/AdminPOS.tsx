import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Minus, Trash2, Printer, Divide, Clock, X, Utensils, ChevronDown, ChevronUp, UserPlus, Info, Banknote, CreditCard, Smartphone, BadgePercent, Scissors, DollarSign, Sparkles, Split, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
    _id: string;
    id: number;
    title: string;
    price: string | number;
    originalPrice?: string | number;
    category: string;
    image: string;
    addOns?: { name: string; price: number }[];
}

interface CartItem {
    id?: string;
    menuItem: MenuItem;
    quantity: number;
    addOns?: { name: string; price: number }[];
}

interface OrderItem {
    menuItemId: string;
    title: string;
    price: number;
    quantity: number;
    addOns?: { name: string; price: number }[];
}

interface Table {
    _id: string;
    tableNumber: string;
    name?: string;
    capacity: number;
    status: string;
    currentOrder?: string;
}

interface Order {
    _id: string;
    customerInfo: {
        name: string;
        phone: string;
        address: string;
        notes?: string;
    };
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    isHeld?: boolean;
    heldAt?: string;
    tableNumber?: string;
    tableId?: string;
    orderType?: 'dine-in' | 'takeaway' | 'online';
    isBillPrinted?: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface CustomerType {
    _id: string;
    name: string;
    phone: string;
    address: string;
}

const AdminPOS = () => {
    const { settings } = useSettings();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<{ name: string, order: number }[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTable, setSelectedTable] = useState("Takeaway");
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState("Walk-in");
    const [vatRate, setVatRate] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Payment modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card' | 'MFS'>('Cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [changeAmount, setChangeAmount] = useState(0);

    // Split payment states
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitPayments, setSplitPayments] = useState<{ method: string; amount: number }[]>([]);
    const [currentSplitMethod, setCurrentSplitMethod] = useState('Cash');
    const [currentSplitAmount, setCurrentSplitAmount] = useState<string>('');

    // Held orders state
    const [heldOrders, setHeldOrders] = useState<Order[]>([]);
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
    const [servedOrders, setServedOrders] = useState<Order[]>([]);
    const [showServedOrdersModal, setShowServedOrdersModal] = useState(false);

    // Mobile drawer state
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // AddOn Modal state
    const [showAddOnModal, setShowAddOnModal] = useState(false);
    const [selectedItemForAddOn, setSelectedItemForAddOn] = useState<MenuItem | null>(null);
    const [selectedAddOns, setSelectedAddOns] = useState<{name: string, price: number}[]>([]);

    // Print preview states
    const [showKOTPreview, setShowKOTPreview] = useState(false);
    const [showBillPreview, setShowBillPreview] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState<string>('');
    const [lastOrderDetails, setLastOrderDetails] = useState<{
        items: CartItem[];
        subtotal: number;
        vatAmount: number;
        total: number;
        paymentMethods: { method: string; amount: number }[];
        orderId: string;
        date: string;
        table: string;
        customer: string;
    } | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string>("");
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'online'>('dine-in');

    const getPrice = (item: MenuItem) => {
        return typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : Number(item.price);
    };

    const getOriginalPrice = (item: MenuItem) => {
        if (item.originalPrice) {
            return typeof item.originalPrice === 'string' ? parseFloat(item.originalPrice.replace(/[^0-9.]/g, '')) : Number(item.originalPrice);
        }
        return null;
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [menuRes, catRes, tableRes, customerRes] = await Promise.all([
                    fetch(`${apiUrl}/menu`),
                    fetch(`${apiUrl}/categories`),
                    fetch(`${apiUrl}/tables`),
                    fetch(`${apiUrl}/customers`)
                ]);
                let parsedMenuData: any[] = [];
                if (menuRes.ok) {
                    parsedMenuData = await menuRes.json();
                    setMenuItems(parsedMenuData);
                }
                if (catRes.ok) {
                    const fetchedCats = await catRes.json();
                    const menuData = parsedMenuData;

                    // Extract categories from menu items
                    const itemCats = Array.from(new Set(menuData.map((m: any) => m.category))).filter(Boolean) as string[];
                    const existingNames = fetchedCats.map((c: any) => c.name);

                    const mergedCats = [...fetchedCats];
                    itemCats.forEach(catName => {
                        if (!existingNames.includes(catName)) {
                            mergedCats.push({ name: catName, order: mergedCats.length + 1 });
                        }
                    });

                    if (!mergedCats.some((c: any) => c.name === "All")) {
                        mergedCats.unshift({ name: "All", order: 0 });
                    }
                    setCategories(mergedCats);
                }
                if (tableRes.ok) {
                    const fetchedTables = await tableRes.json();
                    setTables(fetchedTables);

                    // Handle table query param
                    const params = new URLSearchParams(window.location.search);
                    const tableId = params.get('table');
                    if (tableId) {
                        const table = fetchedTables.find((t: any) => t._id === tableId || t.tableNumber === tableId);
                        if (table) {
                            setSelectedTable(table.tableNumber);
                            setSelectedTableId(table._id);
                            
                            if (table.status !== 'Free' && table.currentOrder) {
                                try {
                                    const orderRes = await fetch(`${apiUrl}/orders/${table.currentOrder}`);
                                    if (orderRes.ok) {
                                        const order = await orderRes.json();
                                        const existingCart: CartItem[] = order.items.map((item: any) => {
                                            const menuItem = parsedMenuData.find(m => m._id === item.menuItemId);
                                            // Fallback to item data if menuItem not found in current list
                                            const finalMenuItem = menuItem || {
                                                _id: item.menuItemId,
                                                id: 0,
                                                title: item.title,
                                                price: item.price,
                                                category: "Restored",
                                                imageUrls: []
                                            };
                                            return { 
                                                id: item.menuItemId,
                                                menuItem: finalMenuItem, 
                                                quantity: item.quantity,
                                                addOns: item.addOns || []
                                            };
                                        });

                                        setCart(existingCart);
                                        setCurrentOrderId(order._id);
                                        setSelectedTable(order.tableNumber || "Takeaway");
                                        setSelectedTableId(order.tableId || null);
                                        setSelectedCustomer(order.customerInfo.name || "Walk-in");
                                        setDiscount(order.discount || 0);
                                        setOrderType(order.orderType === 'dine-in' ? 'dine-in' : 'takeaway');
                                        toast.info(`Loaded existing order for Table ${table.tableNumber}`);

                                        // Auto-open payment modal if requested
                                        if (params.get('checkout') === 'true') {
                                            const orderTotal = order.total || 0;
                                            setAmountReceived(orderTotal.toString());
                                            setTimeout(() => setShowPaymentModal(true), 800);
                                        }
                                    }
                                } catch (orderErr) {
                                    console.error("Failed to load existing order:", orderErr);
                                }
                            }
                        }
                    }
                }
                if (customerRes.ok) {
                    setCustomers(await customerRes.json());
                }
            } catch (err) {
                console.error("Failed to fetch POS data:", err);
                toast.error("Failed to load data: " + (err instanceof Error ? err.message : "Unknown error"));
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Update order type based on table selection
    useEffect(() => {
        if (selectedTable === "Takeaway") {
            setOrderType('takeaway');
        } else {
            setOrderType('dine-in');
        }
    }, [selectedTable]);

    // Fetch held and served orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const [heldRes, servedRes] = await Promise.all([
                    fetch(`${apiUrl}/orders/held/all`),
                    fetch(`${apiUrl}/orders/served/all`)
                ]);
                
                if (heldRes.ok) {
                    setHeldOrders(await heldRes.ok ? await heldRes.json() : []);
                }
                if (servedRes.ok) {
                    setServedOrders(await servedRes.ok ? await servedRes.json() : []);
                }
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            }
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper to refresh held and served orders
    const refreshOrders = async () => {
        try {
            const [heldRes, servedRes] = await Promise.all([
                fetch(`${apiUrl}/orders/held/all`),
                fetch(`${apiUrl}/orders/served/all`)
            ]);
            
            if (heldRes.ok) {
                setHeldOrders(await heldRes.json());
            }
            if (servedRes.ok) {
                setServedOrders(await servedRes.json());
            }
        } catch (err) {
            console.error("Failed to refresh orders:", err);
        }
    };

    const addToCart = (item: MenuItem) => {
        if (item.addOns && item.addOns.length > 0) {
            setSelectedItemForAddOn(item);
            setSelectedAddOns([]);
            setShowAddOnModal(true);
            return;
        }
        
        setCart(prev => {
            const existing = prev.find(c => (c.id || c.menuItem._id) === item._id);
            if (existing) {
                return prev.map(c =>
                    (c.id || c.menuItem._id) === item._id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                );
            }
            return [...prev, { id: item._id, menuItem: item, quantity: 1 }];
        });
    };

    const confirmAddToCartWithAddOns = () => {
        if (!selectedItemForAddOn) return;
        const addonStr = selectedAddOns.map(a => a.name).join('-');
        const customId = addonStr ? `${selectedItemForAddOn._id}-${addonStr}` : selectedItemForAddOn._id;

        setCart(prev => {
            const existing = prev.find(c => c.id === customId);
            if (existing) {
                return prev.map(c => c.id === customId ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { id: customId, menuItem: selectedItemForAddOn, quantity: 1, addOns: selectedAddOns }];
        });
        
        setShowAddOnModal(false);
        setSelectedItemForAddOn(null);
        setSelectedAddOns([]);
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(c => {
                if ((c.id || c.menuItem._id) === itemId) {
                    const newQ = c.quantity + delta;
                    return newQ > 0 ? { ...c, quantity: newQ } : c;
                }
                return c;
            });
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(c => (c.id || c.menuItem._id) !== itemId));
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: "Clear Order",
            message: "Are you sure you want to clear the current order? This will remove all items from the cart.",
            onConfirm: () => {
                setCart([]);
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);
                setCurrentOrderId("");
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                toast.success("Order cleared");
            }
        });
    };

    const subtotal = cart.reduce((acc, curr) => {
        const basePrice = getPrice(curr.menuItem) || 0;
        const addOnsPrice = curr.addOns?.reduce((sum, a) => sum + a.price, 0) || 0;
        return acc + (basePrice + addOnsPrice) * curr.quantity;
    }, 0);

    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount - discount;

    // ===== PRINT HELPER: Opens a new window with receipt HTML and prints =====
    const markBillAsPrinted = async (orderId: string) => {
        try {
            await fetch(`${apiUrl}/orders/${orderId}/print-bill`, {
                method: "PATCH"
            });
            refreshOrders();
        } catch (err) {
            console.error("Failed to mark bill as printed:", err);
        }
    };

    const printBillReceipt = (details: typeof lastOrderDetails) => {
        if (!details) return;
        const itemsHtml = details.items.map(c => {
            const basePrice = getPrice(c.menuItem) || 0;
            const addOnsPrice = c.addOns?.reduce((sum, a) => sum + a.price, 0) || 0;
            const p = basePrice + addOnsPrice;
            const addonText = c.addOns?.length ? `<div style="font-size:11px;color:#555;margin-left:10px;">+ ${c.addOns.map(a=>a.name).join(', ')}</div>` : '';
            return `<div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span>${c.menuItem.title} x${c.quantity}</span><span>BDT ${(p * c.quantity).toFixed(2)}</span></div>${addonText}<div style="margin-bottom:6px;"></div>`;
        }).join('');
        const paymentMethodsHtml = details.paymentMethods.map(pm =>
            `<div style="display:flex;justify-content:space-between;"><span>${pm.method.toUpperCase()}</span><span>BDT ${pm.amount.toFixed(2)}</span></div>`
        ).join('');
        const paymentLabel = details.paymentMethods.length > 1 ? 'SPLIT' : details.paymentMethods[0].method.toUpperCase();
        const orderNum = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${details.orderId.slice(-4).toUpperCase()}`;

        const html = `<!DOCTYPE html><html><head><title>Bill Receipt</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
            .solid { border-bottom: 2px solid #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin: 10px 0; }
            img { display: block; margin: 10px auto; }
            @media print { @page { margin: 0; size: 80mm auto; } }
        </style></head><body>
            <div class="center bold" style="font-size:20px;margin-bottom:15px;">${settings.websiteName.toUpperCase()}</div>
            <div class="dashed"></div>
            <div class="row"><span>Order #</span><span>${orderNum}</span></div>
            <div class="row"><span>Date</span><span>${details.date}</span></div>
            <div class="row"><span>Payment</span><span>${paymentLabel}</span></div>
            <div class="dashed"></div>
            <div class="row bold" style="margin-bottom:8px;"><span>Item</span><span>Amount</span></div>
            <div class="solid"></div>
            ${itemsHtml}
            <div class="solid"></div>
            <div class="row"><span>Subtotal</span><span>BDT ${details.subtotal.toFixed(2)}</span></div>
            <div class="row"><span>VAT</span><span>BDT ${details.vatAmount.toFixed(2)}</span></div>
            ${paymentMethodsHtml}
            <div class="solid"></div>
            <div class="total-row"><span>TOTAL</span><span>BDT ${details.total.toFixed(2)}</span></div>
            <div class="dashed"></div>
            <div class="center" style="margin-top:10px;">
                <p style="margin-bottom:10px;">Thank you for your visit!</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${details.orderId}" alt="QR" width="100" height="100" />
                <p style="font-size:12px;margin-top:10px;"><strong>${settings.websiteName}</strong> | ${settings.websiteName.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
        </body></html>`;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            // Using a timeout as it's more reliable for window.open + document.write
            setTimeout(() => {
                if (!printWindow.closed) {
                    printWindow.focus();
                    printWindow.print();
                    if (details.orderId) {
                        markBillAsPrinted(details.orderId);
                    }
                }
            }, 500);
        } else {
            toast.error("Please allow pop-ups to print the receipt");
        }
    };

    const printKOTReceipt = (details: typeof lastOrderDetails) => {
        if (!details) return;
        const itemsHtml = details.items.map(c => {
            const addonText = c.addOns?.length ? `<div style="font-size:12px;margin-left:15px;margin-bottom:10px;">+ ${c.addOns.map(a=>a.name).join(', ')}</div>` : '';
            return `<div style="font-weight:bold;font-size:16px;margin-bottom:${c.addOns?.length?'2px':'10px'};">${c.quantity}x ${c.menuItem.title}</div>${addonText}`;
        }).join('');
        const orderNum = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${details.orderId.slice(-4).toUpperCase()}`;

        const html = `<!DOCTYPE html><html><head><title>KOT</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .dashed { border-bottom: 3px dashed #000; margin: 10px 0; }
            .solid { border-bottom: 3px solid #000; margin: 10px 0; }
            @media print { @page { margin: 0; size: 80mm auto; } }
        </style></head><body>
            <div class="center bold" style="font-size:18px;margin-bottom:15px;">KITCHEN ORDER</div>
            <div class="dashed"></div>
            <div style="margin-bottom:4px;"><strong>Order #:</strong> ${orderNum}</div>
            <div><strong>Time:</strong> ${details.date}</div>
            <div><strong>Table:</strong> ${details.table}</div>
            <div class="solid" style="margin-top:10px;"></div>
            ${itemsHtml}
            <div class="solid"></div>
            <div class="dashed"></div>
            <div class="center bold" style="font-size:14px;">*** END OF ORDER ***</div>
        </body></html>`;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => {
                if (!printWindow.closed) {
                    printWindow.focus();
                    printWindow.print();
                }
            }, 500);
        } else {
            toast.error("Please allow pop-ups to print the KOT");
        }
    };

    const handlePayment = (method: 'Cash' | 'Card' | 'MFS') => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        setSelectedPaymentMethod(method);
        const displayTotal = isNaN(total) ? 0 : total;
        setAmountReceived(displayTotal.toFixed(2));
        setChangeAmount(0);
        setShowPaymentModal(true);
    };

    const handlePrintKOT = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setIsProcessing(true);

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: "KOT Order"
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "pending",
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType
            };

            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

                // Update table status to Occupied if a table was selected
                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Occupied',
                                currentOrder: orderId,
                                occupiedTime: new Date().toISOString()
                            })
                        });
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                setLastOrderDetails({
                    items: [...cart],
                    subtotal,
                    vatAmount,
                    total,
                    paymentMethods: [{ method: 'N/A', amount: total }],
                    orderId: orderId,
                    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', ''),
                    table: selectedTable,
                    customer: selectedCustomer
                });

                setShowKOTPreview(true);
                toast.success("KOT saved successfully!");
                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to save KOT");
            }
        } catch (err) {
            console.error("KOT error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintBill = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setIsProcessing(true);

            // Double check table status before proceeding
            if (selectedTableId && selectedTable !== "Takeaway") {
                const tableRes = await fetch(`${apiUrl}/tables/${selectedTableId}`);
                if (tableRes.ok) {
                    const tableData = await tableRes.json();
                    if (tableData.status !== 'Free') {
                        toast.error(`Table ${selectedTable} was just booked by someone else! Please select another table.`);
                        setIsProcessing(false);
                        return;
                    }
                }
            }

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: "Bill Print"
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "completed",
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType,
                paymentMethod: "pending"
            };

            console.log('Saving bill with data:', orderData);

            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

                // Update table status to Occupied if a table was selected
                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Occupied',
                                currentOrder: orderId,
                                occupiedTime: new Date().toISOString()
                            })
                        });
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                setLastOrderDetails({
                    items: [...cart],
                    subtotal,
                    vatAmount,
                    total,
                    paymentMethods: [{ method: 'N/A', amount: total }],
                    orderId: orderId,
                    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', ''),
                    table: selectedTable,
                    customer: selectedCustomer
                });

                setShowBillPreview(true);
                toast.success("Bill saved successfully!");
                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to save bill");
            }
        } catch (err) {
            console.error("Bill print error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSplit = () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        setSplitPayments([
            { method: 'Cash', amount: 0 },
            { method: 'Card', amount: 0 },
            { method: 'MFS', amount: 0 }
        ]);
        setShowSplitModal(true);
    };

    const handleHold = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setIsProcessing(true);

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: "Held order"
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "held",
                isHeld: true,
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType
            };

            console.log('Holding order with data:', orderData);
            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;

                // Update table status to Occupied if a table was selected
                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Occupied',
                                currentOrder: orderId,
                                occupiedTime: new Date().toISOString()
                            })
                        });
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                toast.success("Order held successfully!");
                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);

                // Refresh held orders
                const heldRes = await fetch(`${apiUrl}/orders/held/all`);
                if (heldRes.ok) {
                    setHeldOrders(await heldRes.json());
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to hold order");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleServe = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        try {
            setIsProcessing(true);

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: "Served order"
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "served",
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType
            };

            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;

                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Occupied',
                                currentOrder: orderId,
                                occupiedTime: new Date().toISOString()
                            })
                        });
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                toast.success("Order served successfully!");
                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);

                // Refresh served orders
                const servedRes = await fetch(`${apiUrl}/orders/served/all`);
                if (servedRes.ok) {
                    setServedOrders(await servedRes.json());
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to serve order");
            }
        } catch (err) {
            console.error("Serve error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        } finally {
            setIsProcessing(false);
        }
    };

    const processPayment = async () => {
        try {
            setIsProcessing(true);

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: `Payment method: ${selectedPaymentMethod}`
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "completed",
                paymentMethod: selectedPaymentMethod,
                amountReceived: parseFloat(amountReceived) || total,
                changeAmount: changeAmount || 0,
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType
            };

            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

                // Update table status to Free after payment is completed
                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Cleaning',
                                currentOrder: undefined,
                                occupiedTime: undefined,
                                server: undefined
                            })
                        });
                        toast.info(`Table ${selectedTable} marked for Cleaning.`);
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                setLastOrderDetails({
                    items: [...cart],
                    subtotal,
                    vatAmount,
                    total,
                    paymentMethods: [{ method: selectedPaymentMethod, amount: total }],
                    orderId: orderId,
                    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', ''),
                    table: selectedTable,
                    customer: selectedCustomer
                });

                toast.success(`Payment completed with ${selectedPaymentMethod}!`);
                setShowPaymentModal(false);
                setShowBillPreview(true);

                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);
                setAmountReceived('');
                setChangeAmount(0);

                // Refresh orders to update counts immediately
                refreshOrders();
            }
            else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to process payment");
            }
        } catch (err) {
            console.error("Payment error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        } finally {
            setIsProcessing(false);
        }
    };

    const addSplitPayment = () => {
        const amount = parseFloat(currentSplitAmount);
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const allocated = splitPayments.reduce((sum, p) => sum + p.amount, 0);
        if (allocated + amount > total) {
            toast.error("Total exceeds order amount");
            return;
        }

        setSplitPayments([...splitPayments, { method: currentSplitMethod, amount }]);
        setCurrentSplitAmount('');
    };

    const removeSplitPayment = (index: number) => {
        setSplitPayments(splitPayments.filter((_, i) => i !== index));
    };

    const processSplitPayment = async () => {
        const allocated = splitPayments.reduce((sum, p) => sum + p.amount, 0);
        const finalSplitPayments = splitPayments.filter(p => p.amount > 0);
        if (finalSplitPayments.length === 0) {
            toast.error("Please add at least one payment amount");
            return;
        }

        try {
            setIsProcessing(true);

            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Takeaway",
                    notes: "Split payment"
                },
                items: cart.map(c => ({ menuItemId: c.menuItem._id, title: c.menuItem.title, price: getPrice(c.menuItem), quantity: c.quantity, addOns: c.addOns })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "completed",
                paymentMethod: "split",
                splitPayments: finalSplitPayments,
                amountReceived: allocated || 0,
                changeAmount: (allocated || 0) - (total || 0),
                tableNumber: selectedTable,
                tableId: selectedTableId || undefined,
                orderType: orderType
            };

            const res = await fetch(currentOrderId ? `${apiUrl}/orders/${currentOrderId}` : `${apiUrl}/orders`, {
                method: currentOrderId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

                // Update table status to Free after payment is completed
                if (selectedTableId && selectedTable !== "Takeaway") {
                    try {
                        await fetch(`${apiUrl}/tables/${selectedTableId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                status: 'Cleaning',
                                currentOrder: undefined,
                                occupiedTime: undefined,
                                server: undefined
                            })
                        });
                        toast.info(`Table ${selectedTable} marked for Cleaning.`);
                    } catch (tableErr) {
                        console.error("Failed to update table status:", tableErr);
                    }
                }

                setLastOrderDetails({
                    items: [...cart],
                    subtotal,
                    vatAmount,
                    total,
                    paymentMethods: splitPayments.map(p => ({ method: p.method, amount: p.amount })),
                    orderId: orderId,
                    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', ''),
                    table: selectedTable,
                    customer: selectedCustomer
                });

                toast.success("Split payment completed successfully!");
                setShowSplitModal(false);
                setShowBillPreview(true);

                setSplitPayments([]);
                setCart([]);
                setCurrentOrderId("");
                setSelectedTable("Takeaway");
                setSelectedTableId(null);
                setSelectedCustomer("Walk-in");
                setDiscount(0);

                // Refresh orders to update counts immediately
                refreshOrders();
            }
            else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to process split payment");
            }
        } catch (err) {
            console.error("Split payment error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        } finally {
            setIsProcessing(false);
        }
    };

    const releaseHeldOrder = async (orderId: string) => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}/release`, {
                method: "PUT"
            });

            if (res.ok) {
                const order = await res.json();
                // Load items back into cart
                const newCart: CartItem[] = order.items.map((item: OrderItem) => {
                    const menuItem = menuItems.find(m => m._id === item.menuItemId);
                    // Fallback to item data if menuItem not found in current list
                    const finalMenuItem = menuItem || {
                        _id: item.menuItemId,
                        id: 0,
                        title: item.title,
                        price: item.price,
                        category: "Restored",
                        imageUrls: []
                    };
                    return { 
                        id: item.menuItemId,
                        menuItem: finalMenuItem, 
                        quantity: item.quantity,
                        addOns: item.addOns || []
                    };
                });

                setCart(newCart);
                setSelectedTable(order.tableNumber || "Takeaway");
                setSelectedTableId(order.tableId || null);
                setSelectedCustomer(order.customerInfo.name || "Walk-in");
                setDiscount(order.discount || 0);
                setOrderType(order.orderType === 'dine-in' ? 'dine-in' : 'takeaway');

                toast.success("Order released to cart!");
                setShowHeldOrdersModal(false);

                // Refresh held orders
                const heldRes = await fetch(`${apiUrl}/orders/held/all`);
                if (heldRes.ok) {
                    setHeldOrders(await heldRes.json());
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to release order");
            }
        } catch (err) {
            console.error("Release error:", err);
            toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
        }
    };

    const handleServedOrderCheckout = async (orderId: string) => {
        try {
            const res = await fetch(`${apiUrl}/orders/${orderId}`);
            if (res.ok) {
                const order = await res.json();
                
                // Load items back into cart
                const newCart: CartItem[] = order.items.map((item: OrderItem) => {
                    const menuItem = menuItems.find(m => m._id === item.menuItemId);
                    // Fallback to item data if menuItem not found in current list
                    const finalMenuItem = menuItem || {
                        _id: item.menuItemId,
                        id: 0,
                        title: item.title,
                        price: item.price,
                        category: "Restored",
                        imageUrls: []
                    };
                    return { 
                        id: item.menuItemId,
                        menuItem: finalMenuItem, 
                        quantity: item.quantity,
                        addOns: item.addOns || []
                    };
                });

                setCart(newCart);
                setCurrentOrderId(order._id);
                setSelectedTable(order.tableNumber || "Takeaway");
                setSelectedTableId(order.tableId || null);
                setSelectedCustomer(order.customerInfo.name || "Walk-in");
                setDiscount(order.discount || 0);
                setOrderType(order.orderType === 'dine-in' ? 'dine-in' : 'takeaway');
                
                // Pre-fill amount received
                setAmountReceived(order.total.toString());
                
                setShowServedOrdersModal(false);
                
                // Small delay to ensure state is updated before opening modal
                setTimeout(() => {
                    setShowPaymentModal(true);
                }, 100);

                toast.info("Order loaded for checkout");
            }
        } catch (err) {
            console.error("Load served order error:", err);
            toast.error("Failed to load order for checkout");
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="POS System">
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-[calc(100vh-6rem)] relative">

                {/* Left Side: Menu Grid */}
                <div className="flex-1 flex flex-col bg-white border border-[#E5E5E5] rounded-[4px] shadow-sm overflow-hidden shadow-sm min-h-0 pb-[72px] lg:pb-0">
                    {/* Premium Order Session Banner */}
                    <div className={`px-4 lg:px-6 py-2 lg:py-4 border-b flex items-center justify-between transition-all duration-500 ${
                        selectedTable === "Takeaway" 
                        ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-100' 
                        : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-100'
                    }`}>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-[4px] lg:rounded-[4px] flex items-center justify-center text-white shadow-lg lg:shadow-xl transition-transform hover:rotate-6 ${
                                selectedTable === "Takeaway" 
                                ? 'bg-primary shadow-emerald-100' 
                                : 'bg-[#262626] shadow-blue-100'
                            }`}>
                                {selectedTable === "Takeaway" ? <Smartphone className="w-5 h-5 lg:w-6 lg:h-6" /> : <Utensils className="w-5 h-5 lg:w-6 lg:h-6" />}
                            </div>
                            <div>
                                <div className={`text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.25em] leading-none mb-1 lg:mb-2 flex items-center gap-1.5 lg:gap-2 ${
                                    selectedTable === "Takeaway" ? 'text-primary' : 'text-[#262626]'
                                }`}>
                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                    {orderType === 'dine-in' ? (
                                        <span className="hidden sm:inline">Premium Dine-In Service</span>
                                    ) : (
                                        <span className="hidden sm:inline">Express Takeaway Point</span>
                                    )}
                                    <span className="sm:hidden">{orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
                                </div>
                                <div className="text-sm lg:text-lg font-serif font-semibold text-[#262626] text-neutral-900 flex items-center gap-2 lg:gap-3 leading-none tracking-tight">
                                    {selectedTable === "Takeaway" ? "Standard Takeaway" : `Table: ${selectedTable}`}
                                    {currentOrderId ? (
                                        <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-amber-50 text-amber-700 text-[8px] lg:text-[9px] font-black rounded-full uppercase tracking-[0.1em] border border-amber-100 shadow-sm">
                                            <div className="w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-amber-500 animate-ping" />
                                            Live
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 px-2 py-0.5 lg:px-3 lg:py-1 bg-neutral-50 text-neutral-400 text-[8px] lg:text-[9px] font-black rounded-full uppercase tracking-[0.1em] border border-neutral-100">
                                            <div className="w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full bg-neutral-300" />
                                            Ready
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 lg:gap-8">
                            {currentOrderId && (
                                <div className="text-right border-r border-neutral-100 pr-4 lg:pr-8 hidden sm:block">
                                    <div className="text-[8px] lg:text-[10px] font-black text-neutral-300 uppercase tracking-widest leading-none mb-1 lg:mb-1.5">ID</div>
                                    <div className="text-[11px] lg:text-sm font-bold text-[#262626] text-neutral-800 tracking-widest">#{currentOrderId.slice(-6).toUpperCase()}</div>
                                </div>
                            )}
                            <div className="text-right">
                                <div className="text-[8px] lg:text-[10px] font-black text-neutral-300 uppercase tracking-widest leading-none mb-1 lg:mb-1.5">Time</div>
                                <div className="text-[11px] lg:text-sm font-bold text-[#262626] text-neutral-800 tracking-widest">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Bar / Filters */}
                    <div className="p-3 lg:p-4 border-b border-neutral-200 bg-neutral-50">
                        <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
                            <div className="relative flex-1 min-w-[150px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[4px] pl-9 pr-4 py-1.5 lg:py-2 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
                                />
                            </div>
                            <button
                                onClick={() => setShowHeldOrdersModal(true)}
                                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-[4px] transition-colors flex items-center gap-2 text-xs lg:text-sm shadow-sm active:scale-95"
                            >
                                <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                <span className="hidden xs:inline">Held</span> ({heldOrders.length})
                            </button>
                            <button
                                onClick={() => setShowServedOrdersModal(true)}
                                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-primary hover:bg-[#a88647] text-white font-semibold rounded-[4px] transition-colors flex items-center gap-2 text-xs lg:text-sm shadow-sm active:scale-95"
                            >
                                <Utensils className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                <span className="hidden xs:inline">Served</span> ({servedOrders.length})
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-4 py-2 rounded-[4px] text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.name
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                <Utensils className="w-12 h-12 mb-4 opacity-50" />
                                <p>No items found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredItems.map(item => {
                                    const price = getPrice(item);
                                    const originalPrice = getOriginalPrice(item);
                                    return (
                                        <div
                                            key={item._id}
                                            onClick={() => addToCart(item)}
                                            className="bg-white border border-[#E5E5E5] rounded-[4px] shadow-sm overflow-hidden cursor-pointer hover:border-primary transition-all group flex flex-col h-full"
                                        >
                                            <div className="h-24 bg-neutral-100 overflow-hidden">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                {(!item.image || item.image === '') && (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <Utensils className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2.5 flex flex-col flex-1 justify-between">
                                                <div>
                                                    <h4 className="font-medium text-sm text-neutral-900 line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                                    <span className="text-xs text-neutral-500 block truncate">{item.category}</span>
                                                </div>
                                                <div className="mt-2">
                                                    {originalPrice && originalPrice > price ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-neutral-400 line-through">BDT{originalPrice.toFixed(2)}</span>
                                                            <span className="text-sm font-semibold text-primary">BDT{price.toFixed(2)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-primary">BDT{price.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Drawer Peek Bar */}
                <div 
                    className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-neutral-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] cursor-pointer active:bg-neutral-50 transition-colors"
                    onClick={() => setMobileDrawerOpen(true)}
                >
                    <div className="flex items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6 text-neutral-700" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
                                        {cart.reduce((s, c) => s + c.quantity, 0)}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Current Order</p>
                                <p className="text-sm font-bold text-[#262626] text-neutral-900">
                                    {cart.length === 0 ? 'Empty cart' : `${cart.reduce((s, c) => s + c.quantity, 0)} items`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total</p>
                                <p className="text-lg font-serif font-semibold text-[#262626] text-primary">৳{total.toFixed(0)}</p>
                            </div>
                            <ChevronUp className="w-5 h-5 text-neutral-400" />
                        </div>
                    </div>
                </div>

                {/* AddOn Modal */}
                {showAddOnModal && selectedItemForAddOn && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddOnModal(false)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-primary">Customize: {selectedItemForAddOn.title}</h3>
                                <button onClick={() => setShowAddOnModal(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                                    <X className="w-5 h-5 text-neutral-500" />
                                </button>
                            </div>
                            
                            <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {selectedItemForAddOn.addOns?.map((addon, idx) => {
                                    const isSelected = selectedAddOns.some(a => a.name === addon.name);
                                    return (
                                        <label key={idx} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[hsl(43_74%_48%)] bg-[hsl(43_74%_48%)]/5' : 'border-neutral-100 hover:border-neutral-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'border-[hsl(43_74%_48%)] bg-[hsl(43_74%_48%)]' : 'border-neutral-300'}`}>
                                                    {isSelected && <svg className="w-4 h-4 text-[hsl(195_30%_8%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <span className="font-semibold text-primary">{addon.name}</span>
                                            </div>
                                            <span className="font-bold text-accent">
                                                {addon.price === 0 || Number(addon.price) === 0 ? 'Free' : `+BDT ${addon.price}`}
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isSelected}
                                                onChange={() => {
                                                    if (isSelected) {
                                                        setSelectedAddOns(prev => prev.filter(a => a.name !== addon.name));
                                                    } else {
                                                        setSelectedAddOns(prev => [...prev, addon]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    );
                                })}
                            </div>

                            <button
                                onClick={confirmAddToCartWithAddOns}
                                className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                Add to Order
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Full Drawer Overlay */}
                {mobileDrawerOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setMobileDrawerOpen(false)}
                        />
                        {/* Drawer Panel */}
                        <div className="relative mt-auto bg-white rounded-t-[2rem] shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
                            {/* Drawer Handle */}
                            <div 
                                className="flex flex-col items-center pt-3 pb-2 cursor-pointer shrink-0"
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
                            </div>
                            
                            {/* Drawer Header */}
                            <div className="px-5 pb-3 border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-neutral-700" />
                                    <h2 className="text-lg font-serif font-semibold text-[#262626] text-neutral-900">Current Order</h2>
                                    {cart.length > 0 && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                                            {cart.reduce((s, c) => s + c.quantity, 0)} items
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setMobileDrawerOpen(false); }}
                                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-500" />
                                </button>
                            </div>

                            {/* Dropdowns */}
                            <div className="px-4 py-3 border-b border-neutral-100 flex gap-2 shrink-0">
                                <div className="relative flex-1">
                                    <select
                                        value={selectedTable}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedTable(val);
                                            if (val === "Takeaway") {
                                                setSelectedTableId(null);
                                                setOrderType('takeaway');
                                            } else {
                                                const table = tables.find(t => t.tableNumber === val);
                                                if (table) setSelectedTableId(table._id);
                                                setOrderType('dine-in');
                                            }
                                        }}
                                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="Takeaway">Takeaway</option>
                                        {tables.map(table => {
                                            const isOccupied = table.status !== 'Free';
                                            return (
                                                <option 
                                                    key={table._id} 
                                                    value={table.tableNumber} 
                                                    disabled={isOccupied}
                                                >
                                                    Table {table.tableNumber} {table.name ? `(${table.name})` : ''} 
                                                    {isOccupied ? ` - [${table.status.toUpperCase()}]` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium pr-8"
                                    >
                                        <option value="Walk-in">Walk-in</option>
                                        {customers.map(c => (
                                            <option key={c._id} value={c.name}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                </div>
                                <button
                                    onClick={() => setShowAddCustomerModal(true)}
                                    className="px-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-[4px] transition-colors flex-shrink-0"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Cart Items (scrollable) */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                                        <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm font-medium">Your cart is empty</p>
                                        <p className="text-xs mt-1">Tap menu items to add them</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cart.map(c => {
                                            const priceVal = getPrice(c.menuItem);
                                            return (
                                                <div key={c.id || c.menuItem._id} className="flex items-center gap-3 bg-neutral-50 p-3 rounded-[4px]">
                                                    <div className="w-12 h-12 bg-neutral-200 rounded-[4px] overflow-hidden flex-shrink-0">
                                                        {c.menuItem.image ? (
                                                            <img src={c.menuItem.image} alt={c.menuItem.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                                <Utensils className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-neutral-900 truncate">{c.menuItem.title}</h4>
                                                        {c.addOns && c.addOns.length > 0 && (
                                                            <div className="text-[10px] text-neutral-500 leading-tight truncate">
                                                                + {c.addOns.map(a => a.name).join(', ')}
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-neutral-500">৳{priceVal.toFixed(0)} each</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-white border border-[#E5E5E5] rounded-[4px] shadow-sm p-0.5">
                                                        <button onClick={() => updateQuantity(c.id || c.menuItem._id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-600">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-black w-6 text-center">{c.quantity}</span>
                                                        <button onClick={() => updateQuantity(c.id || c.menuItem._id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 rounded text-neutral-600">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-neutral-900">৳{(priceVal * c.quantity).toFixed(0)}</p>
                                                        <button onClick={() => removeFromCart(c.id || c.menuItem._id)} className="mt-0.5 p-1 hover:bg-rose-100 rounded text-rose-400">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/80 space-y-1 shrink-0">
                                <div className="flex justify-between text-[10px] text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="text-neutral-700 font-semibold">BDT {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-neutral-400">
                                    <span>VAT ({vatRate}%)</span>
                                    <span className="text-neutral-700 font-semibold">BDT {vatAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-neutral-400 items-center">
                                    <span>Discount</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-16 bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-right text-[10px] font-semibold text-neutral-700 focus:outline-none focus:border-primary"
                                        min="0"
                                        max={subtotal}
                                        step="0.01"
                                    />
                                </div>
                                <div className="flex justify-between items-center pt-1.5 border-t border-neutral-200">
                                    <span className="text-sm font-bold text-[#262626] text-neutral-900">Total</span>
                                    <span className="text-xl font-serif font-semibold text-primary text-primary">BDT {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-4 py-3 bg-white border-t border-neutral-100 shrink-0 safe-area-bottom">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); handlePrintKOT(); }} 
                                        disabled={cart.length === 0} 
                                        className="h-12 bg-gradient-to-br from-orange-500 to-amber-600 disabled:from-neutral-100 disabled:to-neutral-100 disabled:text-neutral-300 text-white font-black rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Utensils className="w-4 h-4" />
                                        <span className="text-[10px] uppercase tracking-widest">Kitchen</span>
                                    </button>
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); setShowPaymentModal(true); }} 
                                        disabled={cart.length === 0} 
                                        className="h-12 bg-gradient-to-br from-emerald-500 to-teal-600 disabled:from-neutral-100 disabled:to-neutral-100 disabled:text-neutral-300 text-white font-black rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-[10px] uppercase tracking-widest">Checkout</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); setShowSplitModal(true); }} 
                                        disabled={cart.length === 0} 
                                        className="h-9 bg-neutral-50 border border-neutral-200 disabled:opacity-40 text-neutral-600 font-bold rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 text-[9px] uppercase"
                                    >
                                        <Split className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); handleHold(); }} 
                                        disabled={cart.length === 0} 
                                        className="h-9 bg-amber-50 border border-amber-200 disabled:opacity-40 text-amber-700 font-bold rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 text-[9px] uppercase"
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); handleServe(); }} 
                                        disabled={cart.length === 0} 
                                        className="h-9 bg-[#ffdea5] border border-[#e9c176] disabled:opacity-40 text-primary font-bold rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 text-[9px] uppercase"
                                    >
                                        <Utensils className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => { setMobileDrawerOpen(false); clearCart(); }} 
                                        disabled={cart.length === 0} 
                                        className="h-9 bg-rose-50 border border-rose-200 disabled:opacity-40 text-rose-600 font-bold rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 text-[9px] uppercase"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Side: Current Order (Desktop Only) */}
                <div className="hidden lg:flex w-[420px] flex-col bg-white border border-[#E5E5E5] rounded-[4px] shadow-sm overflow-hidden shadow-sm shrink-0 min-h-0">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-lg font-semibold text-neutral-900">Current Order</h2>
                    </div>

                    {/* Dropdowns */}
                    <div className="p-4 border-b border-neutral-200 flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={selectedTable}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedTable(val);
                                    if (val === "Takeaway") {
                                        setSelectedTableId(null);
                                        setOrderType('takeaway');
                                    } else {
                                        const table = tables.find(t => t.tableNumber === val);
                                        if (table) setSelectedTableId(table._id);
                                        setOrderType('dine-in');
                                    }
                                }}
                                className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
                            >
                                <option value="Takeaway">Takeaway</option>
                                {tables.map(table => {
                                    const isOccupied = table.status !== 'Free';
                                    return (
                                        <option 
                                            key={table._id} 
                                            value={table.tableNumber} 
                                            disabled={isOccupied}
                                            className={isOccupied ? 'text-neutral-400 italic bg-neutral-50' : ''}
                                        >
                                            Table {table.tableNumber} {table.name ? `(${table.name})` : ''} 
                                            {isOccupied ? ` - [${table.status.toUpperCase()}]` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-[4px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium pr-8"
                            >
                                <option value="Walk-in">Customer: Walk-in</option>
                                {customers.map(c => (
                                    <option key={c._id} value={c.name}>
                                        Customer: {c.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => setShowAddCustomerModal(true)}
                            className="px-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-[4px] transition-colors flex-shrink-0"
                            title="Add new customer"
                        >
                            <UserPlus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                <p className="text-sm font-medium">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {cart.map(c => {
                                    const priceVal = getPrice(c.menuItem);
                                    return (
                                        <div key={c.id || c.menuItem._id} className="flex items-center gap-2.5 bg-white border border-neutral-200 p-2.5 rounded-[4px] shadow-sm hover:shadow-md transition-shadow">
                                            {/* Item Image */}
                                            <div className="w-14 h-14 bg-neutral-100 rounded-[4px] overflow-hidden flex-shrink-0">
                                                {c.menuItem.image ? (
                                                    <img
                                                        src={c.menuItem.image}
                                                        alt={c.menuItem.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                {(!c.menuItem.image || c.menuItem.image === '') && (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <Utensils className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold text-neutral-900 truncate">{c.menuItem.title}</h4>
                                                <div className="text-xs text-neutral-500 mt-0.5">BDT {priceVal.toFixed(2)}</div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-0.5 bg-neutral-100 rounded-md p-0.5">
                                                <button onClick={() => updateQuantity(c.id || c.menuItem._id, -1)} className="p-1 hover:bg-white rounded text-neutral-600 transition-colors">
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-xs font-semibold w-5 text-center text-neutral-900">{c.quantity}</span>
                                                <button onClick={() => updateQuantity(c.id || c.menuItem._id, 1)} className="p-1 hover:bg-white rounded text-neutral-600 transition-colors">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Price and Remove */}
                                            <div className="flex flex-col items-end gap-0.5">
                                                <div className="text-xs font-bold text-neutral-900">BDT {(priceVal * c.quantity).toFixed(2)}</div>
                                                <button onClick={() => removeFromCart(c.id || c.menuItem._id)} className="p-0.5 hover:bg-rose-100 rounded text-rose-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="px-3 lg:px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 space-y-0.5 lg:space-y-1 shrink-0">
                        <div className="flex justify-between text-neutral-400 text-[9px] lg:text-[10px] tracking-wide">
                            <span>Subtotal</span>
                            <span className="text-neutral-700 font-semibold">BDT {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[9px] lg:text-[10px] tracking-wide items-center">
                            <span>VAT ({vatRate}%)</span>
                            <span className="text-neutral-700 font-semibold">BDT {vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[9px] lg:text-[10px] tracking-wide items-center">
                            <span>Discount</span>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                className="w-14 lg:w-16 bg-white border border-neutral-200 rounded px-1 lg:px-1.5 py-0.5 text-right text-[9px] lg:text-[10px] font-semibold text-neutral-700 focus:outline-none focus:border-primary"
                                min="0"
                                max={subtotal}
                                step="0.01"
                            />
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-neutral-200 mt-0.5 lg:mt-1">
                            <span className="text-[11px] lg:text-xs font-bold text-neutral-900">Total</span>
                            <span className="text-primary text-sm lg:text-base font-black">BDT {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Premium Actions Footer */}
                    <div className="px-3 lg:px-4 py-3 lg:py-4 bg-white border-t border-neutral-100 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                        <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <button 
                                onClick={handlePrintKOT} 
                                disabled={cart.length === 0} 
                                className="h-12 lg:h-14 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-neutral-100 disabled:to-neutral-100 disabled:text-neutral-300 text-white font-black rounded-[4px] lg:rounded-[4px] shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-0 lg:gap-0.5 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-1.5 lg:gap-2 z-10">
                                    <Utensils className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:rotate-12 transition-transform" /> 
                                    <span className="text-[9px] lg:text-[11px] uppercase tracking-[0.1em]">Kitchen (KOT)</span>
                                </div>
                                <span className="text-[8px] lg:text-[9px] font-bold opacity-70 italic z-10 uppercase tracking-tighter hidden sm:inline">Send to cooking</span>
                            </button>
                            <button 
                                onClick={() => setShowPaymentModal(true)} 
                                disabled={cart.length === 0} 
                                className="h-12 lg:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-neutral-100 disabled:to-neutral-100 disabled:text-neutral-300 text-white font-black rounded-[4px] lg:rounded-[4px] shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-0 lg:gap-0.5 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-1.5 lg:gap-2 z-10">
                                    <CreditCard className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" /> 
                                    <span className="text-[9px] lg:text-[11px] uppercase tracking-[0.1em]">Checkout (Bill)</span>
                                </div>
                                <span className="text-[8px] lg:text-[9px] font-bold opacity-70 italic z-10 uppercase tracking-tighter hidden sm:inline">Process payment</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <button 
                                onClick={() => setShowSplitModal(true)} 
                                disabled={cart.length === 0} 
                                className="h-9 lg:h-11 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 disabled:opacity-40 text-neutral-600 font-bold rounded-[4px] lg:rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] uppercase tracking-wider"
                            >
                                <Split className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">Split</span>
                            </button>
                            <button 
                                onClick={handleHold} 
                                disabled={cart.length === 0} 
                                className="h-9 lg:h-11 bg-amber-50 hover:bg-amber-100 border border-amber-200 disabled:opacity-40 text-amber-700 font-bold rounded-[4px] lg:rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] uppercase tracking-wider"
                            >
                                <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">Hold</span>
                            </button>
                            <button 
                                onClick={handleServe} 
                                disabled={cart.length === 0} 
                                className="h-9 lg:h-11 bg-[#ffdea5] hover:bg-emerald-100 border border-[#e9c176] disabled:opacity-40 text-primary font-bold rounded-[4px] lg:rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] uppercase tracking-wider"
                            >
                                <Utensils className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">Serve</span>
                            </button>
                            <button 
                                onClick={clearCart} 
                                disabled={cart.length === 0} 
                                className="h-9 lg:h-11 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 text-rose-600 font-bold rounded-[4px] lg:rounded-[4px] active:scale-[0.97] transition-all flex items-center justify-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] uppercase tracking-wider"
                            >
                                <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">Clear</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Premium Header */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative shrink-0 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors z-20"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="relative z-10">
                                <h3 className="text-xl font-serif font-semibold text-primary uppercase tracking-widest mb-4 opacity-80">Collect Payment</h3>
                                <div className="text-sm font-bold opacity-60 uppercase tracking-tighter">Total Payable Amount</div>
                                <div className="text-5xl font-black mt-1 flex items-baseline gap-2">
                                    <span className="text-2xl opacity-60">BDT</span>
                                    {total.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Tabs */}
                            <div className="flex bg-neutral-100 p-1 rounded-[4px] mb-4">
                                <button className="flex-1 py-2 bg-white rounded-[4px] shadow-sm text-[#10b981] font-medium flex items-center justify-center gap-2 text-sm">
                                    <Banknote className="w-4 h-4" /> Single Payment
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        handleSplit();
                                    }}
                                    className="flex-1 py-2 text-neutral-500 font-medium flex items-center justify-center gap-2 text-sm hover:text-neutral-700 transition-colors"
                                >
                                    <Scissors className="w-4 h-4" /> Split Payment
                                </button>
                            </div>

                            {/* Add Discount */}
                            <div className="mb-4">
                                <div
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className={`flex items-center justify-between border ${showDiscountInput ? 'border-orange-500 bg-orange-50/30' : 'border-neutral-200'} rounded-[4px] p-3 cursor-pointer hover:bg-neutral-50 transition-all`}
                                >
                                    <div className={`flex items-center gap-2 ${showDiscountInput ? 'text-orange-600' : 'text-neutral-600'} font-medium text-sm`}>
                                        <BadgePercent className="w-4 h-4" /> Add Discount
                                    </div>
                                    <span className={`${showDiscountInput ? 'text-orange-500' : 'text-neutral-400'} text-sm font-medium`}>
                                        {showDiscountInput ? 'Hide' : 'Show'}
                                    </span>
                                </div>

                                {showDiscountInput && (
                                    <div className="mt-3 p-4 bg-neutral-50 rounded-[4px] border border-neutral-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex bg-white p-1 rounded-[4px] border border-neutral-200">
                                            <button
                                                onClick={() => setDiscountType('percentage')}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'percentage' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-neutral-500'}`}
                                            >
                                                Percentage (%)
                                            </button>
                                            <button
                                                onClick={() => setDiscountType('fixed')}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'fixed' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-neutral-500'}`}
                                            >
                                                Fixed Amount
                                            </button>
                                        </div>

                                        <div className="relative border border-neutral-200 rounded-[4px] bg-white overflow-hidden focus-within:border-orange-400 transition-colors">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                                                {discountType === 'percentage' ? '%' : 'BDT'}
                                            </div>
                                            <input
                                                type="number"
                                                value={discountValue}
                                                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setDiscountValue(val);
                                                    const numVal = parseFloat(val) || 0;
                                                    if (discountType === 'percentage') {
                                                        setDiscount((subtotal * numVal) / 100);
                                                    } else {
                                                        setDiscount(numVal);
                                                    }
                                                }}
                                                className="w-full py-2.5 pl-12 pr-4 text-sm font-bold text-neutral-800 outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            {(discountType === 'percentage' ? [5, 10, 15, 20] : [50, 100, 200, 500]).map((v) => (
                                                <button
                                                    key={v}
                                                    onClick={() => {
                                                        setDiscountValue(v.toString());
                                                        if (discountType === 'percentage') {
                                                            setDiscount((subtotal * v) / 100);
                                                        } else {
                                                            setDiscount(v);
                                                        }
                                                    }}
                                                    className="py-1.5 bg-white border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 rounded-[4px] text-xs font-bold text-neutral-700 transition-all"
                                                >
                                                    {discountType === 'percentage' ? `${v}%` : `BDT${v}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-400 mb-3">Choose Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedPaymentMethod('Cash');
                                            setAmountReceived('');
                                            setChangeAmount(-total);
                                        }}
                                        className={`rounded-[4px] py-4 flex flex-col items-center gap-2 transition-all duration-300 ${selectedPaymentMethod === 'Cash'
                                            ? 'bg-[#ffdea5] border-2 border-primary text-primary shadow-lg shadow-emerald-100 scale-[1.02]'
                                            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-[#e9c176] hover:bg-neutral-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-[4px] ${selectedPaymentMethod === 'Cash' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                            <Banknote className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-wider">Cash</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedPaymentMethod('Card');
                                            setAmountReceived(total.toFixed(2));
                                            setChangeAmount(0);
                                        }}
                                        className={`rounded-[4px] py-4 flex flex-col items-center gap-2 transition-all duration-300 ${selectedPaymentMethod === 'Card'
                                            ? 'bg-blue-50 border-2 border-blue-500 text-blue-700 shadow-lg shadow-blue-100 scale-[1.02]'
                                            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-blue-200 hover:bg-neutral-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-[4px] ${selectedPaymentMethod === 'Card' ? 'bg-blue-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-wider">Card</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedPaymentMethod('MFS');
                                            setAmountReceived(total.toFixed(2));
                                            setChangeAmount(0);
                                        }}
                                        className={`rounded-[4px] py-4 flex flex-col items-center gap-2 transition-all duration-300 ${selectedPaymentMethod === 'MFS'
                                            ? 'bg-purple-50 border-2 border-purple-500 text-purple-700 shadow-lg shadow-purple-100 scale-[1.02]'
                                            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-purple-200 hover:bg-neutral-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-[4px] ${selectedPaymentMethod === 'MFS' ? 'bg-purple-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-wider">MFS</span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Received / Change */}
                            <div className="mb-6">
                                {selectedPaymentMethod === 'Cash' ? (
                                    <>
                                        <label className="block text-sm text-neutral-600 mb-2">Amount Received</label>
                                        <div className="relative border-2 border-[#10b981] rounded-[4px] overflow-hidden flex items-center mb-4">
                                            <div className="pl-4 pr-2 text-neutral-500 font-medium">BDT</div>
                                            <input
                                                type="number"
                                                value={amountReceived}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setAmountReceived(e.target.value);
                                                    setChangeAmount(val - total);
                                                }}
                                                className="flex-1 py-3 px-2 text-xl font-bold text-neutral-900 outline-none w-full"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                            <div className="pr-2 flex flex-col text-neutral-400">
                                                <button className="hover:text-neutral-600" onClick={() => {
                                                    const val = (parseFloat(amountReceived) || 0) + 1;
                                                    setAmountReceived(val.toString());
                                                    setChangeAmount(val - total);
                                                }}>
                                                    <div className="rotate-180 text-xs">▼</div>
                                                </button>
                                                <button className="hover:text-neutral-600" onClick={() => {
                                                    const val = Math.max(0, (parseFloat(amountReceived) || 0) - 1);
                                                    setAmountReceived(val.toString());
                                                    setChangeAmount(val - total);
                                                }}>
                                                    <div className="text-xs">▼</div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quick Amounts */}
                                        <div className="flex gap-2 mb-3">
                                            {[500, 1000, 2000].map((amt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setAmountReceived(amt.toString());
                                                        setChangeAmount(amt - total);
                                                    }}
                                                    className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-[4px] text-sm font-medium text-neutral-700 transition-colors"
                                                >
                                                    BDT{amt}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Exact Amount */}
                                        <button
                                            onClick={() => {
                                                setAmountReceived(total.toFixed(2));
                                                setChangeAmount(0);
                                            }}
                                            className="w-full py-2.5 bg-[#d1fae5] text-[#059669] font-medium rounded-[4px] mb-4 hover:bg-[#a7f3d0] transition-colors text-sm"
                                        >
                                            Exact Amount (BDT{total.toFixed(2)})
                                        </button>

                                        {/* Change to Return */}
                                        <div className="flex justify-between items-center p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[4px]">
                                            <span className="text-[#047857] font-medium">Change to Return</span>
                                            <span className={`text-xl font-bold ${changeAmount >= 0 ? 'text-[#059669]' : 'text-red-500'}`}>
                                                BDT{changeAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 bg-[#eff6ff] border border-blue-100 rounded-[4px] text-center py-8">
                                        <div className="text-[#3b82f6] text-[15px] font-medium mb-3">
                                            {selectedPaymentMethod === 'Card' ? 'Process card payment for' : 'Confirm mobile payment for'}
                                        </div>
                                        <div className="text-4xl font-black text-[#1e40af]">
                                            BDT{total.toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-[4px] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={isProcessing || parseFloat(amountReceived) < total}
                                    className="flex-1 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Split Payment Modal */}
            {showSplitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-[#10b981] p-6 text-center text-white relative shrink-0">
                            <button
                                onClick={() => setShowSplitModal(false)}
                                className="absolute right-4 top-4 text-white hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold text-left mb-2">Collect Payment</h3>
                            <div className="text-sm font-medium opacity-90 mt-4">Total Amount</div>
                            <div className="text-3xl font-bold mt-1">BDT{total.toFixed(2)}</div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Tabs */}
                            <div className="flex bg-neutral-100 p-1 rounded-[4px] mb-4">
                                <button
                                    onClick={() => {
                                        setShowSplitModal(false);
                                        setShowPaymentModal(true);
                                    }}
                                    className="flex-1 py-2 text-neutral-500 font-medium flex items-center justify-center gap-2 text-sm hover:text-neutral-700 transition-colors"
                                >
                                    <Banknote className="w-4 h-4" /> Single Payment
                                </button>
                                <button className="flex-1 py-2 bg-white rounded-[4px] shadow-sm text-[#10b981] font-medium flex items-center justify-center gap-2 text-sm">
                                    <Scissors className="w-4 h-4" /> Split Payment
                                </button>
                            </div>

                            {/* Add Discount */}
                            <div className="mb-4">
                                <div
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className={`flex items-center justify-between border ${showDiscountInput ? 'border-orange-500 bg-orange-50/30' : 'border-neutral-200'} rounded-[4px] p-3 cursor-pointer hover:bg-neutral-50 transition-all`}
                                >
                                    <div className={`flex items-center gap-2 ${showDiscountInput ? 'text-orange-600' : 'text-neutral-600'} font-medium text-sm`}>
                                        <BadgePercent className="w-4 h-4" /> Add Discount
                                    </div>
                                    <span className={`${showDiscountInput ? 'text-orange-500' : 'text-neutral-400'} text-sm font-medium`}>
                                        {showDiscountInput ? 'Hide' : 'Show'}
                                    </span>
                                </div>

                                {showDiscountInput && (
                                    <div className="mt-3 p-4 bg-neutral-50 rounded-[4px] border border-neutral-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex bg-white p-1 rounded-[4px] border border-neutral-200">
                                            <button
                                                onClick={() => setDiscountType('percentage')}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'percentage' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-neutral-500'}`}
                                            >
                                                Percentage (%)
                                            </button>
                                            <button
                                                onClick={() => setDiscountType('fixed')}
                                                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${discountType === 'fixed' ? 'bg-[#fff7ed] text-[#ea580c]' : 'text-neutral-500'}`}
                                            >
                                                Fixed Amount
                                            </button>
                                        </div>

                                        <div className="relative border border-neutral-200 rounded-[4px] bg-white overflow-hidden focus-within:border-orange-400 transition-colors">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                                                {discountType === 'percentage' ? '%' : 'BDT'}
                                            </div>
                                            <input
                                                type="number"
                                                value={discountValue}
                                                placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setDiscountValue(val);
                                                    const numVal = parseFloat(val) || 0;
                                                    if (discountType === 'percentage') {
                                                        setDiscount((subtotal * numVal) / 100);
                                                    } else {
                                                        setDiscount(numVal);
                                                    }
                                                }}
                                                className="w-full py-2.5 pl-12 pr-4 text-sm font-bold text-neutral-800 outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            {(discountType === 'percentage' ? [5, 10, 15, 20] : [50, 100, 200, 500]).map((v) => (
                                                <button
                                                    key={v}
                                                    onClick={() => {
                                                        setDiscountValue(v.toString());
                                                        if (discountType === 'percentage') {
                                                            setDiscount((subtotal * v) / 100);
                                                        } else {
                                                            setDiscount(v);
                                                        }
                                                    }}
                                                    className="py-1.5 bg-white border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 rounded-[4px] text-xs font-bold text-neutral-700 transition-all"
                                                >
                                                    {discountType === 'percentage' ? `${v}%` : `BDT${v}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Split Methods */}
                            <div className="space-y-4 mb-6">
                                {splitPayments.map((p, idx) => {
                                    const iconMap = {
                                        'Cash': <Banknote className="w-5 h-5" />,
                                        'Card': <CreditCard className="w-5 h-5" />,
                                        'MFS': <Smartphone className="w-5 h-5" />
                                    };
                                    const labelMap = {
                                        'Cash': 'Cash',
                                        'Card': 'Card',
                                        'MFS': 'Mobile'
                                    };
                                    const colorMap = {
                                        'Cash': 'bg-green-500',
                                        'Card': 'bg-blue-500',
                                        'MFS': 'bg-purple-500'
                                    };

                                    return (
                                        <div key={idx} className="bg-neutral-50/50 rounded-[4px] p-4 flex items-center gap-4">
                                            <div className={`${colorMap[p.method as keyof typeof colorMap]} w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0`}>
                                                {iconMap[p.method as keyof typeof iconMap]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-neutral-600 mb-1">{labelMap[p.method as keyof typeof labelMap]}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 relative border border-neutral-200 rounded-[4px] overflow-hidden flex items-center bg-white focus-within:border-[#10b981] transition-colors">
                                                        <div className="pl-3 pr-1 text-neutral-400 text-sm font-medium">BDT</div>
                                                        <input
                                                            type="number"
                                                            value={p.amount || ''}
                                                            onChange={(e) => {
                                                                const newPayments = [...splitPayments];
                                                                newPayments[idx].amount = parseFloat(e.target.value) || 0;
                                                                setSplitPayments(newPayments);
                                                            }}
                                                            className="flex-1 py-2 px-1 text-lg font-bold text-neutral-900 outline-none w-full"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const currentAllocated = splitPayments.reduce((sum, sp, i) => i === idx ? sum : sum + sp.amount, 0);
                                                            const remaining = Math.max(0, total - currentAllocated);
                                                            const newPayments = [...splitPayments];
                                                            newPayments[idx].amount = remaining;
                                                            setSplitPayments(newPayments);
                                                        }}
                                                        className="px-4 py-2 bg-[#d1fae5] text-[#059669] text-xs font-bold rounded-full hover:bg-[#a7f3d0] transition-colors"
                                                    >
                                                        Fill
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary Box */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-[4px] p-4 space-y-2 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-600 font-medium">Split Total</span>
                                    <span className="text-neutral-900 font-bold">
                                        BDT{splitPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-orange-600 font-medium">Remaining</span>
                                    <span className="text-orange-600 font-bold">
                                        BDT{Math.max(0, total - splitPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSplitModal(false)}
                                    className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-[4px] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processSplitPayment}
                                    disabled={isProcessing || splitPayments.reduce((sum, p) => sum + p.amount, 0) < total}
                                    className="flex-1 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-[4px] transition-colors disabled:bg-neutral-300 disabled:text-white disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processing...' : 'Proceed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}             {/* Held Orders Modal */}
            {showHeldOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-neutral-900">Held Orders</h3>
                                <button
                                    onClick={() => setShowHeldOrdersModal(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-[4px] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {heldOrders.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No held orders</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {heldOrders.map((order) => (
                                        <div key={order._id} className="border border-neutral-200 rounded-[4px] p-4 hover:border-primary transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-neutral-900">#{order._id.slice(-6).toUpperCase()}</h4>
                                                    <p className="text-sm text-neutral-500">{new Date(order.heldAt || order.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span className="font-bold text-primary">BDT {Math.round(order.total)}</span>
                                            </div>
                                            <div className="text-sm text-neutral-600 mb-3">
                                                {order.items.map((item: OrderItem, idx: number) => (
                                                    <span key={idx}>{item.quantity}x {item.title}{idx < order.items.length - 1 ? ', ' : ''}</span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => releaseHeldOrder(order._id)}
                                                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-[4px] transition-colors text-sm"
                                            >
                                                Release to Cart
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Served Orders Modal */}
            {showServedOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[4px] bg-[#ffdea5] flex items-center justify-center">
                                        <Utensils className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 leading-none">Served Orders</h3>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Ready for Billing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowServedOrdersModal(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-[4px] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {servedOrders.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500">
                                    <Utensils className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium text-neutral-400">No orders marked as served</p>
                                    <p className="text-sm mt-1">Orders you serve will appear here for final checkout.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {servedOrders.map((order) => (
                                        <div key={order._id} className="group border border-neutral-200 rounded-[4px] p-5 hover:border-primary/50 hover:bg-[#ffdea5]/10 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-neutral-900 text-white px-3 py-1 rounded-[4px] text-xs font-black tracking-widest">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-neutral-900">{order.customerInfo?.name || "Walk-in"}</div>
                                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{order.tableNumber || "Takeaway"}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-serif font-semibold text-[#262626] text-primary tracking-tighter">BDT {Math.round(order.total)}</div>
                                                    <div className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 justify-end">
                                                        <Clock className="w-3 h-3" /> {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/50 border border-neutral-100 rounded-[4px] p-3 mb-4">
                                                <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-2">Order Items</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {order.items.map((item: OrderItem, idx: number) => (
                                                        <div key={idx} className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md text-[11px] font-bold">
                                                            {item.quantity}x {item.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleServedOrderCheckout(order._id)}
                                                className="w-full py-3 bg-[#a88647] hover:bg-emerald-700 text-white font-black rounded-[4px] transition-all shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 active:scale-[0.98] text-xs uppercase tracking-[0.2em]"
                                            >
                                                Checkout & Bill
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* KOT Preview Modal */}
            {showKOTPreview && lastOrderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b-4 border-orange-500 bg-orange-50/50">
                            <div>
                                <h3 className="text-xl font-serif font-semibold text-primary text-neutral-900 uppercase tracking-tighter">Kitchen Ticket</h3>
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">Cooking Order</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => printKOTReceipt(lastOrderDetails)} className="w-12 h-12 flex items-center justify-center bg-white text-neutral-900 rounded-[4px] shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all active:scale-95 border border-neutral-100">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowKOTPreview(false)} className="w-12 h-12 flex items-center justify-center bg-white text-rose-500 rounded-[4px] shadow-sm hover:shadow-md hover:bg-rose-50 transition-all active:scale-95 border border-neutral-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="p-10 overflow-y-auto custom-scrollbar text-center bg-white">
                            <div className="mb-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2">Order Reference</div>
                                <h2 className="text-4xl font-black text-neutral-900 leading-none">#{lastOrderDetails.orderId.slice(-6).toUpperCase()}</h2>
                            </div>
                            
                            <div className="flex justify-between items-center py-4 border-y border-dashed border-neutral-200 mb-8 px-2">
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Table</div>
                                    <div className="text-lg font-serif font-semibold text-[#262626] text-neutral-900">{lastOrderDetails.table}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Time</div>
                                    <div className="text-sm font-bold text-neutral-900">{lastOrderDetails.date.split(' ')[1]}</div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 text-left">
                                {lastOrderDetails.items.map((c, idx) => (
                                    <div key={idx} className="flex items-start gap-4 group">
                                        <div className="bg-neutral-900 text-white w-8 h-8 rounded-[4px] flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-neutral-200 group-hover:scale-110 transition-transform">
                                            {c.quantity}
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <span className="font-black text-xl text-neutral-900 uppercase tracking-tight leading-none block">{c.menuItem.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="py-6 bg-neutral-50 rounded-[4px] border border-neutral-100 border-dashed">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                <p className="text-xs font-bold text-orange-600 uppercase italic">SENT TO KITCHEN DISPLAY</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bill Preview Modal */}
            {showBillPreview && lastOrderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-yellow-400 border-b-4">
                            <h3 className="text-xl font-medium text-neutral-800">Order Slip</h3>
                            <div className="flex gap-2">
                                <button onClick={() => printBillReceipt(lastOrderDetails)} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-[#262626] rounded-full hover:bg-blue-100 transition-colors">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowBillPreview(false)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-serif font-bold text-[#0f172a] mb-2">{settings.websiteName}...</h2>
                                <p className="text-sm font-medium text-neutral-500 tracking-[0.2em] uppercase">Order Receipt</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Order ID</span>
                                    <span className="font-bold text-neutral-900">#{lastOrderDetails.orderId.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Date</span>
                                    <span className="font-medium text-neutral-900">{lastOrderDetails.date}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Payment Status</span>
                                    <span className="font-medium text-neutral-900">Paid</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-neutral-300 py-6">
                                {lastOrderDetails.items.map((c, idx) => {
                                    const price = getPrice(c.menuItem);
                                    return (
                                        <div key={idx} className="flex justify-between items-start mb-4 last:mb-0">
                                            <span className="font-bold text-neutral-900 text-[15px]">{c.quantity}x {c.menuItem.title}</span>
                                            <span className="font-medium text-neutral-900">৳{(price * c.quantity).toFixed(0)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-dashed border-neutral-300 py-6 space-y-4">
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="font-medium text-neutral-900">৳{lastOrderDetails.subtotal.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-[15px]">
                                    <span className="text-neutral-500">VAT</span>
                                    <span className="font-medium text-neutral-900">৳{lastOrderDetails.vatAmount.toFixed(0)}</span>
                                </div>
                                <div className="space-y-1">
                                    {lastOrderDetails.paymentMethods.map((pm, idx) => (
                                        <div key={idx} className="flex justify-between text-[15px] italic text-neutral-600">
                                            <span>{pm.method}</span>
                                            <span>৳{pm.amount.toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xl font-serif font-semibold text-primary mt-2">
                                    <span className="text-neutral-900">Total</span>
                                    <span className="text-yellow-500">৳{lastOrderDetails.total.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="bg-neutral-50 rounded-[4px] p-6 mt-2">
                                <h4 className="font-bold text-neutral-900 mb-2">Delivery Details:</h4>
                                <div className="text-neutral-600 text-[15px] space-y-1">
                                    <p>{lastOrderDetails.customer}</p>
                                    <p>N/A</p>
                                    <p>{lastOrderDetails.table}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Payment Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Confirm Payment</h3>
                        <p className="text-neutral-500 text-center mb-8">Are you sure you want to complete this payment?</p>

                        <div className="w-full bg-neutral-50 rounded-[4px] p-6 space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-500 font-medium">Subtotal</span>
                                <span className="text-[#0f172a] font-bold">BDT{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-500 font-medium">Payment Method</span>
                                <span className="text-[#0f172a] font-bold">{selectedPaymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-500 font-medium">Amount Received</span>
                                <span className="text-[#0f172a] font-bold">BDT{parseFloat(amountReceived || '0').toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-[4px] transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    processPayment();
                                }}
                                className="flex-1 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-[4px] transition-colors"
                            >
                                Complete Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Customer Modal */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[4px] w-full max-w-sm shadow-2xl overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#0f172a]">Add Customer</h3>
                            <button
                                onClick={() => setShowAddCustomerModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    placeholder="Enter customer name"
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-[4px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Phone</label>
                                <input
                                    type="text"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-[4px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowAddCustomerModal(false)}
                                className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-[4px] transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newCustomerName.trim()) {
                                        toast.error("Name is required");
                                        return;
                                    }

                                    try {
                                        const res = await fetch(`${apiUrl}/customers`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: newCustomerName,
                                                phone: newCustomerPhone,
                                                address: "N/A"
                                            })
                                        });

                                        if (res.ok) {
                                            const newCust = await res.json();
                                            setCustomers(prev => [newCust, ...prev]);
                                            setSelectedCustomer(newCust.name);
                                            setShowAddCustomerModal(false);
                                            setNewCustomerName("");
                                            setNewCustomerPhone("");
                                            toast.success("Customer added successfully");
                                        } else {
                                            const err = await res.json().catch(() => ({}));
                                            toast.error(err.message || "Failed to add customer");
                                        }
                                    } catch (err) {
                                        console.error("Add Customer Error:", err);
                                        toast.error("An error occurred: " + (err instanceof Error ? err.message : "Network error"));
                                    }
                                }}
                                className="px-6 py-2.5 bg-[#262626] hover:bg-blue-700 text-white font-bold rounded-[4px] transition-colors text-sm"
                            >
                                Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-[4px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-[4px] transition-all shadow-lg shadow-rose-100"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPOS;
