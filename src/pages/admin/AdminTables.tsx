import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { 
    Plus, Edit, Trash2, Users, Clock, CheckCircle, XCircle, X, RefreshCcw, Filter, 
    Sparkles, FileText, Receipt, Search, Hash, ArrowUpDown, LayoutGrid, Check, AlertCircle, ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Table {
    _id: string;
    tableNumber: string;
    name?: string;
    capacity: number;
    sortOrder: number;
    status: "Free" | "Occupied" | "Reserved" | "Cleaning";
    currentOrder?: string;
    occupiedTime?: string;
    server?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface TableOrder {
    _id: string;
    items: Array<{ title: string; quantity: number; price: number }>;
    subtotal: number;
    tax: number;
    total: number;
    createdAt?: string;
}

const formatOrderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending": return "Waiting in Kitchen";
        case "preparing": return "Cooking";
        case "ready": return "Ready to Serve";
        case "served": return "Served";
        default: return status || "Occupied";
    }
};

const AdminTables = () => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({
        tableNumber: "",
        name: "",
        capacity: 4,
        sortOrder: 0
    });

    // Table status modal state
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        variant?: "danger" | "warning" | "info";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        variant: "danger",
        onConfirm: () => {},
    });
    const [tableServiceState, setTableServiceState] = useState<Record<string, { kotSent: boolean; billPrinted: boolean }>>({});
    const [tableOrderStatuses, setTableOrderStatuses] = useState<Record<string, string>>({});
    const [activeOrders, setActiveOrders] = useState<Record<string, TableOrder>>({});
    const [processingServiceTableId, setProcessingServiceTableId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const [tablesRes, ordersRes] = await Promise.all([
                fetch(`${apiUrl}/tables`),
                fetch(`${apiUrl}/orders`)
            ]);
            
            if (tablesRes.ok) {
                const data = await tablesRes.json();
                setTables(data);
                
                if (ordersRes.ok) {
                    const allOrders = await ordersRes.json();
                    const statusMap: Record<string, string> = {};
                    const ordersMap: Record<string, TableOrder> = {};
                    data.forEach((table: Table) => {
                        if (table.status === 'Occupied') {
                            const order = allOrders.find((o: any) => 
                                (o._id === table.currentOrder || o.tableNumber === table.tableNumber) && 
                                o.orderType === 'dine-in' && 
                                o.status !== 'completed' && 
                                o.status !== 'cancelled'
                            );
                            if (order) {
                                statusMap[table._id] = order.status;
                                ordersMap[table._id] = order;
                            }
                        }
                    });
                    setTableOrderStatuses(statusMap);
                    setActiveOrders(ordersMap);
                }
            } else {
                throw new Error('Failed to fetch tables');
            }
        } catch (error) {
            console.error("Failed to fetch tables:", error);
            setTables([
                { _id: "1", tableNumber: "1", capacity: 4, sortOrder: 1, status: "Free" },
                { _id: "2", tableNumber: "2", capacity: 4, sortOrder: 2, status: "Cleaning" },
                { _id: "3", tableNumber: "3", capacity: 4, sortOrder: 3, status: "Cleaning" },
                { _id: "4", tableNumber: "4", capacity: 8, sortOrder: 4, status: "Free" }
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        setTableServiceState((prev) => {
            const next: Record<string, { kotSent: boolean; billPrinted: boolean }> = {};
            tables.forEach((table) => {
                next[table._id] = prev[table._id] || { kotSent: false, billPrinted: false };
            });
            return next;
        });
    }, [tables]);

    const getOrderForTable = async (table: Table): Promise<TableOrder | null> => {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        if (table.currentOrder) {
            const orderRes = await fetch(`${apiUrl}/orders/${table.currentOrder}`);
            if (orderRes.ok) {
                return await orderRes.json();
            }
        }

        const allOrdersRes = await fetch(`${apiUrl}/orders`);
        if (!allOrdersRes.ok) return null;
        const allOrders = await allOrdersRes.json();
        const matched = allOrders.find(
            (o: any) =>
                o.tableNumber === table.tableNumber &&
                o.orderType === "dine-in" &&
                o.status !== "cancelled"
        );
        return matched || null;
    };

    const openPrintWindow = (html: string, errorText: string) => {
        const printWindow = window.open("", "_blank", "width=420,height=640");
        if (!printWindow) {
            toast.error(errorText);
            return false;
        }

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.focus();
                printWindow.print();
            }
        }, 350);
        return true;
    };

    const printKOTForOrder = (table: Table, order: TableOrder) => {
        const itemsHtml = order.items
            .map(
                (item) =>
                    `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${item.title} x${item.quantity}</span><span>${item.quantity}</span></div>`
            )
            .join("");
        const orderNum = `#${order._id.slice(-6).toUpperCase()}`;
        const date = new Date(order.createdAt || Date.now()).toLocaleString("en-GB");

        const html = `<!DOCTYPE html><html><head><title>${t("pos.kot", "KOT")}</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
        </style></head><body>
            <div class="center" style="font-size:18px;font-weight:bold;margin-bottom:10px;">${t("pos.kitchen_order", "KITCHEN ORDER")}</div>
            <div class="dashed"></div>
            <div class="row"><span>${t("pos.table", "Table")}</span><span>${table.tableNumber}</span></div>
            <div class="row"><span>${t("pos.order", "Order")}</span><span>${orderNum}</span></div>
            <div class="row"><span>${t("pos.time", "Time")}</span><span>${date}</span></div>
            <div class="dashed"></div>
            ${itemsHtml}
            <div class="dashed"></div>
            <div class="center" style="margin-top:8px;">${t("pos.kot", "*** KOT ***")}</div>
        </body></html>`;

        return openPrintWindow(html, t("tables.allow_popups_kot", "Please allow pop-ups to print the KOT"));
    };

    const printBillForOrder = (table: Table, order: TableOrder) => {
        const itemsHtml = order.items
            .map(
                (item) =>
                    `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${item.title} x${item.quantity}</span><span>${t("pos.bdt", "BDT $")}{(item.price * item.quantity).toFixed(2)}</span></div>`
            )
            .join("");
        const orderNum = `#${order._id.slice(-6).toUpperCase()}`;
        const date = new Date(order.createdAt || Date.now()).toLocaleString("en-GB");

        const html = `<!DOCTYPE html><html><head><title>${t("pos.bill_receipt", "Bill Receipt")}</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin: 8px 0; }
        </style></head><body>
            <div class="center" style="font-size:20px;font-weight:bold;margin-bottom:10px;">${settings.websiteName.toUpperCase()}</div>
            <div class="dashed"></div>
            <div class="row"><span>${t("pos.table", "Table")}</span><span>${table.tableNumber}</span></div>
            <div class="row"><span>${t("pos.order", "Order")}</span><span>${orderNum}</span></div>
            <div class="row"><span>${t("pos.date", "Date")}</span><span>${date}</span></div>
            <div class="dashed"></div>
            ${itemsHtml}
            <div class="dashed"></div>
            <div class="row"><span>${t("pos.subtotal", "Subtotal")}</span><span>${t("pos.bdt", "BDT $")}{(order.subtotal || 0).toFixed(2)}</span></div>
            <div class="row"><span>${t("pos.tax", "Tax")}</span><span>${t("pos.bdt", "BDT $")}{(order.tax || 0).toFixed(2)}</span></div>
            <div class="total-row"><span>${t("pos.total", "TOTAL")}</span><span>${t("pos.bdt", "BDT $")}{(order.total || 0).toFixed(2)}</span></div>
        </body></html>`;

        return openPrintWindow(html, t("tables.allow_popups_bill", "Please allow pop-ups to print the bill"));
    };

    const handleTableServiceAction = async (table: Table, action: "kot" | "bill") => {
        if (action === "bill" && table.status === "Free") {
            toast.error(t("tables.table_is_free", `Table ${table.tableNumber} is free. Please place an order first.`, { tableNumber: table.tableNumber }));
            return;
        }

        try {
            setProcessingServiceTableId(table._id);
            const order = await getOrderForTable(table);
            if (!order) {
                toast.error(t("tables.no_active_order", `No active order found for Table ${table.tableNumber}`, { tableNumber: table.tableNumber }));
                return;
            }

            const printed = action === "kot" ? printKOTForOrder(table, order) : printBillForOrder(table, order);
            if (!printed) return;

            setTableServiceState((prev) => {
                const current = prev[table._id] || { kotSent: false, billPrinted: false };
                return {
                    ...prev,
                    [table._id]: {
                        ...current,
                        kotSent: action === "kot" ? true : current.kotSent,
                        billPrinted: action === "bill" ? true : current.billPrinted,
                    },
                };
            });

            toast.success(
                action === "kot"
                    ? t("tables.kot_printed", `KOT printed for Table ${table.tableNumber}`, { tableNumber: table.tableNumber })
                    : t("tables.bill_printed", `Bill printed for Table ${table.tableNumber}`, { tableNumber: table.tableNumber })
            );
        } catch (error) {
            console.error(`Failed to process ${action}:`, error);
            toast.error(t("pos.failed_to", `Failed to {var0}`, { var0: action === "kot" ? "print KOT" : "print bill" }));
        } finally {
            setProcessingServiceTableId(null);
        }
    };

    const handleOpenModal = (table?: Table) => {
        if (table) {
            setEditingTable(table);
            setFormData({
                tableNumber: table.tableNumber,
                name: table.name || "",
                capacity: table.capacity,
                sortOrder: table.sortOrder || (tables.findIndex(t => t._id === table._id) + 1)
            });
        } else {
            setEditingTable(null);
            const nextSort = tables.length > 0 ? Math.max(...tables.map(t => t.sortOrder || 0)) + 1 : 1;
            const nextNum = (tables.length + 1).toString();
            setFormData({ tableNumber: nextNum, name: "", capacity: 4, sortOrder: nextSort });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            const response = await fetch(editingTable ? `${apiUrl}/tables/${editingTable._id}` : `${apiUrl}/tables`, {
                method: editingTable ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || t("tables.save_failed", "Failed to save table"));
            }
            
            toast.success(editingTable ? t("tables.update_success", "Table updated successfully") : t("tables.add_success", "Table added successfully"));
            setIsModalOpen(false);
            fetchTables();
        } catch (err: any) {
            console.error("Failed to save table:", err);
            toast.error(err.message || t("tables.save_failed", "Failed to save table"));
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: t("tables.delete_title", "Delete Table"),
            message: t("tables.delete_confirm", "Are you sure you want to delete this table? This action cannot be undone."),
            confirmText: t("common.delete", "Delete"),
            variant: "danger",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/tables/${id}`, { method: "DELETE" });
                    toast.success(t("tables.delete_success", "Table deleted successfully"));
                    fetchTables();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error("Failed to delete table:", err);
                    toast.error(t("tables.delete_failed", "Failed to delete table"));
                }
            }
        });
    };

    const performStatusUpdate = async (tableId: string, status: string, additionalData: Record<string, any> = {}) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            await fetch(`${apiUrl}/tables/${tableId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...additionalData })
            });

            setIsStatusModalOpen(false);
            fetchTables();
            toast.success(t("tables.status_updated", `Table status updated to ${status}`, { status }));
        } catch (err) {
            console.error("Failed to update table status:", err);
            toast.error(t("tables.status_update_failed", "Failed to update status"));
        }
    };

    const handleStatusAction = async (action: string) => {
        if (!selectedTable) return;

        let newStatus = selectedTable.status;
        let updateData: Record<string, any> = {};

        switch (action) {
            case 'newOrder':
                if (selectedTable.status !== 'Free') {
                    toast.error(t("tables.table_must_be_free", `Table ${selectedTable.tableNumber} is currently ${selectedTable.status}. It must be Free before creating a new order.`, { tableNumber: selectedTable.tableNumber, status: selectedTable.status }));
                    return;
                }
                window.location.href = `/admin/pos?table=${selectedTable._id}`;
                return;
            case 'addItems':
                window.location.href = `/admin/pos?table=${selectedTable._id}`;
                return;
            case 'reserve':
                newStatus = 'Reserved';
                break;
            case 'markCleaning':
                newStatus = 'Cleaning';
                break;
            case 'markFree':
                if (selectedTable.status === 'Occupied') {
                    setConfirmModal({
                        isOpen: true,
                        title: t("tables.mark_free_title", "Mark Table as Free?"),
                        message: t("tables.mark_free_confirm", `Table ${selectedTable.tableNumber} is currently occupied. Do you want to cancel the active order and mark it as free?`, { tableNumber: selectedTable.tableNumber }),
                        confirmText: t("tables.mark_free_btn", "Yes, Mark Free"),
                        variant: "warning",
                        onConfirm: async () => {
                            await performStatusUpdate(selectedTable._id, 'Free', { 
                                currentOrder: undefined, 
                                occupiedTime: undefined, 
                                server: undefined 
                            });
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                        }
                    });
                    return;
                }
                newStatus = 'Free';
                updateData = { currentOrder: undefined, occupiedTime: undefined, server: undefined };
                break;
            case 'edit':
                handleOpenModal(selectedTable);
                setIsStatusModalOpen(false);
                return;
            case 'delete':
                handleDelete(selectedTable._id);
                setIsStatusModalOpen(false);
                return;
        }

        await performStatusUpdate(selectedTable._id, newStatus, updateData);
    };

    const counts = {
        All: tables.length,
        Available: tables.filter(t => t.status === "Free").length,
        Occupied: tables.filter(t => t.status === "Occupied").length,
        Reserved: tables.filter(t => t.status === "Reserved").length,
        "KOT Sent": tables.filter(t => tableServiceState[t._id]?.kotSent).length,
        "Bill Printed": tables.filter(t => tableServiceState[t._id]?.billPrinted).length,
        Cleaning: tables.filter(t => t.status === "Cleaning").length
    };

    const filteredTables = tables.filter(table => {
        const matchesSearch = table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (table.name && table.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (!matchesSearch) return false;

        if (activeFilter === "All") return true;
        if (activeFilter === "Available") return table.status === "Free";
        if (activeFilter === "Occupied") return table.status === "Occupied";
        if (activeFilter === "Reserved") return table.status === "Reserved";
        if (activeFilter === "KOT Sent") return !!tableServiceState[table._id]?.kotSent;
        if (activeFilter === "Bill Printed") return !!tableServiceState[table._id]?.billPrinted;
        if (activeFilter === "Cleaning") return table.status === "Cleaning";
        return true;
    });

    return (
        <AdminLayout title={t("tables.tables", "Tables")}>
            <div className="space-y-6 lg:space-y-8 bg-[#f8fafc] min-h-screen -m-4 lg:-m-8 p-4 lg:p-8 font-sans">
                {/* Header & Quick Metrics Row */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t("tables.tables", "Tables")}</h1>
                                    <button 
                                        onClick={fetchTables}
                                        title="Refresh Tables"
                                        className={`p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90 text-slate-400 hover:text-slate-700 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">Real-time floor overview & table management</p>
                            </div>
                        </div>

                        {/* Add Table Button */}
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs lg:text-sm font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 group cursor-pointer"
                        >
                            <Plus className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:rotate-90" />
                            <span>{t("tables.add_table", "Add Table")}</span>
                        </button>
                    </div>

                    {/* Quick Metric Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tables</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{counts.All}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                                {counts.All}
                            </div>
                        </div>
                        <div className="bg-emerald-50/60 p-4 lg:p-5 rounded-2xl border border-emerald-200/70 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">Available</p>
                                <p className="text-2xl font-black text-emerald-700 mt-1">{counts.Available}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center font-bold">
                                {counts.Available}
                            </div>
                        </div>
                        <div className="bg-rose-50/60 p-4 lg:p-5 rounded-2xl border border-rose-200/70 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">Occupied</p>
                                <p className="text-2xl font-black text-rose-700 mt-1">{counts.Occupied}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center font-bold">
                                {counts.Occupied}
                            </div>
                        </div>
                        <div className="bg-sky-50/60 p-4 lg:p-5 rounded-2xl border border-sky-200/70 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-extrabold text-sky-600 uppercase tracking-wider">Cleaning</p>
                                <p className="text-2xl font-black text-sky-700 mt-1">{counts.Cleaning}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-600 flex items-center justify-center font-bold">
                                {counts.Cleaning}
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 lg:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                            {Object.entries(counts).map(([label, count]) => (
                                <button
                                    key={label}
                                    onClick={() => setActiveFilter(label)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                                        activeFilter === label 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <span>{t(`tables.${label.toLowerCase().replace(' ', '_')}`, label)}</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                                        activeFilter === label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64 shrink-0">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search table..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <div key={idx} className="border-2 border-slate-100 rounded-3xl p-5 bg-white animate-pulse space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="h-8 w-14 bg-slate-200 rounded-xl"></div>
                                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="h-4 w-24 bg-slate-200 rounded-lg"></div>
                                <div className="pt-6 flex justify-end gap-2">
                                    <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                                    <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        ))
                    ) : filteredTables.map((table) => {
                        const isFree = table.status === "Free";
                        const isOccupied = table.status === "Occupied";
                        const isReserved = table.status === "Reserved";
                        const isCleaning = table.status === "Cleaning";

                        return (
                            <div 
                                key={table._id}
                                onClick={() => {
                                    setSelectedTable(table);
                                    setIsStatusModalOpen(true);
                                }}
                                className={`group relative cursor-pointer border-2 rounded-3xl p-5 lg:p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-xl ${
                                    isFree ? 'bg-emerald-50/50 border-emerald-300/80 hover:border-emerald-500 text-emerald-950 shadow-emerald-100/50' :
                                    isReserved ? 'bg-purple-50/50 border-purple-300/80 hover:border-purple-500 text-purple-950 shadow-purple-100/50' :
                                    isOccupied ? 'bg-rose-50/50 border-rose-300/80 hover:border-rose-500 text-rose-950 shadow-rose-100/50' :
                                    'bg-sky-50/50 border-sky-300/80 hover:border-sky-500 text-sky-950 shadow-sky-100/50'
                                }`}
                            >
                                {/* Top Header: Table Number & Status Pill */}
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="text-2xl lg:text-4xl font-black tracking-tight leading-none">{table.tableNumber}</h3>
                                        <div className="flex items-center gap-1.5 mt-2 opacity-80">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-xs font-extrabold">{table.capacity} {t("tables.seats", "seats")}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                                        isFree ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800' :
                                        isReserved ? 'bg-purple-100/80 border-purple-300 text-purple-800' :
                                        isOccupied ? 'bg-rose-100/80 border-rose-300 text-rose-800' :
                                        'bg-sky-100/80 border-sky-300 text-sky-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            isFree ? 'bg-emerald-500 animate-pulse' :
                                            isReserved ? 'bg-purple-500' :
                                            isOccupied ? 'bg-rose-500 animate-pulse' :
                                            'bg-sky-500 animate-pulse'
                                        }`} />
                                        <span>
                                            {isFree ? t("tables.free", "FREE") : 
                                             isOccupied && tableOrderStatuses[table._id] ? formatOrderStatus(tableOrderStatuses[table._id]) : 
                                             isCleaning ? t("tables.cleaning", "Cleaning") : table.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Service Quick Print Actions (Only for occupied tables) */}
                                {isOccupied && (
                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTableServiceAction(table, "kot");
                                            }}
                                            disabled={processingServiceTableId === table._id}
                                            className={`py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                tableServiceState[table._id]?.kotSent
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                    : "bg-white/80 hover:bg-white text-blue-700 border-blue-200 hover:shadow-sm"
                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            {processingServiceTableId === table._id ? "..." : t("tables.kot", "KOT")}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTableServiceAction(table, "bill");
                                            }}
                                            disabled={processingServiceTableId === table._id}
                                            className={`py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                tableServiceState[table._id]?.billPrinted
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                                    : "bg-white/80 hover:bg-white text-emerald-700 border-emerald-200 hover:shadow-sm"
                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            {processingServiceTableId === table._id ? "..." : t("tables.bill", "Bill")}
                                        </button>
                                    </div>
                                )}

                                {/* Bottom Quick Edit / Delete Buttons */}
                                <div className="mt-6 pt-3 border-t border-slate-950/5 flex justify-end items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(table); }}
                                        title={t("tables.edit_table", "Edit Table")}
                                        className="p-2 bg-white/90 hover:bg-white rounded-xl text-slate-600 hover:text-blue-600 shadow-sm border border-slate-200/60 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(table._id); }}
                                        title={t("common.delete", "Delete")}
                                        className="p-2 bg-white/90 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 shadow-sm border border-slate-200/60 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!loading && filteredTables.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                        <XCircle className="w-16 h-16 mb-4 opacity-30 text-slate-300" />
                        <p className="text-xl font-bold text-slate-800">{t("tables.no_tables_found", "No tables found")}</p>
                        <p className="text-sm text-slate-500 mt-1">{t("tables.try_changing_filter", "Try changing your filter or add a new table.")}</p>
                    </div>
                )}
            </div>

            {/* Table Add / Edit Modal (Screenshot 2 Redesign) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 sm:p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingTable ? t("tables.edit_table", "Edit Table") : t("tables.add_table", "Add Table")}
                                </h3>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">Configure table number, seating capacity, and sequence</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Table Number */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                    {t("tables.table_number", "Table Number")}
                                </label>
                                <div className="relative">
                                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.tableNumber}
                                        onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-extrabold text-slate-900"
                                        placeholder="e.g., 1, T2"
                                    />
                                </div>
                            </div>

                            {/* Capacity & Quick Capacity Selectors */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                        {t("tables.capacity", "Seats / Capacity")}
                                    </label>
                                    <span className="text-[11px] font-bold text-blue-600">{formData.capacity} Seats Selected</span>
                                </div>
                                <div className="relative mb-3">
                                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-extrabold text-slate-900"
                                    />
                                </div>

                                {/* Quick Capacity Selectors */}
                                <div className="flex items-center gap-1.5">
                                    {[2, 4, 6, 8, 10].map((cap) => (
                                        <button
                                            key={cap}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, capacity: cap })}
                                            className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                                formData.capacity === cap 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            {cap}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sequence */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                                    {t("tables.sequence", "Sequence")}
                                </label>
                                <div className="relative">
                                    <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        required
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all text-sm font-extrabold text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-colors text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    {t("common.cancel", "Cancel")}
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/25 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>{editingTable ? t("common.update", "Update") : t("common.create", "Create")}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Action / Detail Modal (Screenshot 3 Redesign) */}
            {isStatusModalOpen && selectedTable && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                            <div className="flex items-center gap-3">
                                <div className={`w-3.5 h-3.5 rounded-full ${
                                    selectedTable.status === "Free" ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                    selectedTable.status === "Reserved" ? 'bg-purple-500' :
                                    selectedTable.status === "Occupied" ? 'bg-rose-500 animate-pulse' :
                                    'bg-sky-500'
                                }`} />
                                <h3 className="text-xl font-black text-slate-900">{t("tables.table", "Table")} {selectedTable.tableNumber}</h3>
                            </div>
                            <button onClick={() => setIsStatusModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Status Row */}
                        <div className="flex justify-between items-center mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                            <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider">{t("tables.status", "Status")}</span>
                            <div className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                selectedTable.status === "Free" ? 'bg-emerald-100 text-emerald-800' :
                                selectedTable.status === "Reserved" ? 'bg-purple-100 text-purple-800' :
                                selectedTable.status === "Occupied" ? 'bg-rose-100 text-rose-800' :
                                'bg-sky-100 text-sky-800'
                            }`}>
                                {selectedTable.status === "Free" ? t("tables.available", "Available") : (selectedTable.status === "Occupied" && tableOrderStatuses[selectedTable._id] ? formatOrderStatus(tableOrderStatuses[selectedTable._id]) : t(`tables.status_${selectedTable.status.toLowerCase()}`, selectedTable.status))}
                            </div>
                        </div>

                        {/* Order Details if Occupied */}
                        {selectedTable.status === "Occupied" && activeOrders[selectedTable._id] && (
                            <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Order Summary</span>
                                    </h4>
                                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Active</span>
                                </div>
                                <div className="space-y-2.5 max-h-[140px] overflow-y-auto no-scrollbar">
                                    {activeOrders[selectedTable._id].items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-bold text-slate-800">{item.title}</span>
                                            </div>
                                            <span className="font-extrabold text-slate-900">৳{(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                                    <span className="font-black text-rose-600 text-sm">৳{activeOrders[selectedTable._id].total.toFixed(0)}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {selectedTable.status === "Occupied" ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleStatusAction('addItems')}
                                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{t("tables.add_items", "Add Items")}</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (selectedTable._id) {
                                                window.location.href = `/admin/pos?table=${selectedTable._id}&checkout=true`;
                                            } else {
                                                toast.error(t("tables.no_active_order_ref", "No active order reference found"));
                                            }
                                        }}
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
                                    >
                                        <Receipt className="w-4 h-4" />
                                        <span>{t("tables.complete_payment", "Complete Payment")}</span>
                                    </button>
                                </div>
                            ) : selectedTable.status === "Cleaning" ? (
                                <button
                                    onClick={() => handleStatusAction('markFree')}
                                    className="w-full py-3.5 bg-slate-900 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer"
                                >
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span>{t("tables.mark_free", "Mark Free")}</span>
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleStatusAction('newOrder')}
                                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{t("tables.new_order", "New Order")}</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusAction(selectedTable.status === "Free" ? 'reserve' : 'markFree')}
                                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        {selectedTable.status === "Free" ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        <span>{selectedTable.status === "Free" ? t("tables.reserve", "Reserve") : t("tables.mark_free", "Mark Free")}</span>
                                    </button>
                                </div>
                            )}

                            {/* Secondary Actions: Edit & Delete */}
                            <div className="flex gap-3 pt-3 border-t border-slate-100 items-center">
                                <button
                                    onClick={() => handleStatusAction('edit')}
                                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-2xl border border-slate-200/80 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                                >
                                    <Edit className="w-4 h-4 text-slate-500" />
                                    <span>{t("tables.edit_table", "Edit Table")}</span>
                                </button>
                                <button
                                    onClick={() => handleStatusAction('delete')}
                                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl border border-rose-200/60 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                                    title={t("common.delete", "Delete Table")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                            confirmModal.variant === 'danger' ? 'bg-rose-50 text-rose-600' : 
                            confirmModal.variant === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {confirmModal.variant === 'danger' ? (
                                <Trash2 className="w-7 h-7" />
                            ) : confirmModal.variant === 'warning' ? (
                                <AlertCircle className="w-7 h-7" />
                            ) : (
                                <CheckCircle className="w-7 h-7" />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{confirmModal.title}</h3>
                        <p className="text-slate-500 text-xs font-semibold mb-6 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all text-xs uppercase tracking-wider cursor-pointer"
                            >
                                {t("common.cancel", "Cancel")}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 py-3 text-white font-extrabold rounded-2xl transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer ${
                                    confirmModal.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' :
                                    confirmModal.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' :
                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                }`}
                            >
                                {confirmModal.confirmText || t("common.confirm", "Confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTables;
