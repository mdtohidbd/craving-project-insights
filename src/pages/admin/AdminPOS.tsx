import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Search, Plus, Minus, Trash2, Printer, Divide, Clock, X, Utensils, ChevronDown, UserPlus, Info, Banknote, CreditCard, Smartphone, BadgePercent, Scissors, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
    _id: string;
    id: number;
    title: string;
    price: string | number;
    originalPrice?: string | number;
    category: string;
    image: string;
}

interface CartItem {
    menuItem: MenuItem;
    quantity: number;
}

interface OrderItem {
    menuItemId: string;
    title: string;
    price: number;
    quantity: number;
}

interface Table {
    _id: string;
    tableNumber: string;
    name?: string;
    capacity: number;
    status: string;
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
    createdAt: string;
}

interface CustomerType {
    _id: string;
    name: string;
    phone: string;
    address: string;
}

const AdminPOS = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<{ name: string, order: number }[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTable, setSelectedTable] = useState("Quick Sale (No Table)");
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
        onConfirm: () => {},
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

    // Fetch held orders
    useEffect(() => {
        const fetchHeldOrders = async () => {
            try {
                const res = await fetch(`${apiUrl}/orders/held/all`);
                if (res.ok) {
                    setHeldOrders(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch held orders:", err);
            }
        };
        fetchHeldOrders();
        const interval = setInterval(fetchHeldOrders, 30000);
        return () => clearInterval(interval);
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
        setConfirmModal({
            isOpen: true,
            title: "Clear Order",
            message: "Are you sure you want to clear the current order? This will remove all items from the cart.",
            onConfirm: () => {
                setCart([]);
                setSelectedTable("Quick Sale (No Table)");
                setSelectedCustomer("Walk-in");
                setDiscount(0);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                toast.success("Order cleared");
            }
        });
    };

    const subtotal = cart.reduce((acc, curr) => {
        const price = getPrice(curr.menuItem);
        return acc + (price || 0) * curr.quantity;
    }, 0);
    
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount - discount;

    // ===== PRINT HELPER: Opens a new window with receipt HTML and prints =====
    const printBillReceipt = (details: typeof lastOrderDetails) => {
        if (!details) return;
        const itemsHtml = details.items.map(c => {
            const p = getPrice(c.menuItem);
            return `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${c.menuItem.title} x${c.quantity}</span><span>BDT ${(p * c.quantity).toFixed(2)}</span></div>`;
        }).join('');
        const paymentMethodsHtml = details.paymentMethods.map(pm => 
            `<div style="display:flex;justify-content:space-between;"><span>${pm.method.toUpperCase()}</span><span>BDT ${pm.amount.toFixed(2)}</span></div>`
        ).join('');
        const paymentLabel = details.paymentMethods.length > 1 ? 'SPLIT' : details.paymentMethods[0].method.toUpperCase();
        const orderNum = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${details.orderId.slice(-4).toUpperCase()}`;

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
            <div class="center bold" style="font-size:20px;margin-bottom:15px;">MY RESTAURANT</div>
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
                <p style="font-size:12px;margin-top:10px;"><strong>TechSpire Labs</strong> | techspirelabs.com</p>
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
                }
            }, 500);
        } else {
            toast.error("Please allow pop-ups to print the receipt");
        }
    };

    const printKOTReceipt = (details: typeof lastOrderDetails) => {
        if (!details) return;
        const itemsHtml = details.items.map(c => 
            `<div style="font-weight:bold;font-size:16px;margin-bottom:10px;">${c.quantity}x ${c.menuItem.title}</div>`
        ).join('');
        const orderNum = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${details.orderId.slice(-4).toUpperCase()}`;

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
                    address: selectedTable || "Quick Sale (No Table)",
                    notes: "KOT Order"
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: getPrice(c.menuItem),
                    quantity: c.quantity
                })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "preparing",
                tableNumber: selectedTable,
                orderType: "dine-in"
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);
                
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
                setSelectedTable("Quick Sale (No Table)");
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
            
            const orderData = {
                customerInfo: {
                    name: selectedCustomer || "Walk-in",
                    phone: "N/A",
                    address: selectedTable || "Quick Sale (No Table)",
                    notes: "Bill Print"
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: getPrice(c.menuItem),
                    quantity: c.quantity
                })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "completed",
                tableNumber: selectedTable,
                orderType: "dine-in",
                paymentMethod: "pending"
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

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
                setSelectedTable("Quick Sale (No Table)");
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
                    address: selectedTable || "Quick Sale (No Table)",
                    notes: "Held order"
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: getPrice(c.menuItem),
                    quantity: c.quantity
                })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "held",
                isHeld: true,
                tableNumber: selectedTable,
                orderType: "dine-in"
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                toast.success("Order held successfully!");
                setCart([]);
                setSelectedTable("Quick Sale (No Table)");
                setSelectedCustomer("Walk-in");
                setDiscount(0);
                
                // Refresh held orders
                const heldRes = await fetch(`${apiUrl}/orders/held/all`);
                if (heldRes.ok) {
                    setHeldOrders(await heldRes.json());
                }

                // Update table status to Occupied if a table is selected
                if (selectedTable && selectedTable !== "Quick Sale (No Table)") {
                    const tableObj = tables.find(t => t.tableNumber === selectedTable);
                    if (tableObj) {
                        await fetch(`${apiUrl}/tables/${tableObj._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'Occupied' })
                        });
                        // Refresh tables local state
                        const tRes = await fetch(`${apiUrl}/tables`);
                        if (tRes.ok) setTables(await tRes.json());
                    }
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to hold order");
            }
        } catch (err) {
            console.error("Hold error:", err);
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
                    address: selectedTable || "Quick Sale (No Table)",
                    notes: `Payment method: ${selectedPaymentMethod}`
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: getPrice(c.menuItem),
                    quantity: c.quantity
                })),
                subtotal: subtotal || 0,
                tax: vatAmount || 0,
                discount: discount || 0,
                total: total || 0,
                status: "completed",
                paymentMethod: selectedPaymentMethod,
                amountReceived: parseFloat(amountReceived) || total,
                changeAmount: changeAmount || 0,
                tableNumber: selectedTable,
                orderType: "dine-in"
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);
                
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
                setSelectedTable("Quick Sale (No Table)");
                setSelectedCustomer("Walk-in");
                setDiscount(0);
                setAmountReceived('');
                setChangeAmount(0);

                // Update table status to Cleaning or Free if a table was selected
                if (selectedTable && selectedTable !== "Quick Sale (No Table)") {
                    const tableObj = tables.find(t => t.tableNumber === selectedTable);
                    if (tableObj) {
                        await fetch(`${apiUrl}/tables/${tableObj._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'Cleaning' })
                        });
                        // Refresh tables local state
                        const tRes = await fetch(`${apiUrl}/tables`);
                        if (tRes.ok) setTables(await tRes.json());
                    }
                }
            } else {
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
                    address: selectedTable || "Quick Sale (No Table)",
                    notes: "Split payment"
                },
                items: cart.map(c => ({
                    menuItemId: c.menuItem._id,
                    title: c.menuItem.title,
                    price: getPrice(c.menuItem),
                    quantity: c.quantity
                })),
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
                orderType: "dine-in"
            };

            const res = await fetch(`${apiUrl}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const data = await res.json();
                const orderId = data.orderId || data._id;
                setCurrentOrderId(orderId);

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
                setSelectedTable("Quick Sale (No Table)");
                setSelectedCustomer("Walk-in");
                setDiscount(0);

                // Update table status
                if (selectedTable && selectedTable !== "Quick Sale (No Table)") {
                    const tableObj = tables.find(t => t.tableNumber === selectedTable);
                    if (tableObj) {
                        await fetch(`${apiUrl}/tables/${tableObj._id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'Cleaning' })
                        });
                        // Refresh tables local state
                        const tRes = await fetch(`${apiUrl}/tables`);
                        if (tRes.ok) setTables(await tRes.json());
                    }
                }
            } else {
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
                    if (menuItem) {
                        return { menuItem, quantity: item.quantity };
                    }
                    return null;
                }).filter((item): item is CartItem => item !== null);

                setCart(newCart);
                setSelectedTable(order.tableNumber || "Quick Sale (No Table)");
                setSelectedCustomer(order.customerInfo.name || "Walk-in");
                setDiscount(order.discount || 0);
                
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

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="POS System">
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
                
                {/* Left Side: Menu Grid */}
                <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm min-h-0">
                    {/* Top Bar / Filters */}
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-neutral-400"
                                />
                            </div>
                            <button
                                onClick={() => setShowHeldOrdersModal(true)}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                                <Clock className="w-4 h-4" />
                                Held Orders ({heldOrders.length})
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedCategory === cat.name
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredItems.map(item => {
                                    const price = getPrice(item);
                                    const originalPrice = getOriginalPrice(item);
                                    return (
                                        <div 
                                            key={item._id} 
                                            onClick={() => addToCart(item)}
                                            className="bg-white border border-neutral-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-all group flex flex-col h-full"
                                        >
                                            <div className="h-32 bg-neutral-100 overflow-hidden">
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
                                            <div className="p-3 flex flex-col flex-1 justify-between">
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

                {/* Right Side: Current Order */}
                <div className="w-full lg:w-[420px] flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm shrink-0 min-h-0">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-lg font-semibold text-neutral-900">Current Order</h2>
                    </div>

                    {/* Dropdowns */}
                    <div className="p-4 border-b border-neutral-200 flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                                className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium"
                            >
                                <option value="Quick Sale (No Table)">Quick Sale (No Table)</option>
                                {tables.map(table => (
                                    <option key={table._id} value={table.tableNumber}>
                                        Table {table.tableNumber} {table.name ? `(${table.name})` : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={selectedCustomer}
                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                className="w-full bg-white border border-neutral-200 text-neutral-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer font-medium pr-8"
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
                            className="px-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-lg transition-colors flex-shrink-0"
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
                                        <div key={c.menuItem._id} className="flex items-center gap-2.5 bg-white border border-neutral-200 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            {/* Item Image */}
                                            <div className="w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
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
                                                <button onClick={() => updateQuantity(c.menuItem._id, -1)} className="p-1 hover:bg-white rounded text-neutral-600 transition-colors">
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-xs font-semibold w-5 text-center text-neutral-900">{c.quantity}</span>
                                                <button onClick={() => updateQuantity(c.menuItem._id, 1)} className="p-1 hover:bg-white rounded text-neutral-600 transition-colors">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            
                                            {/* Price and Remove */}
                                            <div className="flex flex-col items-end gap-0.5">
                                                <div className="text-xs font-bold text-neutral-900">BDT {(priceVal * c.quantity).toFixed(2)}</div>
                                                <button onClick={() => removeFromCart(c.menuItem._id)} className="p-0.5 hover:bg-rose-100 rounded text-rose-500 transition-colors">
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
                    <div className="p-3 border-t border-neutral-200 bg-neutral-50 space-y-2 text-xs shrink-0">
                        <div className="flex justify-between text-neutral-700 font-medium">
                            <span>Subtotal</span>
                            <span>BDT {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700 font-medium items-center">
                            <span>VAT ({vatRate}%)</span>
                            <span>BDT {vatAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700 font-medium items-center">
                            <span>Discount</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="w-20 bg-white border border-neutral-300 rounded px-2 py-1 text-right text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    min="0"
                                    max={subtotal}
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                            <span>Total</span>
                            <span className="text-primary">BDT {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Buttons */}
                    <div className="p-3 border-t border-neutral-200 grid grid-cols-3 gap-2 shrink-0">
                        <button
                            onClick={() => handlePayment('Cash')}
                            disabled={cart.length === 0 || isProcessing}
                            className="py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow text-xs"
                        >
                            Cash
                        </button>
                        <button
                            onClick={() => handlePayment('Card')}
                            disabled={cart.length === 0 || isProcessing}
                            className="py-2.5 bg-blue-400 hover:bg-blue-500 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow text-xs"
                        >
                            Card
                        </button>
                        <button
                            onClick={() => handlePayment('MFS')}
                            disabled={cart.length === 0 || isProcessing}
                            className="py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow text-xs"
                        >
                            MFS
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3 border-t border-neutral-200 grid grid-cols-3 gap-2 shrink-0">
                        <button
                            onClick={handlePrintKOT}
                            disabled={cart.length === 0}
                            className="group relative py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm hover:shadow text-xs"
                            title="Save order & print KOT"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print KOT
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Save order & print KOT
                            </span>
                        </button>
                        <button
                            onClick={handlePrintBill}
                            disabled={cart.length === 0}
                            className="py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm hover:shadow text-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Bill
                        </button>
                        <button
                            onClick={handleSplit}
                            disabled={cart.length === 0}
                            className="py-2 bg-neutral-400 hover:bg-neutral-500 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm hover:shadow text-xs"
                        >
                            <Divide className="w-3.5 h-3.5" />
                            Split
                        </button>
                        <button
                            onClick={handleHold}
                            disabled={cart.length === 0}
                            className="py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm hover:shadow text-xs"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Hold
                        </button>
                        <button
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="py-2 col-span-2 bg-red-500 hover:bg-red-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm hover:shadow text-xs"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-[#10b981] p-6 text-center text-white relative shrink-0">
                            <button 
                                onClick={() => setShowPaymentModal(false)} 
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
                            <div className="flex bg-neutral-100 p-1 rounded-xl mb-4">
                                <button className="flex-1 py-2 bg-white rounded-lg shadow-sm text-[#10b981] font-medium flex items-center justify-center gap-2 text-sm">
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
                                    className={`flex items-center justify-between border ${showDiscountInput ? 'border-orange-500 bg-orange-50/30' : 'border-neutral-200'} rounded-lg p-3 cursor-pointer hover:bg-neutral-50 transition-all`}
                                >
                                    <div className={`flex items-center gap-2 ${showDiscountInput ? 'text-orange-600' : 'text-neutral-600'} font-medium text-sm`}>
                                        <BadgePercent className="w-4 h-4" /> Add Discount
                                    </div>
                                    <span className={`${showDiscountInput ? 'text-orange-500' : 'text-neutral-400'} text-sm font-medium`}>
                                        {showDiscountInput ? 'Hide' : 'Show'}
                                    </span>
                                </div>

                                {showDiscountInput && (
                                    <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex bg-white p-1 rounded-lg border border-neutral-200">
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

                                        <div className="relative border border-neutral-200 rounded-xl bg-white overflow-hidden focus-within:border-orange-400 transition-colors">
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
                                                    className="py-1.5 bg-white border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-xs font-bold text-neutral-700 transition-all"
                                                >
                                                    {discountType === 'percentage' ? `${v}%` : `BDT${v}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="mb-4">
                                <label className="block text-sm text-neutral-600 mb-2">Payment Method</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => {
                                            setSelectedPaymentMethod('Cash');
                                            setAmountReceived('');
                                            setChangeAmount(-total);
                                        }}
                                        className={`rounded-xl py-3 flex flex-col items-center gap-1 transition-colors ${
                                            selectedPaymentMethod === 'Cash' 
                                            ? 'border-2 border-[#10b981] bg-[#10b981]/5 text-[#10b981]' 
                                            : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                                        }`}
                                    >
                                        <Banknote className="w-6 h-6" />
                                        <span className="font-medium text-sm">Cash</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedPaymentMethod('Card');
                                            setAmountReceived(total.toFixed(2));
                                            setChangeAmount(0);
                                        }}
                                        className={`rounded-xl py-3 flex flex-col items-center gap-1 transition-colors ${
                                            selectedPaymentMethod === 'Card' 
                                            ? 'border-2 border-[#10b981] bg-[#10b981]/5 text-[#10b981]' 
                                            : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                                        }`}
                                    >
                                        <CreditCard className="w-6 h-6" />
                                        <span className="font-medium text-sm">Card</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedPaymentMethod('MFS');
                                            setAmountReceived(total.toFixed(2));
                                            setChangeAmount(0);
                                        }}
                                        className={`rounded-xl py-3 flex flex-col items-center gap-1 transition-colors ${
                                            selectedPaymentMethod === 'MFS' 
                                            ? 'border-2 border-[#10b981] bg-[#10b981]/5 text-[#10b981]' 
                                            : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                                        }`}
                                    >
                                        <Smartphone className="w-6 h-6" />
                                        <span className="font-medium text-sm">Mobile</span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Received / Change */}
                            <div className="mb-6">
                                {selectedPaymentMethod === 'Cash' ? (
                                    <>
                                        <label className="block text-sm text-neutral-600 mb-2">Amount Received</label>
                                        <div className="relative border-2 border-[#10b981] rounded-xl overflow-hidden flex items-center mb-4">
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
                                                    className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
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
                                            className="w-full py-2.5 bg-[#d1fae5] text-[#059669] font-medium rounded-lg mb-4 hover:bg-[#a7f3d0] transition-colors text-sm"
                                        >
                                            Exact Amount (BDT{total.toFixed(2)})
                                        </button>

                                        {/* Change to Return */}
                                        <div className="flex justify-between items-center p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
                                            <span className="text-[#047857] font-medium">Change to Return</span>
                                            <span className={`text-xl font-bold ${changeAmount >= 0 ? 'text-[#059669]' : 'text-red-500'}`}>
                                                BDT{changeAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-6 bg-[#eff6ff] border border-blue-100 rounded-2xl text-center py-8">
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
                                    className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={isProcessing || parseFloat(amountReceived) < total}
                                    className="flex-1 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                            <div className="flex bg-neutral-100 p-1 rounded-xl mb-4">
                                <button 
                                    onClick={() => {
                                        setShowSplitModal(false);
                                        setShowPaymentModal(true);
                                    }}
                                    className="flex-1 py-2 text-neutral-500 font-medium flex items-center justify-center gap-2 text-sm hover:text-neutral-700 transition-colors"
                                >
                                    <Banknote className="w-4 h-4" /> Single Payment
                                </button>
                                <button className="flex-1 py-2 bg-white rounded-lg shadow-sm text-[#10b981] font-medium flex items-center justify-center gap-2 text-sm">
                                    <Scissors className="w-4 h-4" /> Split Payment
                                </button>
                            </div>

                            {/* Add Discount */}
                            <div className="mb-4">
                                <div 
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className={`flex items-center justify-between border ${showDiscountInput ? 'border-orange-500 bg-orange-50/30' : 'border-neutral-200'} rounded-lg p-3 cursor-pointer hover:bg-neutral-50 transition-all`}
                                >
                                    <div className={`flex items-center gap-2 ${showDiscountInput ? 'text-orange-600' : 'text-neutral-600'} font-medium text-sm`}>
                                        <BadgePercent className="w-4 h-4" /> Add Discount
                                    </div>
                                    <span className={`${showDiscountInput ? 'text-orange-500' : 'text-neutral-400'} text-sm font-medium`}>
                                        {showDiscountInput ? 'Hide' : 'Show'}
                                    </span>
                                </div>

                                {showDiscountInput && (
                                    <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex bg-white p-1 rounded-lg border border-neutral-200">
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

                                        <div className="relative border border-neutral-200 rounded-xl bg-white overflow-hidden focus-within:border-orange-400 transition-colors">
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
                                                    className="py-1.5 bg-white border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-xs font-bold text-neutral-700 transition-all"
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
                                        <div key={idx} className="bg-neutral-50/50 rounded-2xl p-4 flex items-center gap-4">
                                            <div className={`${colorMap[p.method as keyof typeof colorMap]} w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0`}>
                                                {iconMap[p.method as keyof typeof iconMap]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-neutral-600 mb-1">{labelMap[p.method as keyof typeof labelMap]}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 relative border border-neutral-200 rounded-xl overflow-hidden flex items-center bg-white focus-within:border-[#10b981] transition-colors">
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
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-2 mb-6">
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
                                    className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processSplitPayment}
                                    disabled={isProcessing || splitPayments.reduce((sum, p) => sum + p.amount, 0) < total}
                                    className="flex-1 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors disabled:bg-neutral-300 disabled:text-white disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processing...' : 'Proceed'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Held Orders Modal */}
            {showHeldOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-neutral-900">Held Orders</h3>
                                <button
                                    onClick={() => setShowHeldOrdersModal(false)}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
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
                                        <div key={order._id} className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors">
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
                                                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-sm"
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

            {/* KOT Preview Modal */}
            {showKOTPreview && lastOrderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-orange-400 border-b-4">
                            <h3 className="text-xl font-medium text-neutral-800">Kitchen Order Ticket</h3>
                            <div className="flex gap-2">
                                <button onClick={() => printKOTReceipt(lastOrderDetails)} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowKOTPreview(false)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar text-center">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">KITCHEN ORDER</h2>
                            <p className="text-sm text-neutral-500 mb-4">#{lastOrderDetails.orderId.slice(-6).toUpperCase()}</p>
                            <p className="text-sm text-neutral-600 mb-6">{lastOrderDetails.date}</p>
                            <div className="border-t border-b border-dashed border-neutral-300 py-4 mb-4 text-left">
                                {lastOrderDetails.items.map((c, idx) => (
                                    <div key={idx} className="flex justify-between mb-2">
                                        <span className="font-bold text-lg">{c.quantity}x {c.menuItem.title}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-neutral-900">*** END OF ORDER ***</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Bill Preview Modal */}
            {showBillPreview && lastOrderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-yellow-400 border-b-4">
                            <h3 className="text-xl font-medium text-neutral-800">Order Slip</h3>
                            <div className="flex gap-2">
                                <button onClick={() => printBillReceipt(lastOrderDetails)} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
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
                                <h2 className="text-3xl font-serif font-bold text-[#0f172a] mb-2">Cravings...</h2>
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
                                <div className="flex justify-between text-xl font-black mt-2">
                                    <span className="text-neutral-900">Total</span>
                                    <span className="text-yellow-500">৳{lastOrderDetails.total.toFixed(0)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-neutral-50 rounded-2xl p-6 mt-2">
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
                        
                        <div className="w-full bg-neutral-50 rounded-2xl p-6 space-y-4 mb-8">
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
                                className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-2xl transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    processPayment();
                                }}
                                className="flex-1 py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-2xl transition-colors"
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
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6">
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
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
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
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowAddCustomerModal(false)}
                                className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-colors text-sm"
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
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors text-sm"
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
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-100"
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
