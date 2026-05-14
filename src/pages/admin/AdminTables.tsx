import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { Plus, Edit, Trash2, Users, Clock, CheckCircle, XCircle, X, RefreshCcw, Filter, Sparkles, FileText, Receipt } from "lucide-react";
import { toast } from "sonner";

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

const AdminTables = () => {
    const { settings } = useSettings();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
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
    const [processingServiceTableId, setProcessingServiceTableId] = useState<string | null>(null);

    const fetchTables = async () => {
        try {
            setLoading(true);
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
                            }
                        }
                    });
                    setTableOrderStatuses(statusMap);
                }
            } else {
                throw new Error('Failed to fetch tables');
            }
        } catch (error) {
            console.error("Failed to fetch tables:", error);
            // Fallback to mock data if API fails
            setTables([
                { _id: "1", tableNumber: "T!", capacity: 4, sortOrder: 1, status: "Free" },
                { _id: "2", tableNumber: "t2", capacity: 4, sortOrder: 2, status: "Free" },
                { _id: "3", tableNumber: "T2", capacity: 4, sortOrder: 3, status: "Reserved" }
            ]);
        } finally {
            setLoading(false);
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

        const html = `<!DOCTYPE html><html><head><title>KOT</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
        </style></head><body>
            <div class="center" style="font-size:18px;font-weight:bold;margin-bottom:10px;">KITCHEN ORDER</div>
            <div class="dashed"></div>
            <div class="row"><span>Table</span><span>${table.tableNumber}</span></div>
            <div class="row"><span>Order</span><span>${orderNum}</span></div>
            <div class="row"><span>Time</span><span>${date}</span></div>
            <div class="dashed"></div>
            ${itemsHtml}
            <div class="dashed"></div>
            <div class="center" style="margin-top:8px;">*** KOT ***</div>
        </body></html>`;

        return openPrintWindow(html, "Please allow pop-ups to print the KOT");
    };

    const printBillForOrder = (table: Table, order: TableOrder) => {
        const itemsHtml = order.items
            .map(
                (item) =>
                    `<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>${item.title} x${item.quantity}</span><span>BDT ${(item.price * item.quantity).toFixed(2)}</span></div>`
            )
            .join("");
        const orderNum = `#${order._id.slice(-6).toUpperCase()}`;
        const date = new Date(order.createdAt || Date.now()).toLocaleString("en-GB");

        const html = `<!DOCTYPE html><html><head><title>Bill Receipt</title><style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; color: #000; font-size: 14px; }
            .center { text-align: center; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .dashed { border-bottom: 2px dashed #000; margin: 10px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin: 8px 0; }
        </style></head><body>
            <div class="center" style="font-size:20px;font-weight:bold;margin-bottom:10px;">${settings.websiteName.toUpperCase()}</div>
            <div class="dashed"></div>
            <div class="row"><span>Table</span><span>${table.tableNumber}</span></div>
            <div class="row"><span>Order</span><span>${orderNum}</span></div>
            <div class="row"><span>Date</span><span>${date}</span></div>
            <div class="dashed"></div>
            ${itemsHtml}
            <div class="dashed"></div>
            <div class="row"><span>Subtotal</span><span>BDT ${(order.subtotal || 0).toFixed(2)}</span></div>
            <div class="row"><span>Tax</span><span>BDT ${(order.tax || 0).toFixed(2)}</span></div>
            <div class="total-row"><span>TOTAL</span><span>BDT ${(order.total || 0).toFixed(2)}</span></div>
        </body></html>`;

        return openPrintWindow(html, "Please allow pop-ups to print the bill");
    };

    const handleTableServiceAction = async (table: Table, action: "kot" | "bill") => {
        if (action === "bill" && table.status === "Free") {
            toast.error(`Table ${table.tableNumber} is free. Please place an order first.`);
            return;
        }

        try {
            setProcessingServiceTableId(table._id);
            const order = await getOrderForTable(table);
            if (!order) {
                toast.error(`No active order found for Table ${table.tableNumber}`);
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
                    ? `KOT printed for Table ${table.tableNumber}`
                    : `Bill printed for Table ${table.tableNumber}`
            );
        } catch (error) {
            console.error(`Failed to process ${action}:`, error);
            toast.error(`Failed to ${action === "kot" ? "print KOT" : "print bill"}`);
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
                sortOrder: table.sortOrder
            });
        } else {
            setEditingTable(null);
            setFormData({ tableNumber: "", name: "", capacity: 4, sortOrder: 0 });
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
                throw new Error(data.message || "Failed to save table");
            }
            
            toast.success(editingTable ? "Table updated successfully" : "Table added successfully");
            setIsModalOpen(false);
            fetchTables();
        } catch (err: any) {
            console.error("Failed to save table:", err);
            toast.error(err.message || "Failed to save table");
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Table",
            message: "Are you sure you want to delete this table? This action cannot be undone.",
            confirmText: "Delete",
            variant: "danger",
            onConfirm: async () => {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                    await fetch(`${apiUrl}/tables/${id}`, { method: "DELETE" });
                    toast.success("Table deleted successfully");
                    fetchTables();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error("Failed to delete table:", err);
                    toast.error("Failed to delete table");
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
            toast.success(`Table status updated to ${status}`);
        } catch (err) {
            console.error("Failed to update table status:", err);
            toast.error("Failed to update status");
        }
    };

    const handleStatusAction = async (action: string) => {
        if (!selectedTable) return;

        let newStatus = selectedTable.status;
        let updateData: Record<string, any> = {};

        switch (action) {
            case 'newOrder':
                if (selectedTable.status !== 'Free') {
                    toast.error(`Table ${selectedTable.tableNumber} is currently ${selectedTable.status}. It must be Free before creating a new order.`);
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
                        title: "Mark Table as Free?",
                        message: `Table ${selectedTable.tableNumber} is currently occupied. Do you want to cancel the active order and mark it as free?`,
                        confirmText: "Yes, Mark Free",
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
        Reserved: tables.filter(t => t.status === "Reserved").length,
        "KOT Sent": tables.filter(t => tableServiceState[t._id]?.kotSent).length,
        "Bill Printed": tables.filter(t => tableServiceState[t._id]?.billPrinted).length,
        Cleaning: tables.filter(t => t.status === "Cleaning").length
    };

    const filteredTables = tables.filter(table => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Available") return table.status === "Free";
        if (activeFilter === "Reserved") return table.status === "Reserved";
        if (activeFilter === "KOT Sent") return !!tableServiceState[table._id]?.kotSent;
        if (activeFilter === "Bill Printed") return !!tableServiceState[table._id]?.billPrinted;
        if (activeFilter === "Cleaning") return table.status === "Cleaning";
        return true;
    });    return (
        <AdminLayout title="Tables">
            <div className="space-y-4 lg:space-y-8 bg-[#f8fafc] min-h-screen -m-4 lg:-m-6 p-4 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl lg:text-3xl font-black text-[#0f172a]">Tables</h1>
                            <button 
                                onClick={fetchTables}
                                className="p-1.5 hover:bg-neutral-100 rounded-full transition-all active:rotate-180 duration-500"
                            >
                                <RefreshCcw className="w-4 h-4 text-neutral-500" />
                            </button>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-bold rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="hidden xs:inline">Add Table</span>
                            <span className="xs:hidden">Add</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <div className="flex bg-neutral-100 p-1 rounded-full shrink-0">
                            {Object.entries(counts).map(([label, count]) => (
                                <button
                                    key={label}
                                    onClick={() => setActiveFilter(label)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap ${
                                        activeFilter === label 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                                >
                                    {label} ({count})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                    {filteredTables.map((table) => (
                        <div 
                            key={table._id}
                            onClick={() => {
                                setSelectedTable(table);
                                setIsStatusModalOpen(true);
                            }}
                            className={`group relative cursor-pointer border-2 rounded-[1.5rem] lg:rounded-[2.5rem] p-4 lg:p-6 transition-all hover:scale-[1.02] active:scale-95 ${
                                table.status === "Free" ? 'bg-[#f0fdf4] border-[#22c55e] text-[#15803d]' :
                                table.status === "Reserved" ? 'bg-[#f5f3ff] border-[#8b5cf6] text-[#6d28d9]' :
                                table.status === "Occupied" ? 'bg-[#fff1f2] border-[#f43f5e] text-[#be123c]' :
                                'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8]'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-2">
                                <div className="space-y-0.5">
                                    <h3 className="text-xl lg:text-3xl font-black">{table.tableNumber}</h3>
                                    <div className="flex items-center gap-1.5 opacity-70">
                                        <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="text-[10px] lg:text-sm font-bold">{table.capacity} seats</span>
                                    </div>
                                </div>
                                
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    table.status === "Free" ? 'bg-white/50 text-[#15803d]' :
                                    table.status === "Reserved" ? 'bg-white/50 text-[#6d28d9]' :
                                    table.status === "Occupied" ? 'bg-white/50 text-[#be123c]' :
                                    'bg-white/50 text-[#1d4ed8]'
                                }`}>
                                    {table.status}
                                </div>
                                {table.status === "Occupied" && tableOrderStatuses[table._id] && (
                                    <div className="mt-1 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/40 text-[#be123c] border border-white/20 self-end">
                                        {tableOrderStatuses[table._id]}
                                    </div>
                                )}
                            </div>
                            
                            {/* KOT / Bill Actions (Only for occupied tables) */}
                            {table.status === "Occupied" && (
                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTableServiceAction(table, "kot");
                                        }}
                                        disabled={processingServiceTableId === table._id}
                                        className={`py-2.5 rounded-[8px] border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                            tableServiceState[table._id]?.kotSent
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white/70 hover:bg-white text-blue-700 border-blue-200"
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {processingServiceTableId === table._id ? "..." : "KOT"}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTableServiceAction(table, "bill");
                                        }}
                                        disabled={processingServiceTableId === table._id}
                                        className={`py-2.5 rounded-[8px] border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                            tableServiceState[table._id]?.billPrinted
                                                ? "bg-primary/90 text-white border-emerald-600"
                                                : "bg-white/70 hover:bg-white text-primary border-primary/30"
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <Receipt className="w-3.5 h-3.5" />
                                        {processingServiceTableId === table._id ? "..." : "Bill"}
                                    </button>
                                </div>
                            )}

                            {/* Edit/Delete Actions */}
                            <div className="mt-3 flex justify-end gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(table); }}
                                    className="p-2 bg-white/80 hover:bg-white rounded-full text-neutral-600 shadow-sm transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(table._id); }}
                                    className="p-2 bg-white/80 hover:bg-white rounded-full text-rose-500 shadow-sm transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && filteredTables.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <XCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold">No tables found</p>
                        <p className="text-sm">Try changing your filter or add a new table.</p>
                    </div>
                )}
            </div>

            {/* Modals remain same but styled to match */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-[#0f172a]">{editingTable ? "Edit Table" : "Add Table"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Table Number</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.tableNumber}
                                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    placeholder="e.g., T1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Order</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-[12px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-[12px] transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[12px] transition-colors shadow-lg shadow-blue-100">
                                    {editingTable ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Status Modal styled as pill actions */}
            {isStatusModalOpen && selectedTable && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    selectedTable.status === "Free" ? 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                                    selectedTable.status === "Reserved" ? 'bg-purple-500' :
                                    'bg-rose-500'
                                }`} />
                                <h3 className="text-xl font-bold text-[#0f172a]">Table {selectedTable.tableNumber}</h3>
                            </div>
                            <button onClick={() => setIsStatusModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Status Row */}
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-neutral-500 font-bold">Status</span>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black ${
                                selectedTable.status === "Free" ? 'bg-primary/10 text-primary' :
                                selectedTable.status === "Reserved" ? 'bg-purple-50 text-purple-600' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                                {selectedTable.status === "Free" ? "Available" : selectedTable.status}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {selectedTable.status === "Occupied" ? (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleStatusAction('addItems')}
                                            className="flex-1 py-4 bg-[#1d7cf2] hover:bg-[#1a6ed9] text-white font-black rounded-[12px] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Add Items</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (selectedTable._id) {
                                                window.location.href = `/admin/pos?table=${selectedTable._id}&checkout=true`;
                                            } else {
                                                toast.error("No active order reference found");
                                            }
                                        }}
                                        className="w-full py-4 bg-primary/90 hover:bg-emerald-700 text-white font-black rounded-[12px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-100"
                                    >
                                        <Receipt className="w-5 h-5" />
                                        <span>Complete Payment</span>
                                    </button>
                                </div>
                            ) : selectedTable.status === "Cleaning" ? (
                                <button
                                    onClick={() => handleStatusAction('markFree')}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-[12px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-100"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Mark Free</span>
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleStatusAction('newOrder')}
                                        className="flex-1 py-3.5 bg-[#1d7cf2] hover:bg-[#1a6ed9] text-white font-bold rounded-[12px] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>New Order</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusAction(selectedTable.status === "Free" ? 'reserve' : 'markFree')}
                                        className="flex-1 py-3.5 bg-[#e2f3f5] hover:bg-[#d1eaed] text-[#0f172a] font-bold rounded-[12px] transition-all flex items-center justify-center gap-2"
                                    >
                                        {selectedTable.status === "Free" ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        <span>{selectedTable.status === "Free" ? "Reserve" : "Mark Free"}</span>
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-neutral-100 items-center">
                                <button
                                    onClick={() => handleStatusAction('edit')}
                                    className="flex-1 py-4 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold rounded-[2rem] border border-neutral-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Table</span>
                                </button>
                                <button
                                    onClick={() => handleStatusAction('delete')}
                                    className="w-12 h-12 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 border border-neutral-100">
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                                confirmModal.variant === 'danger' ? 'bg-rose-50' : 
                                confirmModal.variant === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                            }`}>
                                {confirmModal.variant === 'danger' ? (
                                    <Trash2 className="w-8 h-8 text-rose-500" />
                                ) : confirmModal.variant === 'warning' ? (
                                    <Clock className="w-8 h-8 text-amber-500" />
                                ) : (
                                    <CheckCircle className="w-8 h-8 text-blue-500" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-[12px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 py-3 text-white font-bold rounded-[12px] transition-all shadow-lg ${
                                        confirmModal.variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' :
                                        confirmModal.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
                                        'bg-blue-500 hover:bg-blue-600 shadow-blue-100'
                                    }`}
                                >
                                    {confirmModal.confirmText || "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTables;
