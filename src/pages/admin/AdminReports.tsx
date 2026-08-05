import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { 
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, Clock,
    Download, Filter, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
    Search, X, Eye, ArrowUpDown, Printer, CreditCard, Wallet, Smartphone, ChevronDown, Layers,
    Edit3, FileText, CheckCircle2, User, Phone, MapPin, Save, RefreshCw, ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Calendar as CalendarWidget } from "../../components/ui/calendar";
import { cn } from "../../lib/utils";
import { InvoiceModal, InvoiceData } from "../../components/admin/InvoiceModal";

const CATEGORY_COLORS = ["#3b82f6", "#eab308", "#ef4444", "#f97316", "#10b981", "#8b5cf6"];

interface ReportData {
    dailySales: { date: string; sales: number; orders: number }[];
    categorySales: { category: string; sales: number; percentage: number }[];
    topItems: { name: string; quantity: number; revenue: number }[];
    paymentMethods: { method: string; count: number; percentage: number }[];
    summary: {
        totalRevenue: number;
        totalOrders: number;
        onlineOrdersCount?: number;
        averageOrderValue: number;
        customerCount: number;
        revenueChange: number;
        ordersChange: number;
        onlineOrdersChange?: number;
    };
}

interface WeeklyCalculation {
    id: string;
    weekName: string;
    period: string;
    revenue: number;
    orders: number;
    aov: number;
    topCategory: string;
    topProduct: string;
    dailyData: { day: string; sales: number; orders: number }[];
    payments: { method: string; share: number }[];
}

interface MonthlyCalculation {
    id: string;
    monthName: string;
    revenue: number;
    orders: number;
    aov: number;
    rawMaterialCost: number;
    netProfit: number;
    profitMargin: number;
    weeklyData: { week: string; sales: number }[];
    categories: { category: string; sales: number }[];
}

interface ProductSale {
    id: string;
    name: string;
    category: string;
    qtySold: number;
    price: number;
    revenue: number;
    salesTrend: { day: string; qty: number }[];
    ingredients: { name: string; quantity: string; inStock: boolean }[];
    recentOrders: { orderId: string; date: string; customer: string; phone?: string; address?: string; qty: number; status: string }[];
}

interface SalesOrderTransaction {
    id: string;
    orderId: string;
    date: string;
    time: string;
    dateTime: string;
    customer: string;
    phone: string;
    items: string;
    type: "Dine-in" | "Takeaway" | "Online Delivery";
    payment: "Cash" | "Card" | "bKash / Mobile";
    amount: number;
    status: "Completed" | "Delivered" | "Paid";
}

const salesOrderTransactions: SalesOrderTransaction[] = [
    { id: "o1", orderId: "#ORD-9045", date: "05 Aug 2026", time: "01:25 PM", dateTime: "05 Aug 2026, 01:25 PM", customer: "Md Tohid", phone: "01711223344", items: "2x Grilled Chicken, 1x Cold Coffee", type: "Dine-in", payment: "Cash", amount: 690, status: "Completed" },
    { id: "o2", orderId: "#ORD-9044", date: "05 Aug 2026", time: "12:40 PM", dateTime: "05 Aug 2026, 12:40 PM", customer: "Abir Hasan", phone: "01988776655", items: "1x Pasta Alfredo, 1x Caesar Salad", type: "Online Delivery", payment: "bKash / Mobile", amount: 500, status: "Delivered" },
    { id: "o3", orderId: "#ORD-9043", date: "05 Aug 2026", time: "11:15 AM", dateTime: "05 Aug 2026, 11:15 AM", customer: "Royal BD", phone: "01822334455", items: "3x Beef Burger, 2x Fries", type: "Takeaway", payment: "Card", amount: 1050, status: "Paid" },
    { id: "o4", orderId: "#ORD-9042", date: "05 Aug 2026", time: "10:30 AM", dateTime: "05 Aug 2026, 10:30 AM", customer: "Rafiqul Islam", phone: "01755443322", items: "2x Fish & Chips, 2x Mojito", type: "Dine-in", payment: "Cash", amount: 720, status: "Completed" },
    { id: "o5", orderId: "#ORD-9041", date: "04 Aug 2026", time: "09:10 PM", dateTime: "04 Aug 2026, 09:10 PM", customer: "Tanjim Ahmed", phone: "01611223344", items: "1x Grilled Chicken, 1x Tabbouleh Bowl", type: "Online Delivery", payment: "bKash / Mobile", amount: 450, status: "Delivered" },
    { id: "o6", orderId: "#ORD-9040", date: "04 Aug 2026", time: "08:05 PM", dateTime: "04 Aug 2026, 08:05 PM", customer: "Labib Rahman", phone: "01300998877", items: "2x Pasta Alfredo, 2x Latte", type: "Dine-in", payment: "Card", amount: 760, status: "Completed" },
    { id: "o7", orderId: "#ORD-9039", date: "04 Aug 2026", time: "02:30 PM", dateTime: "04 Aug 2026, 02:30 PM", customer: "Kamal Hossain", phone: "01811223344", items: "1x Gyro Carnitas Tacos, 1x Guacamole", type: "Takeaway", payment: "Cash", amount: 620, status: "Paid" },
    { id: "o8", orderId: "#ORD-9038", date: "03 Aug 2026", time: "07:45 PM", dateTime: "03 Aug 2026, 07:45 PM", customer: "Mehedi Hasan", phone: "01911445566", items: "4x Beef Burger, 4x Cold Drinks", type: "Dine-in", payment: "Cash", amount: 1400, status: "Completed" },
    { id: "o9", orderId: "#ORD-9037", date: "03 Aug 2026", time: "01:10 PM", dateTime: "03 Aug 2026, 01:10 PM", customer: "Sharmin Akter", phone: "01799887766", items: "2x Caesar Salad, 2x Soup", type: "Online Delivery", payment: "bKash / Mobile", amount: 540, status: "Delivered" },
    { id: "o10", orderId: "#ORD-9036", date: "02 Aug 2026", time: "08:20 PM", dateTime: "02 Aug 2026, 08:20 PM", customer: "Nusrat Jahan", phone: "01522334455", items: "2x Fish & Chips, 1x Dessert Collection", type: "Dine-in", payment: "Card", amount: 880, status: "Completed" }
];

const AdminReports = () => {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date("2026-08-05"),
        to: new Date("2026-08-06"),
    });
    const [reportType, setReportType] = useState("overview"); // overview, sales, items, weekly_monthly, products
    const [salesSubView, setSalesSubView] = useState<"all" | "daily" | "weekly" | "monthly">("all");
    const [salesTableTab, setSalesTableTab] = useState<"orders" | "summary">("orders");
    const [isSalesMenuOpen, setIsSalesMenuOpen] = useState(false);

    // Product search/sort state
    const [productSearch, setProductSearch] = useState("");
    const [productSort, setProductSort] = useState<"qty" | "revenue" | "name">("qty");
    const [productSortOrder, setProductSortOrder] = useState<"asc" | "desc">("desc");

    // Modal states
    const [selectedWeekly, setSelectedWeekly] = useState<WeeklyCalculation | null>(null);
    const [selectedMonthly, setSelectedMonthly] = useState<MonthlyCalculation | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductSale | null>(null);
    const [editingBOMProduct, setEditingBOMProduct] = useState<ProductSale | null>(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<InvoiceData | null>(null);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<SalesOrderTransaction | null>(null);
    const [editingOrder, setEditingOrder] = useState<SalesOrderTransaction | null>(null);
    const [selectedCustomerModal, setSelectedCustomerModal] = useState<{
        customer: string;
        phone: string;
        totalSpent: number;
        totalOrders: number;
        orders: SalesOrderTransaction[];
    } | null>(null);
    const [transactionsList, setTransactionsList] = useState<SalesOrderTransaction[]>(salesOrderTransactions);

    const handleSaveOrderEdit = (updatedOrder: SalesOrderTransaction) => {
        setTransactionsList(prev => {
            const newList = prev.map(t => t.id === updatedOrder.id ? updatedOrder : t);
            
            const totalRev = newList.reduce((sum, t) => sum + t.amount, 0);
            const totalCount = newList.length;
            const avgVal = totalCount > 0 ? totalRev / totalCount : 0;
            const uniqueCusts = new Set(newList.map(t => t.customer)).size;

            const cashTx = newList.filter(t => t.payment === "Cash");
            const cardTx = newList.filter(t => t.payment === "Card");
            const mobileTx = newList.filter(t => t.payment === "bKash / Mobile");

            setReportData(prevReport => {
                if (!prevReport) return null;
                return {
                    ...prevReport,
                    paymentMethods: [
                        { method: "Cash", count: cashTx.length, percentage: Number((totalCount > 0 ? (cashTx.length / totalCount) * 100 : 0).toFixed(1)) },
                        { method: "Card", count: cardTx.length, percentage: Number((totalCount > 0 ? (cardTx.length / totalCount) * 100 : 0).toFixed(1)) },
                        { method: "Mobile", count: mobileTx.length, percentage: Number((totalCount > 0 ? (mobileTx.length / totalCount) * 100 : 0).toFixed(1)) }
                    ],
                    summary: {
                        ...prevReport.summary,
                        totalRevenue: Math.round(totalRev),
                        totalOrders: totalCount,
                        averageOrderValue: Number(avgVal.toFixed(2)),
                        customerCount: uniqueCusts
                    }
                };
            });

            return newList;
        });

        toast.success(`Order ${updatedOrder.orderId} updated successfully! 🎉`);
        setEditingOrder(null);
    };

    const handleCustomerClick = (customerName: string, customerPhone: string) => {
        const customerOrders = transactionsList.filter(t => 
            t.customer.toLowerCase() === customerName.toLowerCase() || 
            (customerPhone && customerPhone !== "N/A" && t.phone === customerPhone)
        );
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.amount, 0);
        setSelectedCustomerModal({
            customer: customerName,
            phone: customerPhone || "N/A",
            totalSpent,
            totalOrders: customerOrders.length > 0 ? customerOrders.length : 1,
            orders: customerOrders.length > 0 ? customerOrders : transactionsList.filter(t => t.customer === customerName)
        });
    };

    const renderItemBadges = (itemsInput: any) => {
        let itemsStr = "";
        if (typeof itemsInput === "string") {
            itemsStr = itemsInput;
        } else if (Array.isArray(itemsInput)) {
            itemsStr = itemsInput.map((i: any) => `${i.quantity || i.qty || 1}x ${i.title || i.name || "Item"}`).join(", ");
        }
        
        if (!itemsStr) return <span className="text-neutral-400 italic text-xs">No items specified</span>;

        const itemParts = itemsStr.split(",").map(s => s.trim());
        return (
            <div className="flex flex-wrap gap-1 items-center">
                {itemParts.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-neutral-200/90 rounded-[6px] text-[11px] font-bold text-neutral-800 shadow-2xs">
                        🛍️ {item}
                    </span>
                ))}
            </div>
        );
    };

    const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Extended mock data for weekly reports
    const weeklyCalculations: WeeklyCalculation[] = [
        {
            id: "w1",
            weekName: "Week 1",
            period: "Jul 01 - Jul 07",
            revenue: 12450,
            orders: 280,
            aov: 44.46,
            topCategory: "Main Course",
            topProduct: "Grilled Chicken",
            dailyData: [
                { day: "Jul 1", sales: 1500, orders: 35 },
                { day: "Jul 2", sales: 1800, orders: 42 },
                { day: "Jul 3", sales: 1400, orders: 32 },
                { day: "Jul 4", sales: 2100, orders: 48 },
                { day: "Jul 5", sales: 2500, orders: 55 },
                { day: "Jul 6", sales: 1900, orders: 40 },
                { day: "Jul 7", sales: 1250, orders: 28 }
            ],
            payments: [
                { method: "Cash", share: 45 },
                { method: "Card", share: 40 },
                { method: "Mobile", share: 15 }
            ]
        },
        {
            id: "w2",
            weekName: "Week 2",
            period: "Jul 08 - Jul 14",
            revenue: 14200,
            orders: 310,
            aov: 45.80,
            topCategory: "Main Course",
            topProduct: "Pasta Alfredo",
            dailyData: [
                { day: "Jul 8", sales: 1800, orders: 40 },
                { day: "Jul 9", sales: 2100, orders: 45 },
                { day: "Jul 10", sales: 1700, orders: 38 },
                { day: "Jul 11", sales: 2400, orders: 52 },
                { day: "Jul 12", sales: 2800, orders: 60 },
                { day: "Jul 13", sales: 2200, orders: 48 },
                { day: "Jul 14", sales: 1200, orders: 27 }
            ],
            payments: [
                { method: "Cash", share: 40 },
                { method: "Card", share: 50 },
                { method: "Mobile", share: 10 }
            ]
        },
        {
            id: "w3",
            weekName: "Week 3",
            period: "Jul 15 - Jul 21",
            revenue: 11800,
            orders: 260,
            aov: 45.38,
            topCategory: "Beverages",
            topProduct: "Matcha Powder",
            dailyData: [
                { day: "Jul 15", sales: 1400, orders: 31 },
                { day: "Jul 16", sales: 1600, orders: 35 },
                { day: "Jul 17", sales: 1500, orders: 33 },
                { day: "Jul 18", sales: 1900, orders: 42 },
                { day: "Jul 19", sales: 2300, orders: 50 },
                { day: "Jul 20", sales: 1800, orders: 40 },
                { day: "Jul 21", sales: 1300, orders: 29 }
            ],
            payments: [
                { method: "Cash", share: 48 },
                { method: "Card", share: 42 },
                { method: "Mobile", share: 10 }
            ]
        },
        {
            id: "w4",
            weekName: "Week 4",
            period: "Jul 22 - Jul 28",
            revenue: 16500,
            orders: 340,
            aov: 48.53,
            topCategory: "Main Course",
            topProduct: "Beef Burger",
            dailyData: [
                { day: "Jul 22", sales: 2100, orders: 45 },
                { day: "Jul 23", sales: 2300, orders: 48 },
                { day: "Jul 24", sales: 2000, orders: 42 },
                { day: "Jul 25", sales: 2800, orders: 58 },
                { day: "Jul 26", sales: 3200, orders: 65 },
                { day: "Jul 27", sales: 2500, orders: 52 },
                { day: "Jul 28", sales: 1600, orders: 30 }
            ],
            payments: [
                { method: "Cash", share: 38 },
                { method: "Card", share: 52 },
                { method: "Mobile", share: 10 }
            ]
        }
    ];

    // Extended mock data for monthly reports
    const monthlyCalculations: MonthlyCalculation[] = [
        {
            id: "m1",
            monthName: "July 2026",
            revenue: 54950,
            orders: 1190,
            aov: 46.18,
            rawMaterialCost: 19230,
            netProfit: 35720,
            profitMargin: 65.0,
            weeklyData: [
                { week: "Week 1", sales: 12450 },
                { week: "Week 2", sales: 14200 },
                { week: "Week 3", sales: 11800 },
                { week: "Week 4", sales: 16500 }
            ],
            categories: [
                { category: "Main Course", sales: 22530 },
                { category: "Beverages", sales: 11650 },
                { category: "Appetizers", sales: 10160 },
                { category: "Desserts", sales: 6540 },
                { category: "Others", sales: 4070 }
            ]
        },
        {
            id: "m2",
            monthName: "June 2026",
            revenue: 48600,
            orders: 1020,
            aov: 47.65,
            rawMaterialCost: 17010,
            netProfit: 31590,
            profitMargin: 65.0,
            weeklyData: [
                { week: "Week 1", sales: 11200 },
                { week: "Week 2", sales: 12800 },
                { week: "Week 3", sales: 10900 },
                { week: "Week 4", sales: 13700 }
            ],
            categories: [
                { category: "Main Course", sales: 19930 },
                { category: "Beverages", sales: 10300 },
                { category: "Appetizers", sales: 8990 },
                { category: "Desserts", sales: 5780 },
                { category: "Others", sales: 3600 }
            ]
        },
        {
            id: "m3",
            monthName: "May 2026",
            revenue: 45200,
            orders: 980,
            aov: 46.12,
            rawMaterialCost: 15820,
            netProfit: 29380,
            profitMargin: 65.0,
            weeklyData: [
                { week: "Week 1", sales: 10500 },
                { week: "Week 2", sales: 11900 },
                { week: "Week 3", sales: 9800 },
                { week: "Week 4", sales: 13000 }
            ],
            categories: [
                { category: "Main Course", sales: 18530 },
                { category: "Beverages", sales: 9580 },
                { category: "Appetizers", sales: 8360 },
                { category: "Desserts", sales: 5380 },
                { category: "Others", sales: 3350 }
            ]
        },
        {
            id: "m4",
            monthName: "April 2026",
            revenue: 51100,
            orders: 1120,
            aov: 45.62,
            rawMaterialCost: 17880,
            netProfit: 33220,
            profitMargin: 65.0,
            weeklyData: [
                { week: "Week 1", sales: 11800 },
                { week: "Week 2", sales: 13200 },
                { week: "Week 3", sales: 11400 },
                { week: "Week 4", sales: 14700 }
            ],
            categories: [
                { category: "Main Course", sales: 20950 },
                { category: "Beverages", sales: 10830 },
                { category: "Appetizers", sales: 9450 },
                { category: "Desserts", sales: 6080 },
                { category: "Others", sales: 3790 }
            ]
        }
    ];

    // Detailed Product sales history and ingredients (BOM) linkage
    const productSalesData: ProductSale[] = [
        {
            id: "p1",
            name: "Grilled Chicken",
            category: "Main Course",
            qtySold: 145,
            price: 30,
            revenue: 4350,
            salesTrend: [
                { day: "Mon", qty: 15 },
                { day: "Tue", qty: 22 },
                { day: "Wed", qty: 18 },
                { day: "Thu", qty: 25 },
                { day: "Fri", qty: 28 },
                { day: "Sat", qty: 35 },
                { day: "Sun", qty: 22 }
            ],
            ingredients: [
                { name: "Raw Chicken Breast", quantity: "200g", inStock: true },
                { name: "Olive Oil", quantity: "15ml", inStock: true },
                { name: "Signature Spices Mix", quantity: "10g", inStock: true },
                { name: "Lemon juice", quantity: "5ml", inStock: true }
            ],
            recentOrders: [
                { orderId: "#ORD-9022", date: "2026-07-25", customer: "Md Tohid", phone: "01711223344", address: "Banani, Dhaka", qty: 2, status: "completed" },
                { orderId: "#ORD-9018", date: "2026-07-25", customer: "Royal BD", phone: "01822334455", address: "Gulshan 1", qty: 1, status: "completed" },
                { orderId: "#ORD-8995", date: "2026-07-24", customer: "Anonymous", phone: "N/A", address: "Takeaway", qty: 3, status: "completed" }
            ]
        },
        {
            id: "p2",
            name: "Pasta Alfredo",
            category: "Main Course",
            qtySold: 128,
            price: 30,
            revenue: 3840,
            salesTrend: [
                { day: "Mon", qty: 12 },
                { day: "Tue", qty: 18 },
                { day: "Wed", qty: 15 },
                { day: "Thu", qty: 20 },
                { day: "Fri", qty: 24 },
                { day: "Sat", qty: 30 },
                { day: "Sun", qty: 25 }
            ],
            ingredients: [
                { name: "Penne Pasta", quantity: "120g", inStock: true },
                { name: "Alfredo Cream Sauce", quantity: "100ml", inStock: true },
                { name: "Parmesan Cheese", quantity: "15g", inStock: false }, // Low/Out stock item for BOM demo
                { name: "Mushrooms", quantity: "30g", inStock: true }
            ],
            recentOrders: [
                { orderId: "#ORD-9023", date: "2026-07-25", customer: "Tohidul", phone: "01933445566", address: "Dhanmondi 27", qty: 1, status: "completed" },
                { orderId: "#ORD-9005", date: "2026-07-24", customer: "Abir Hasan", phone: "01744556677", address: "Mirpur 10", qty: 2, status: "completed" }
            ]
        },
        {
            id: "p3",
            name: "Caesar Salad",
            category: "Appetizers",
            qtySold: 112,
            price: 20,
            revenue: 2240,
            salesTrend: [
                { day: "Mon", qty: 10 },
                { day: "Tue", qty: 14 },
                { day: "Wed", qty: 12 },
                { day: "Thu", qty: 18 },
                { day: "Fri", qty: 20 },
                { day: "Sat", qty: 25 },
                { day: "Sun", qty: 13 }
            ],
            ingredients: [
                { name: "Romaine Lettuce", quantity: "150g", inStock: true },
                { name: "Caesar Dressing", quantity: "30ml", inStock: true },
                { name: "Croutons", quantity: "20g", inStock: true },
                { name: "Parmesan Cheese", quantity: "10g", inStock: false }
            ],
            recentOrders: [
                { orderId: "#ORD-9011", date: "2026-07-25", customer: "Rafiqul Islam", qty: 1, status: "completed" }
            ]
        },
        {
            id: "p4",
            name: "Beef Burger",
            category: "Main Course",
            qtySold: 98,
            price: 30,
            revenue: 2940,
            salesTrend: [
                { day: "Mon", qty: 8 },
                { day: "Tue", qty: 12 },
                { day: "Wed", qty: 11 },
                { day: "Thu", qty: 15 },
                { day: "Fri", qty: 19 },
                { day: "Sat", qty: 25 },
                { day: "Sun", qty: 18 }
            ],
            ingredients: [
                { name: "Burger Bun", quantity: "1 unit", inStock: true },
                { name: "Beef Patty (150g)", quantity: "1 unit", inStock: true },
                { name: "Cheddar Cheese Slice", quantity: "1 unit", inStock: true },
                { name: "Burger Sauce", quantity: "15ml", inStock: true }
            ],
            recentOrders: [
                { orderId: "#ORD-9022", date: "2026-07-25", customer: "Md Tohid", qty: 1, status: "completed" },
                { orderId: "#ORD-9014", date: "2026-07-25", customer: "Labib", qty: 2, status: "completed" }
            ]
        },
        {
            id: "p5",
            name: "Fish & Chips",
            category: "Main Course",
            qtySold: 87,
            price: 30,
            revenue: 2610,
            salesTrend: [
                { day: "Mon", qty: 6 },
                { day: "Tue", qty: 10 },
                { day: "Wed", qty: 9 },
                { day: "Thu", qty: 12 },
                { day: "Fri", qty: 15 },
                { day: "Sat", qty: 22 },
                { day: "Sun", qty: 13 }
            ],
            ingredients: [
                { name: "Dory Fish Fillet", quantity: "180g", inStock: true },
                { name: "Fries", quantity: "150g", inStock: true },
                { name: "Tartar Sauce", quantity: "30ml", inStock: true },
                { name: "Batter Mix", quantity: "50g", inStock: true }
            ],
            recentOrders: [
                { orderId: "#ORD-8980", date: "2026-07-24", customer: "Kamal", qty: 1, status: "completed" }
            ]
        }
    ];

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            
            // 1. Attempt live API orders fetch
            let liveOrders: any[] = [];
            try {
                const res = await fetch(`${apiUrl}/orders`);
                if (res.ok) {
                    liveOrders = await res.json();
                }
            } catch (err) {
                console.log("Using cached/local transactions fallback");
            }

            // 2. Map live backend orders into transaction format
            const mappedLiveTransactions: SalesOrderTransaction[] = liveOrders.map((o: any) => ({
                id: o._id || o.id,
                orderId: o._id ? `#ORD-${o._id.slice(-6).toUpperCase()}` : (o.id ? `#ORD-${String(o.id).slice(-4)}` : "#ORD-9999"),
                date: o.createdAt ? format(new Date(o.createdAt), "dd MMM yyyy") : format(new Date(), "dd MMM yyyy"),
                time: o.createdAt ? format(new Date(o.createdAt), "hh:mm a") : format(new Date(), "hh:mm a"),
                dateTime: o.createdAt ? format(new Date(o.createdAt), "dd MMM yyyy, hh:mm a") : format(new Date(), "dd MMM yyyy, hh:mm a"),
                customer: o.customerInfo?.name || o.customer || "Walk-in Customer",
                phone: o.customerInfo?.phone || o.phone || "N/A",
                items: Array.isArray(o.items) 
                    ? o.items.map((i: any) => `${i.quantity || i.qty || 1}x ${i.title || i.name}`).join(", ") 
                    : (o.items || "Items Purchased"),
                type: (o.orderType === "online" ? "Online." : (o.tableNumber && o.tableNumber !== "Takeaway" ? o.tableNumber : (o.orderType === "takeaway" ? "Takeaway" : "Dine-in"))) as any,
                payment: (o.paymentMethod?.includes("bKash") || o.paymentMethod?.includes("Mobile") ? "bKash / Mobile" : o.paymentMethod?.includes("Card") ? "Card" : "Cash") as any,
                amount: o.total || o.amount || 0,
                status: (o.status === "completed" || o.status === "served" ? "Completed" : o.status === "delivered" ? "Delivered" : "Paid") as any,
            }));

            // 3. Combine with master transactions dataset
            const allTransactions = [...mappedLiveTransactions, ...salesOrderTransactions];
            const uniqueMap = new Map();
            allTransactions.forEach(t => uniqueMap.set(t.orderId, t));
            let combinedTransactions: SalesOrderTransaction[] = Array.from(uniqueMap.values());

            // Apply Date Range Filtering if date range is specified
            let prevCombinedTransactions: SalesOrderTransaction[] = [];
            
            if (date?.from) {
                const fromMs = new Date(date.from).setHours(0, 0, 0, 0);
                const toMs = date.to ? new Date(date.to).setHours(23, 59, 59, 999) : new Date(date.from).setHours(23, 59, 59, 999);
                
                const filtered = combinedTransactions.filter(t => {
                    const parsedDate = new Date(t.date);
                    if (isNaN(parsedDate.getTime())) return true;
                    const tMs = parsedDate.getTime();
                    return tMs >= fromMs && tMs <= toMs;
                });

                if (filtered.length > 0) {
                    combinedTransactions = filtered;
                }
                
                // Calculate previous period for comparison
                const diffMs = toMs - fromMs;
                // Add 1 day to the diff to make it a full period jump (e.g. 1 day range shifts by 1 day)
                const shiftMs = diffMs + (24 * 60 * 60 * 1000); 
                const prevFromMs = fromMs - shiftMs;
                const prevToMs = toMs - shiftMs;
                
                prevCombinedTransactions = Array.from(uniqueMap.values()).filter((t: any) => {
                    const parsedDate = new Date(t.date);
                    if (isNaN(parsedDate.getTime())) return false;
                    const tMs = parsedDate.getTime();
                    return tMs >= prevFromMs && tMs <= prevToMs;
                });
            } else {
                // If no date range is set, default comparison (e.g., all time has 0 change or fallback)
                prevCombinedTransactions = []; 
            }

            setTransactionsList(combinedTransactions);

            // 4. Compute real metric values
            const totalRev = combinedTransactions.reduce((sum, t) => sum + t.amount, 0);
            const totalCount = combinedTransactions.length;
            const avgVal = totalCount > 0 ? totalRev / totalCount : 0;
            const uniqueCusts = new Set(combinedTransactions.map(t => t.customer)).size;

            const cashTx = combinedTransactions.filter(t => t.payment === "Cash");
            const cardTx = combinedTransactions.filter(t => t.payment === "Card");
            const mobileTx = combinedTransactions.filter(t => t.payment === "bKash / Mobile");

            const cashCount = cashTx.length;
            const cardCount = cardTx.length;
            const mobileCount = mobileTx.length;

            const cashPct = totalCount > 0 ? (cashCount / totalCount) * 100 : 42.3;
            const cardPct = totalCount > 0 ? (cardCount / totalCount) * 100 : 48.5;
            const mobilePct = totalCount > 0 ? (mobileCount / totalCount) * 100 : 9.2;

            const todayStr = format(new Date(), "dd MMM yyyy");
            const todayTx = combinedTransactions.filter(t => t.date === todayStr);
            const todaySales = todayTx.reduce((sum, t) => sum + t.amount, 0);

            // Parse real items from combinedTransactions dynamically
            const itemCountsMap: Record<string, { quantity: number; revenue: number }> = {};
            
            combinedTransactions.forEach(t => {
                let itemsList: any[] = [];
                if (typeof t.items === "string") {
                    itemsList = t.items.split(",").map(str => {
                        const trimmed = str.trim();
                        const match = trimmed.match(/^(\d+)x\s+(.+)$/);
                        if (match) {
                            return { name: match[2].trim(), qty: parseInt(match[1], 10) };
                        }
                        return { name: trimmed, qty: 1 };
                    });
                } else if (Array.isArray(t.items)) {
                    itemsList = (t.items as any[]).map((i: any) => ({
                        name: i.title || i.name || "Item",
                        qty: i.quantity || i.qty || 1
                    }));
                }

                const totalItemsInOrder = itemsList.reduce((sum, i) => sum + i.qty, 0);
                const orderTotal = t.amount || 0;

                itemsList.forEach(item => {
                    if (!itemCountsMap[item.name]) {
                        itemCountsMap[item.name] = { quantity: 0, revenue: 0 };
                    }
                    itemCountsMap[item.name].quantity += item.qty;
                    const itemRevShare = totalItemsInOrder > 0 
                        ? Math.round(orderTotal * (item.qty / totalItemsInOrder))
                        : 0;
                    itemCountsMap[item.name].revenue += itemRevShare;
                });
            });

            const computedTopItems = Object.entries(itemCountsMap)
                .map(([name, data]) => ({
                    name,
                    quantity: data.quantity,
                    revenue: data.revenue
                }))
                .sort((a, b) => b.quantity - a.quantity);

            const finalTopItems = computedTopItems.length > 0 ? computedTopItems : [
                { name: "Grilled Chicken", quantity: 145, revenue: 4350 },
                { name: "Pasta Alfredo", quantity: 128, revenue: 3840 },
                { name: "Caesar Salad", quantity: 112, revenue: 2240 },
                { name: "Beef Burger", quantity: 98, revenue: 2940 },
                { name: "Fish & Chips", quantity: 87, revenue: 2610 }
            ];

            const onlineTxCount = combinedTransactions.filter(t => 
                t.type === "Online Delivery" || 
                (t.address && t.address !== "N/A" && t.address.toLowerCase() !== "dine-in" && t.address.toLowerCase() !== "takeaway")
            ).length;

            // Calculate real changes compared to previous period
            const calculateChange = (current: number, prev: number) => {
                if (prev === 0 && current > 0) return 100;
                if (prev === 0 && current === 0) return 0;
                return Number((((current - prev) / prev) * 100).toFixed(1));
            };

            const prevTotalRev = prevCombinedTransactions.reduce((sum, t) => sum + t.amount, 0);
            const prevTotalCount = prevCombinedTransactions.length;
            const prevOnlineTxCount = prevCombinedTransactions.filter(t => 
                t.type === "Online Delivery" || 
                (t.address && t.address !== "N/A" && t.address.toLowerCase() !== "dine-in" && t.address.toLowerCase() !== "takeaway")
            ).length;
            const prevAvgVal = prevTotalCount > 0 ? prevTotalRev / prevTotalCount : 0;
            const prevUniqueCusts = new Set(prevCombinedTransactions.map((t: any) => t.customer)).size;

            const computedData: ReportData = {
                dailySales: [
                    { date: `${todayStr} (Today)`, sales: todaySales > 0 ? todaySales : 2960, orders: todayTx.length > 0 ? todayTx.length : 4 },
                    { date: "04 Aug 2026 (Yesterday)", sales: 1830, orders: 3 },
                    { date: "03 Aug 2026", sales: 1940, orders: 2 },
                    { date: "02 Aug 2026", sales: 880, orders: 1 },
                    { date: "01 Aug 2026", sales: 3200, orders: 110 },
                    { date: "31 Jul 2026", sales: 2800, orders: 95 },
                    { date: "30 Jul 2026", sales: 2200, orders: 78 }
                ],
                categorySales: [
                    { category: "Appetizers", sales: 2800, percentage: 18.5 },
                    { category: "Main Course", sales: Math.round(totalRev * 0.45), percentage: 41.0 },
                    { category: "Desserts", sales: 1800, percentage: 11.9 },
                    { category: "Beverages", sales: 3200, percentage: 21.2 },
                    { category: "Others", sales: 1100, percentage: 7.4 }
                ],
                topItems: finalTopItems,
                paymentMethods: [
                    { method: "Cash", count: cashCount, percentage: Number(cashPct.toFixed(1)) },
                    { method: "Card", count: cardCount, percentage: Number(cardPct.toFixed(1)) },
                    { method: "Mobile", count: mobileCount, percentage: Number(mobilePct.toFixed(1)) }
                ],
                summary: {
                    totalRevenue: Math.round(totalRev),
                    totalOrders: totalCount,
                    onlineOrdersCount: onlineTxCount,
                    averageOrderValue: Number(avgVal.toFixed(2)),
                    customerCount: uniqueCusts,
                    revenueChange: prevCombinedTransactions.length > 0 ? calculateChange(totalRev, prevTotalRev) : 0,
                    ordersChange: prevCombinedTransactions.length > 0 ? calculateChange(totalCount, prevTotalCount) : 0,
                    onlineOrdersChange: prevCombinedTransactions.length > 0 ? calculateChange(onlineTxCount, prevOnlineTxCount) : 0,
                    avgOrderValueChange: prevCombinedTransactions.length > 0 ? calculateChange(avgVal, prevAvgVal) : 0,
                    customerCountChange: prevCombinedTransactions.length > 0 ? calculateChange(uniqueCusts, prevUniqueCusts) : 0
                }
            };
            
            setReportData(computedData);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [date]);

    const handleSortProduct = (field: "qty" | "revenue" | "name") => {
        if (productSort === field) {
            setProductSortOrder(productSortOrder === "asc" ? "desc" : "asc");
        } else {
            setProductSort(field);
            setProductSortOrder("desc");
        }
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Helper to auto-size columns
        const autoSize = (data: any[], ws: any) => {
            if (!data || data.length === 0) return;
            const colWidths = Object.keys(data[0]).map(key => ({
                wch: Math.max(
                    key.length,
                    ...data.map(item => (item[key] !== null && item[key] !== undefined) ? item[key].toString().length : 0)
                ) + 3
            }));
            ws["!cols"] = colWidths;
        };

        // 1. Detailed Orders Log Sheet
        const orderLogs = transactionsList.map(t => ({
            "Order ID": t.orderId,
            "Date & Time": t.dateTime,
            "Customer Name": t.customer,
            "Phone Number": t.phone,
            "Items Ordered": t.items,
            "Order Type": t.type,
            "Payment Method": t.payment,
            "Amount (৳)": t.amount,
            "Order Status": t.status
        }));
        const wsOrders = XLSX.utils.json_to_sheet(orderLogs);
        autoSize(orderLogs, wsOrders);
        XLSX.utils.book_append_sheet(wb, wsOrders, "Detailed Orders Log");

        // 2. Sales Summary Sheet
        if (reportData) {
            const summaryMetrics = [
                { Metric: "Total Revenue", Value: `৳${reportData.summary.totalRevenue.toLocaleString()}` },
                { Metric: "Total Orders Count", Value: reportData.summary.totalOrders },
                { Metric: "Average Order Value (AOV)", Value: `৳${reportData.summary.averageOrderValue}` },
                { Metric: "Unique Customers", Value: reportData.summary.customerCount }
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryMetrics);
            autoSize(summaryMetrics, wsSummary);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Sales Summary");

            // 3. Payment Methods Sheet
            const paymentLogs = reportData.paymentMethods.map(p => ({
                "Payment Method": p.method,
                "Transaction Count": p.count,
                "Percentage Share": `${p.percentage}%`
            }));
            const wsPayment = XLSX.utils.json_to_sheet(paymentLogs);
            autoSize(paymentLogs, wsPayment);
            XLSX.utils.book_append_sheet(wb, wsPayment, "Payment Methods");
        }

        const dateFromStr = date?.from ? format(date.from, "yyyy-MM-dd") : "all";
        const dateToStr = date?.to ? format(date.to, "yyyy-MM-dd") : "all";
        XLSX.writeFile(wb, `Sales_Report_${dateFromStr}_to_${dateToStr}.xlsx`);
        toast.success("Sales report exported to Excel successfully! 📊");
    };

    const getSortedProducts = () => {
        const productStatsMap: Record<string, { qty: number; revenue: number }> = {};
        
        transactionsList.forEach(t => {
            let itemsList: any[] = [];
            if (typeof t.items === "string") {
                itemsList = t.items.split(",").map(str => {
                    const trimmed = str.trim();
                    const match = trimmed.match(/^(\d+)x\s+(.+)$/);
                    if (match) {
                        return { name: match[2].trim(), qty: parseInt(match[1], 10) };
                    }
                    return { name: trimmed, qty: 1 };
                });
            } else if (Array.isArray(t.items)) {
                itemsList = (t.items as any[]).map((i: any) => ({
                    name: i.title || i.name || "Item",
                    qty: i.quantity || i.qty || 1
                }));
            }

            const totalQtyInOrder = itemsList.reduce((sum, i) => sum + i.qty, 0);

            itemsList.forEach(item => {
                const pNameLower = item.name.toLowerCase();
                if (!productStatsMap[pNameLower]) {
                    productStatsMap[pNameLower] = { qty: 0, revenue: 0 };
                }
                productStatsMap[pNameLower].qty += item.qty;
                const itemRev = totalQtyInOrder > 0 ? Math.round(t.amount * (item.qty / totalQtyInOrder)) : 0;
                productStatsMap[pNameLower].revenue += itemRev;
            });
        });

        const dynamicProducts = productSalesData.map(p => {
            const stats = productStatsMap[p.name.toLowerCase()];
            if (stats && stats.qty > 0) {
                return {
                    ...p,
                    qtySold: stats.qty,
                    revenue: stats.revenue
                };
            }
            return p;
        });

        const filtered = dynamicProducts.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(productSearch.toLowerCase())
        );

        return filtered.sort((a, b) => {
            let valA: any = a[productSort];
            let valB: any = b[productSort];
            if (productSort === "qty") {
                valA = a.qtySold;
                valB = b.qtySold;
            }

            if (typeof valA === "string") {
                return productSortOrder === "asc" 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            } else {
                return productSortOrder === "asc" 
                    ? valA - valB 
                    : valB - valA;
            }
        });
    };

    if (loading || !reportData) {
        return (
            <AdminLayout title={t("dashboard.reports", "Reports")}>
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={t("dashboard.reports", "Reports")}>
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Premium Navigation Pills */}
                    <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 rounded-[12px] w-full md:w-auto">
                        <button
                            onClick={() => setReportType("overview")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "overview"
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.overview", "Overview")}
                        </button>
                        <button
                            onClick={() => {
                                setReportType("sales");
                                setSalesSubView("all");
                            }}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "sales"
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.sales", "Sales Breakdown")}
                        </button>
                        <button
                            onClick={() => setReportType("items")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "items"
                                    ? "bg-white text-neutral-900 shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.items", "Top Items")}
                        </button>
                        <button
                            onClick={() => setReportType("products")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "products"
                                    ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50"
                            }`}
                        >
                            {t("reports.products", "Product Sales Count")}
                        </button>
                        <button
                            onClick={() => setReportType("online")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "online"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.online_orders", "Online Orders")}
                        </button>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto justify-end print:hidden items-center">
                        <div className="flex items-center bg-white border border-neutral-200/90 rounded-[14px] px-3.5 py-1.5 shadow-sm text-xs font-bold text-neutral-800">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "justify-start text-left font-bold px-2 py-1 focus:outline-none flex items-center gap-2 transition-colors hover:text-primary rounded-[8px]",
                                            !date?.from && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="h-4 w-4 text-neutral-700" />
                                        <span>{date?.from ? format(date.from, "MMM dd, yyyy") : "Start Date"}</span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[16px] border-neutral-200 shadow-2xl" align="start">
                                    <CalendarWidget
                                        initialFocus
                                        mode="single"
                                        defaultMonth={date?.from}
                                        selected={date?.from}
                                        onSelect={(newDate) => setDate(prev => ({ from: newDate, to: prev?.to }))}
                                    />
                                </PopoverContent>
                            </Popover>
                            
                            <span className="text-neutral-300 font-bold px-2.5 text-sm">-</span>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "justify-start text-left font-bold px-2 py-1 focus:outline-none flex items-center gap-2 transition-colors hover:text-primary rounded-[8px]",
                                            !date?.to && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="h-4 w-4 text-neutral-700" />
                                        <span>{date?.to ? format(date.to, "MMM dd, yyyy") : "End Date"}</span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[16px] border-neutral-200 shadow-2xl" align="end">
                                    <CalendarWidget
                                        initialFocus
                                        mode="single"
                                        defaultMonth={date?.to || date?.from}
                                        selected={date?.to}
                                        onSelect={(newDate) => setDate(prev => ({ from: prev?.from, to: newDate }))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <button
                            onClick={handleExportExcel}
                            title="Export to Excel"
                            className="px-4 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-[14px] transition-all flex items-center gap-2 shadow-xs font-bold text-xs active:scale-95"
                        >
                            <Download className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-600">Excel</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title={t("reports.total_revenue", "Total Revenue")}
                        value={`৳${reportData.summary.totalRevenue.toLocaleString()}`}
                        change={reportData.summary.revenueChange}
                        isPositive={reportData.summary.revenueChange > 0}
                        icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                    />
                    {reportType === "sales" ? (
                        (() => {
                            const cashData = reportData.paymentMethods.find(m => m.method === "Cash") || { method: "Cash", count: 234, percentage: 42.3 };
                            const cardData = reportData.paymentMethods.find(m => m.method === "Card") || { method: "Card", count: 268, percentage: 48.5 };
                            const mobileData = reportData.paymentMethods.find(m => m.method === "Mobile") || { method: "Mobile", count: 50, percentage: 9.2 };
                            
                            const cashRevenue = Math.round((reportData.summary.totalRevenue * cashData.percentage) / 100);
                            const cardRevenue = Math.round((reportData.summary.totalRevenue * cardData.percentage) / 100);
                            const mobileRevenue = Math.round((reportData.summary.totalRevenue * mobileData.percentage) / 100);

                            return (
                                <>
                                    <MetricCard
                                        title={t("reports.cash", "Cash")}
                                        value={`৳${cashRevenue.toLocaleString()}`}
                                        change={cashData.percentage}
                                        isPositive={true}
                                        icon={<Wallet className="w-4 h-4 text-emerald-500" />}
                                        subtitle={`${cashData.count} transactions`}
                                    />
                                    <MetricCard
                                        title={t("reports.card", "Card")}
                                        value={`৳${cardRevenue.toLocaleString()}`}
                                        change={cardData.percentage}
                                        isPositive={true}
                                        icon={<CreditCard className="w-4 h-4 text-blue-500" />}
                                        subtitle={`${cardData.count} transactions`}
                                    />
                                    <MetricCard
                                        title={t("reports.mobile", "Mobile")}
                                        value={`৳${mobileRevenue.toLocaleString()}`}
                                        change={mobileData.percentage}
                                        isPositive={true}
                                        icon={<Smartphone className="w-4 h-4 text-purple-500" />}
                                        subtitle={`${mobileData.count} transactions`}
                                    />
                                </>
                            );
                        })()
                    ) : (
                        <>
                            <MetricCard
                                title={t("reports.total_orders", "Total Orders")}
                                value={reportData.summary.totalOrders.toLocaleString()}
                                change={reportData.summary.ordersChange || 0}
                                isPositive={(reportData.summary.ordersChange || 0) >= 0}
                                icon={<ShoppingCart className="w-4 h-4 text-blue-400" />}
                            />
                            <MetricCard
                                title={t("reports.avg_order_value", "Avg Order Value")}
                                value={`৳${reportData.summary.averageOrderValue.toFixed(2)}`}
                                change={reportData.summary.avgOrderValueChange || 0}
                                isPositive={(reportData.summary.avgOrderValueChange || 0) >= 0}
                                icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
                            />
                            <MetricCard
                                title={t("reports.customers", "Customers")}
                                value={reportData.summary.customerCount.toLocaleString()}
                                change={reportData.summary.customerCountChange || 0}
                                isPositive={(reportData.summary.customerCountChange || 0) >= 0}
                                icon={<Users className="w-4 h-4 text-purple-400" />}
                            />
                        </>
                    )}
                </div>

                {/* Tab content 1: Overview */}
                {reportType === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-neutral-900">{t("reports.daily_sales_trend", "Daily Sales Trend")}</h2>
                                <BarChart3 className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportData.dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#a3a3a3"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => val.split(' ')[0]} // Only show date number
                                        />
                                        <YAxis
                                            stroke="#a3a3a3"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#171717', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#737373', fontSize: '12px', marginBottom: '4px' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="#f59e0b" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                            activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Sales Pie Chart */}
                        <div className="bg-white border border-neutral-200/80 rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight font-serif">{t("reports.sales_by_category", "Sales by Category")}</h2>
                                    <p className="text-xs text-neutral-400 mt-1">Revenue distribution across menu categories</p>
                                </div>
                                <div className="p-2.5 bg-neutral-50 rounded-full border border-neutral-100 text-neutral-500">
                                    <PieChart className="w-5 h-5 text-neutral-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Donut Chart */}
                                <div className="md:col-span-6 h-[260px] relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={reportData.categorySales}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={4}
                                                cornerRadius={6}
                                                dataKey="sales"
                                            >
                                                {reportData.categorySales.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: any, name: any, item: any) => [`৳${Number(value).toLocaleString()} (${item.payload.percentage.toFixed(1)}%)`, item.payload.category]}
                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                    
                                    {/* Center Text inside Donut */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Total Sales</span>
                                        <span className="text-lg font-black text-neutral-900">৳{reportData.summary.totalRevenue.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Category Legend Cards */}
                                <div className="md:col-span-6 space-y-2.5">
                                    {reportData.categorySales.map((item, index) => {
                                        const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                                        return (
                                            <div key={item.category} className="relative flex items-center justify-between p-3 bg-neutral-50/70 border border-neutral-100 rounded-[14px] hover:bg-neutral-100/60 transition-all overflow-hidden group">
                                                {/* Volume Bar Background */}
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-white/60 transition-all duration-500 ease-out" 
                                                    style={{ width: `${item.percentage}%`, backgroundColor: `${color}15` }} 
                                                />
                                                <div className="flex items-center gap-2.5 relative z-10">
                                                    <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: color }} />
                                                    <span className="text-xs font-bold text-neutral-800">{item.category}</span>
                                                </div>
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-700 shadow-2xs group-hover:scale-105 transition-transform">
                                                        {item.percentage.toFixed(1)}%
                                                    </span>
                                                    <span className="text-xs font-black text-neutral-900 w-16 text-right">
                                                        ৳{item.sales.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content 2: Sales */}
                {reportType === "sales" && (
                    <div className="space-y-6">
                        {/* Sales Section Header & Sub-View Switcher */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    {salesSubView === "all" && t("sales_details", "All Sales Details & Detailed Order Logs")}
                                    {salesSubView === "daily" && t("daily_calculations", "Daily Calculations & Today's Orders")}
                                    {salesSubView === "weekly" && t("weekly_calculations", "Weekly Calculations")}
                                    {salesSubView === "monthly" && t("monthly_calculations", "Monthly Calculations")}
                                </h2>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {salesSubView === "all" && "Complete detailed order log with exact timestamps, dates, customer names, items ordered, and payment modes."}
                                    {salesSubView === "daily" && "Calculations for today's sales with exact timestamps, orders, and average order value."}
                                    {salesSubView === "weekly" && "Performance calculations split by billing weeks."}
                                    {salesSubView === "monthly" && "Summary of operations by month including BOM material cost and net margins."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Popover open={isSalesMenuOpen} onOpenChange={setIsSalesMenuOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-between gap-3 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-sm font-bold text-neutral-800 shadow-sm hover:bg-neutral-100 hover:border-neutral-300 focus:outline-none transition-all min-w-[210px]"
                                        >
                                            <span className="flex items-center gap-2">
                                                {salesSubView === "all" && <><DollarSign className="w-4 h-4 text-emerald-600" /> <span>{t("all_sales", "All Sales Details")}</span></>}
                                                {salesSubView === "daily" && <><Calendar className="w-4 h-4 text-blue-600" /> <span>{t("reports.daily", "Daily (Today)")}</span></>}
                                                {salesSubView === "weekly" && <><Calendar className="w-4 h-4 text-amber-600" /> <span>{t("reports.weekly", "Weekly Report")}</span></>}
                                                {salesSubView === "monthly" && <><Calendar className="w-4 h-4 text-indigo-600" /> <span>{t("reports.monthly", "Monthly Report")}</span></>}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isSalesMenuOpen ? "rotate-180" : ""}`} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[230px] p-1.5 rounded-[12px] border border-neutral-200 shadow-xl bg-white z-50" align="end">
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => { setSalesSubView("all"); setIsSalesMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold transition-colors ${
                                                    salesSubView === "all" ? "bg-emerald-50 text-emerald-700 font-extrabold" : "text-neutral-700 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    <span>{t("all_sales", "All Sales Details")}</span>
                                                </span>
                                                {salesSubView === "all" && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setSalesSubView("daily"); setIsSalesMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold transition-colors ${
                                                    salesSubView === "daily" ? "bg-blue-50 text-blue-700 font-extrabold" : "text-neutral-700 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span>{t("reports.daily", "Daily (Today)")}</span>
                                                </span>
                                                {salesSubView === "daily" && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setSalesSubView("weekly"); setIsSalesMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold transition-colors ${
                                                    salesSubView === "weekly" ? "bg-amber-50 text-amber-700 font-extrabold" : "text-neutral-700 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-amber-600" />
                                                    <span>{t("reports.weekly", "Weekly Report")}</span>
                                                </span>
                                                {salesSubView === "weekly" && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setSalesSubView("monthly"); setIsSalesMenuOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold transition-colors ${
                                                    salesSubView === "monthly" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-neutral-700 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                                    <span>{t("reports.monthly", "Monthly Report")}</span>
                                                </span>
                                                {salesSubView === "monthly" && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Master Sales Card */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            {salesSubView === "all" && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900">Detailed Customer Sales Log</h3>
                                            <p className="text-xs text-neutral-400 mt-0.5">Exact date, arrival time, customer info, and items for every order.</p>
                                        </div>
                                        <span className="text-[11px] font-bold px-3 py-1 rounded-[8px] bg-neutral-100 text-neutral-700">
                                            Total Orders: {transactionsList.length}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Order ID</th>
                                                    <th className="px-4 py-3 font-semibold">Date & Time (কখন এসেছে)</th>
                                                    <th className="px-4 py-3 font-semibold">Customer Info</th>
                                                    <th className="px-4 py-3 font-semibold">Items Ordered</th>
                                                    <th className="px-4 py-3 font-semibold">Type & Payment</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {transactionsList.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-4 py-3.5 font-bold text-neutral-900">{tx.orderId}</td>
                                                        <td className="px-4 py-3.5 text-xs text-neutral-700 font-medium">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                                <span>{tx.dateTime}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 font-semibold text-neutral-800">
                                                            <button
                                                                onClick={() => handleCustomerClick(tx.customer, tx.phone)}
                                                                className="hover:text-primary transition-colors text-left group"
                                                                title="View Customer Profile"
                                                            >
                                                                <div className="font-bold flex items-center gap-1 group-hover:underline">
                                                                    <User className="w-3 h-3 text-neutral-400 group-hover:text-primary" />
                                                                    {tx.customer}
                                                                </div>
                                                                <div className="text-[10px] text-neutral-400 font-normal pl-4">{tx.phone}</div>
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-xs max-w-[280px]">
                                                             {renderItemBadges(tx.items)}
                                                         </td>
                                                        <td className="px-4 py-3.5 text-xs">
                                                            <span className="font-bold text-neutral-800">{tx.type}</span>
                                                            <span className="text-neutral-400 mx-1">•</span>
                                                            <span className="text-neutral-500 font-medium">{tx.payment}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right font-black text-emerald-600">৳{tx.amount.toLocaleString()}</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                tx.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                                tx.status === "Delivered" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                                                "bg-amber-50 text-amber-700 border border-amber-100"
                                                            }`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => setSelectedOrderDetails(tx)}
                                                                    className="p-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-[6px] text-xs font-bold transition-all shadow-sm active:scale-95"
                                                                    title="View Order Details"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedInvoiceOrder({
                                                                        orderId: tx.orderId,
                                                                        customer: tx.customer,
                                                                        phone: tx.phone,
                                                                        dateTime: tx.dateTime,
                                                                        items: tx.items,
                                                                        paymentMethod: tx.payment,
                                                                        orderType: tx.type,
                                                                        total: tx.amount,
                                                                        status: tx.status
                                                                    })}
                                                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-[6px] text-xs font-bold transition-all shadow-sm active:scale-95"
                                                                    title="Print Invoice"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingOrder(tx)}
                                                                    className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded-[6px] text-xs font-bold transition-all shadow-sm active:scale-95"
                                                                    title="Edit Order"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {salesSubView === "daily" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900">Today's Orders & Hourly Audit</h3>
                                            <p className="text-xs text-neutral-400 mt-0.5">Showing exact orders placed today (05 Aug 2026) with time details.</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-blue-50 text-blue-700 border-blue-200">Today's Orders</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Order ID</th>
                                                    <th className="px-4 py-3 font-semibold">Exact Time (কখন এসেছে)</th>
                                                    <th className="px-4 py-3 font-semibold">Customer Details</th>
                                                    <th className="px-4 py-3 font-semibold">Items</th>
                                                    <th className="px-4 py-3 font-semibold">Type & Mode</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Total Amount</th>
                                                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {transactionsList
                                                    .filter(tx => tx.date.includes(format(new Date(), "dd MMM")) || tx.date === "05 Aug 2026")
                                                    .map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-neutral-50/50 transition-colors">
                                                            <td className="px-4 py-3.5 font-bold text-neutral-900">{tx.orderId}</td>
                                                            <td className="px-4 py-3.5 text-xs text-neutral-800 font-bold">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                                    <span>{tx.time}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3.5 font-semibold text-neutral-800">
                                                                <div>{tx.customer}</div>
                                                                <div className="text-[10px] text-neutral-400 font-normal">{tx.phone}</div>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-xs text-neutral-700">{tx.items}</td>
                                                            <td className="px-4 py-3.5 text-xs">
                                                                <span className="font-bold text-neutral-800">{tx.type}</span>
                                                                <span className="text-neutral-400 mx-1">•</span>
                                                                <span className="text-neutral-500">{tx.payment}</span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right font-black text-emerald-600">৳{tx.amount.toLocaleString()}</td>
                                                            <td className="px-4 py-3.5 text-center">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-right">
                                                                <button
                                                                    onClick={() => setSelectedInvoiceOrder({
                                                                        orderId: tx.orderId,
                                                                        customer: tx.customer,
                                                                        phone: tx.phone,
                                                                        dateTime: tx.dateTime,
                                                                        items: tx.items,
                                                                        paymentMethod: tx.payment,
                                                                        orderType: tx.type,
                                                                        total: tx.amount,
                                                                        status: tx.status
                                                                    })}
                                                                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-[6px] text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                                                                    title="Print Invoice"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Invoice</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {salesSubView === "weekly" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900">Weekly Audit & Calculations</h3>
                                            <p className="text-xs text-neutral-400 mt-0.5">Calculations calculated by splitting current billing month into billing weeks.</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-amber-50 text-amber-700 border-amber-200">Weekly Breakdown</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold">Week</th>
                                                    <th className="px-6 py-3 font-semibold">Period</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Revenue</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Orders</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Avg Order (AOV)</th>
                                                    <th className="px-6 py-3 font-semibold">Top Product</th>
                                                    <th className="px-6 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {weeklyCalculations.map((week) => (
                                                    <tr key={week.id} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-neutral-900">{week.weekName}</td>
                                                        <td className="px-6 py-4 text-xs text-neutral-500">{week.period}</td>
                                                        <td className="px-6 py-4 text-right font-black text-emerald-600">৳{week.revenue.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right font-semibold text-neutral-700">{week.orders}</td>
                                                        <td className="px-6 py-4 text-right font-semibold text-neutral-500">৳{week.aov.toFixed(2)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                                                                {week.topProduct}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => setSelectedWeekly(week)} className="px-3.5 py-1.5 bg-neutral-100 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 ml-auto">
                                                                <Eye className="w-3.5 h-3.5" /> View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {salesSubView === "monthly" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900">Monthly Calculations & BOM Profit Margins</h3>
                                            <p className="text-xs text-neutral-400 mt-0.5">Summary of restaurant operations by month including material cost & net margins.</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-indigo-50 text-indigo-700 border-indigo-200">Monthly Breakdown</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold">Month</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Pocket (Revenue)</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Total Orders</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Average Order</th>
                                                    <th className="px-6 py-3 font-semibold text-right">BOM Material Cost</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Total Profit</th>
                                                    <th className="px-6 py-3 font-semibold text-right">Margin (%)</th>
                                                    <th className="px-6 py-3 text-right print:hidden">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {monthlyCalculations.map((month) => (
                                                    <tr key={month.id} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-neutral-900">{month.monthName}</td>
                                                        <td className="px-6 py-4 text-right font-black text-indigo-600">৳{month.revenue.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right font-semibold text-neutral-700">{month.orders}</td>
                                                        <td className="px-6 py-4 text-right font-semibold text-neutral-500">৳{month.aov.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-500 font-bold">৳{month.rawMaterialCost.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right text-emerald-600 font-black">৳{month.netProfit.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right font-black">
                                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-100">
                                                                {month.profitMargin.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right print:hidden">
                                                            <button onClick={() => setSelectedMonthly(month)} className="px-3.5 py-1.5 bg-neutral-100 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 ml-auto">
                                                                <Eye className="w-3.5 h-3.5" /> View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab content 3: Items */}
                {reportType === "items" && (
                    <div className="bg-white border border-neutral-200/80 rounded-[24px] p-8 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight font-serif">Top Selling Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-neutral-400 uppercase text-[11px] tracking-widest">
                                        <th className="text-left py-4 font-bold">{t("reports.item_name", "ITEM NAME")}</th>
                                        <th className="text-right py-4 font-bold">{t("reports.quantity_sold", "QUANTITY SOLD")}</th>
                                        <th className="text-right py-4 font-bold">{t("reports.revenue", "REVENUE")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100/70">
                                    {reportData.topItems.map((item, index) => (
                                        <tr key={item.name} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 text-neutral-900 font-bold">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                                                        index === 0 ? "bg-amber-100/90 text-amber-800" :
                                                        index === 1 ? "bg-slate-100 text-slate-700" :
                                                        index === 2 ? "bg-orange-100/90 text-orange-800" : "bg-neutral-100 text-neutral-600"
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-sm font-bold text-neutral-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-right py-4 text-neutral-700 font-bold text-sm">{item.quantity}</td>
                                            <td className="text-right py-4 text-neutral-900 font-black text-sm">৳{item.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab content: Daily calculations (standalone view fallback) */}
                {reportType === "daily" && (
                    <div className="space-y-6">
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">{t("reports.daily_calculations", "Daily Calculations")}</h2>
                                    <p className="text-xs text-neutral-400 mt-0.5">Calculations for the recent daily performance.</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">Daily Audit</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Date</th>
                                            <th className="px-6 py-3 font-semibold text-right">Revenue</th>
                                            <th className="px-6 py-3 font-semibold text-right">Orders</th>
                                            <th className="px-6 py-3 font-semibold text-right">Avg Order (AOV)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {reportData.dailySales.map((day, idx) => (
                                            <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-900">{day.date}</td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600">৳{day.sales.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-700">{day.orders}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-500">৳{(day.sales / day.orders).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content: Weekly calculations (standalone view fallback) */}
                {reportType === "weekly" && (
                    <div className="space-y-6">
                        {/* Weekly reports calculations */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">{t("reports.weekly_calculations", "Weekly Calculations")}</h2>
                                    <p className="text-xs text-neutral-400 mt-0.5">Calculations calculated by splitting the current billing month.</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase">Weekly Audit</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Week</th>
                                            <th className="px-6 py-3 font-semibold">Period</th>
                                            <th className="px-6 py-3 font-semibold text-right">Revenue</th>
                                            <th className="px-6 py-3 font-semibold text-right">Orders</th>
                                            <th className="px-6 py-3 font-semibold text-right">Avg Order (AOV)</th>
                                            <th className="px-6 py-3 font-semibold">Top Product</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {weeklyCalculations.map((week) => (
                                            <tr key={week.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-900">{week.weekName}</td>
                                                <td className="px-6 py-4 text-xs text-neutral-500">{week.period}</td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600">৳{week.revenue.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-700">{week.orders}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-500">৳{week.aov.toFixed(2)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                                                        {week.topProduct}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedWeekly(week)}
                                                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content: Monthly calculations (standalone view fallback) */}
                {reportType === "monthly" && (
                    <div className="space-y-6">
                        {/* Monthly reports calculations */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">{t("reports.monthly_calculations", "Monthly Calculations")}</h2>
                                    <p className="text-xs text-neutral-400 mt-0.5">Summary of restaurant operations by month, including recipe-cost calculations and net margins.</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase">Monthly Audit</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Month</th>
                                            <th className="px-6 py-3 font-semibold text-right">Pocket (Revenue)</th>
                                            <th className="px-6 py-3 font-semibold text-right">Total Orders</th>
                                            <th className="px-6 py-3 font-semibold text-right">Average Order</th>
                                            <th className="px-6 py-3 font-semibold text-right">BOM Material Cost</th>
                                            <th className="px-6 py-3 font-semibold text-right">Total Profit</th>
                                            <th className="px-6 py-3 font-semibold text-right">Margin (%)</th>
                                            <th className="px-6 py-3 text-right print:hidden">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {monthlyCalculations.map((month) => (
                                            <tr key={month.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-900">{month.monthName}</td>
                                                <td className="px-6 py-4 text-right font-black text-indigo-600">৳{month.revenue.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-700">{month.orders}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-neutral-500">৳{month.aov.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right text-rose-500 font-bold">৳{month.rawMaterialCost.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-emerald-600 font-black">৳{month.netProfit.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-black">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs border border-emerald-100">
                                                        {month.profitMargin.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right print:hidden">
                                                    <button
                                                        onClick={() => setSelectedMonthly(month)}
                                                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content: Online Orders */}
                {reportType === "online" && (() => {
                    const sampleAddresses = ["Dhanmondi 27", "Gulshan 2", "Uttara Sector 11", "Banani Road 11", "Mirpur 10"];
                    const onlineOrdersList = transactionsList.map((t, idx) => ({
                        id: t.id,
                        orderId: t.orderId,
                        date: t.date,
                        dateTime: t.dateTime,
                        customer: t.customer,
                        phone: t.phone || "01933445566",
                        address: t.address || sampleAddresses[idx % sampleAddresses.length],
                        product: t.items,
                        qty: 1,
                        amount: t.amount,
                        payment: t.payment,
                        status: t.status,
                        type: t.type
                    })).filter(t => t.type === "Online Delivery" || t.address);
                    
                    const displayOnlineList = onlineOrdersList.length > 0 ? onlineOrdersList : transactionsList.slice(0, 4).map((t, idx) => ({
                        id: t.id,
                        orderId: t.orderId,
                        date: t.date,
                        dateTime: t.dateTime,
                        customer: t.customer,
                        phone: t.phone || "01933445566",
                        address: sampleAddresses[idx % sampleAddresses.length],
                        product: t.items,
                        qty: 1,
                        amount: t.amount,
                        payment: t.payment,
                        status: t.status,
                        type: "Online Delivery" as const
                    }));

                    const totalOnlineOrdersCount = displayOnlineList.length;
                    const totalOnlineRevenue = displayOnlineList.reduce((sum, order) => sum + order.amount, 0);
                    const totalOnlineProfit = Math.round(totalOnlineRevenue * 0.65); // Estimated 65% profit margin

                    return (
                        <div className="space-y-6">
                            {/* Summary Cards for Online Orders */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white border border-neutral-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">TOTAL ONLINE ORDERS</h3>
                                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-3xl font-black text-neutral-900">{totalOnlineOrdersCount}</div>
                                </div>
                                <div className="bg-white border border-neutral-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">TOTAL POCKET (REVENUE)</h3>
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-3xl font-black text-emerald-600">৳{totalOnlineRevenue.toLocaleString()}</div>
                                </div>
                                <div className="bg-white border border-neutral-200/80 rounded-[20px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">TOTAL PROFIT (EST. 65%)</h3>
                                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="text-3xl font-black text-indigo-600">৳{totalOnlineProfit.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200/80 rounded-[24px] p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight font-serif">{t("reports.online_orders", "Online / E-Commerce Orders")}</h2>
                                        <p className="text-xs text-neutral-400 mt-1">Showing orders placed through the website or third-party online platforms.</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-200 uppercase tracking-wider">
                                        ONLINE AUDIT
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-neutral-50/80 text-neutral-400 uppercase text-[11px] tracking-wider border-b border-neutral-200">
                                            <tr>
                                                <th className="px-6 py-3.5 font-bold">ORDER ID</th>
                                                <th className="px-6 py-3.5 font-bold">DATE</th>
                                                <th className="px-6 py-3.5 font-bold">CUSTOMER</th>
                                                <th className="px-6 py-3.5 font-bold">DELIVERY ADDRESS</th>
                                                <th className="px-6 py-3.5 font-bold">PRODUCT</th>
                                                <th className="px-6 py-3.5 font-bold text-center">QTY</th>
                                                <th className="px-6 py-3.5 font-bold text-right">AMOUNT</th>
                                                <th className="px-6 py-3.5 font-bold text-center">STATUS</th>
                                                <th className="px-6 py-3.5 font-bold text-right">INVOICE</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {displayOnlineList
                                                .sort((a, b) => b.orderId.localeCompare(a.orderId))
                                                .map((order, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-neutral-900">{order.orderId}</td>
                                                        <td className="px-6 py-4 text-xs text-neutral-500 font-medium">{order.date}</td>
                                                        <td className="px-6 py-4 font-medium text-neutral-800">
                                                            <div className="font-bold text-neutral-900">{order.customer}</div>
                                                            <div className="text-[10px] text-neutral-400 font-mono">{order.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-neutral-600 font-medium max-w-[160px] truncate" title={order.address}>{order.address}</td>
                                                        <td className="px-6 py-4 text-xs max-w-[220px]">
                                                            {renderItemBadges(order.product)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-neutral-700">{order.qty}</td>
                                                        <td className="px-6 py-4 text-right font-black text-emerald-600">৳{order.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedInvoiceOrder({
                                                                    orderId: order.orderId,
                                                                    customer: order.customer,
                                                                    phone: order.phone,
                                                                    address: order.address,
                                                                    dateTime: order.dateTime,
                                                                    items: order.product,
                                                                    total: order.amount,
                                                                    orderType: "Online Delivery",
                                                                    paymentMethod: order.payment || "bKash / Mobile",
                                                                    status: order.status
                                                                })}
                                                                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 rounded-[6px] text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs active:scale-95 ml-auto"
                                                                title="Print Invoice"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>Invoice</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Tab content 5: Product Sales Count list (NEW ERP addition) */}
                {reportType === "products" && (
                    <div className="bg-white border border-neutral-200/80 rounded-[24px] p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 tracking-tight font-serif">{t("reports.product_sales_count", "Product Sales Count")}</h2>
                                <p className="text-xs text-neutral-400 mt-1">Tracking unit sales of each product with raw materials BOM status.</p>
                            </div>
                            
                            {/* Search bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search products or categories..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 rounded-[12px] pl-10 pr-4 py-2.5 text-xs text-neutral-900 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50/80 text-neutral-400 uppercase text-[11px] tracking-wider border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-3.5 cursor-pointer select-none font-bold" onClick={() => handleSortProduct("name")}>
                                            <div className="flex items-center gap-1.5">PRODUCT NAME <ArrowUpDown className="w-3 h-3 text-neutral-400" /></div>
                                        </th>
                                        <th className="px-6 py-3.5 font-bold">CATEGORY</th>
                                        <th className="px-6 py-3.5 text-right cursor-pointer select-none font-bold" onClick={() => handleSortProduct("qty")}>
                                            <div className="flex items-center justify-end gap-1.5">UNITS SOLD <ArrowUpDown className="w-3 h-3 text-neutral-400" /></div>
                                        </th>
                                        <th className="px-6 py-3.5 text-right cursor-pointer select-none font-bold" onClick={() => handleSortProduct("revenue")}>
                                            <div className="flex items-center justify-end gap-1.5">TOTAL REVENUE <ArrowUpDown className="w-3 h-3 text-neutral-400" /></div>
                                        </th>
                                        <th className="px-6 py-3.5 text-center font-bold">PROFIT MARGIN</th>
                                        <th className="px-6 py-3.5 text-center font-bold">BOM STATUS</th>
                                        <th className="px-6 py-3.5 text-center font-bold">TREND (7 DAYS)</th>
                                        <th className="px-6 py-3.5 text-right font-bold">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100/70">
                                    {getSortedProducts().map((product) => {
                                        const missingIngredients = product.ingredients.filter(i => !i.inStock).length;
                                        const mockMargin = 55 + (product.name.length % 25);
                                        const isHighMargin = mockMargin >= 65;
                                        
                                        return (
                                            <tr key={product.id} className="hover:bg-neutral-50/80 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                                                            {product.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">{product.name}</span>
                                                            <span className="text-[10px] text-neutral-400 font-medium">৳{product.price.toFixed(2)} / unit</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] bg-neutral-100 border border-neutral-200/60 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-neutral-800">{product.qtySold} <span className="text-[10px] text-neutral-400 uppercase">units</span></td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">৳{product.revenue.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center gap-1.5 w-24 mx-auto">
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className={`text-[11px] font-bold ${isHighMargin ? 'text-emerald-600' : 'text-amber-600'}`}>{mockMargin}%</span>
                                                            <span className="text-[9px] text-neutral-400 font-medium uppercase tracking-wider">Gross</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${isHighMargin ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${mockMargin}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {missingIngredients > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-sm whitespace-nowrap">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                            {missingIngredients} Item{missingIngredients > 1 ? 's' : ''} Low
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm whitespace-nowrap">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-24 h-8 mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={product.salesTrend}>
                                                                <defs>
                                                                    <linearGradient id={`colorQty-${product.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="qty" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill={`url(#colorQty-${product.id})`} />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-[8px] text-xs font-bold text-neutral-700 transition-all inline-flex items-center gap-1 shadow-sm active:scale-95 ml-auto">
                                                                Actions <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-[12px] shadow-xl border-neutral-100">
                                                            <DropdownMenuItem 
                                                                onClick={() => setSelectedProduct(product)}
                                                                className="cursor-pointer text-xs font-bold text-neutral-700 focus:bg-emerald-50 focus:text-emerald-700 rounded-[8px] transition-colors flex items-center gap-2 py-2"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View Analysis
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => setEditingBOMProduct(product)}
                                                                className="cursor-pointer text-xs font-bold text-neutral-700 focus:bg-neutral-100 rounded-[8px] transition-colors flex items-center gap-2 py-2"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" /> Edit BOM Recipe
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-neutral-100 my-1 mx-2" />
                                                            <DropdownMenuItem 
                                                                onClick={() => toast.success(`${product.name} marked as Out of Stock.`)}
                                                                className="cursor-pointer text-xs font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-[8px] transition-colors flex items-center gap-2 py-2"
                                                            >
                                                                <Activity className="w-3.5 h-3.5" /> Mark Out of Stock
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getSortedProducts().length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-neutral-400">
                                                    <Layers className="w-8 h-8 mb-3 opacity-20" />
                                                    <p className="font-medium">No products found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Weekly Detail */}
            {selectedWeekly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">Weekly Breakdown: {selectedWeekly.weekName}</h3>
                                <p className="text-xs text-neutral-400">{selectedWeekly.period}</p>
                            </div>
                            <button onClick={() => setSelectedWeekly(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Revenue</p>
                                    <p className="text-xl font-black text-emerald-600 mt-1">৳{selectedWeekly.revenue.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Orders</p>
                                    <p className="text-xl font-black text-blue-600 mt-1">{selectedWeekly.orders}</p>
                                </div>
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Avg Ticket (AOV)</p>
                                    <p className="text-xl font-black text-amber-600 mt-1">৳{selectedWeekly.aov.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Daily Sales Trend</h4>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedWeekly.dailyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="day" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Two Column details: Payments share & daily table */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Payments distribution */}
                                <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Payment Methods Share</h4>
                                    <div className="space-y-2">
                                        {selectedWeekly.payments.map((p, idx) => (
                                            <div key={p.method} className="flex items-center justify-between text-xs p-2 bg-neutral-50 rounded bg-neutral-50 border border-neutral-100">
                                                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                                                    {p.method}
                                                </span>
                                                <span className="font-black text-neutral-900">{p.share}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary details list */}
                                <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Summary Operations</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-neutral-400">Peak Category:</span>
                                            <span className="font-bold text-neutral-800">{selectedWeekly.topCategory}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-neutral-400">Star Product:</span>
                                            <span className="font-bold text-neutral-800">{selectedWeekly.topProduct}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Compliance Rate:</span>
                                            <span className="font-bold text-emerald-600">100% Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setSelectedWeekly(null)} className="px-5 py-2 bg-neutral-900 text-white rounded-[10px] text-xs font-bold hover:bg-neutral-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Monthly Detail */}
            {selectedMonthly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">Monthly Operational Audit: {selectedMonthly.monthName}</h3>
                                <p className="text-xs text-neutral-400">Recipe materials deduction and margin calculation analysis.</p>
                            </div>
                            <button onClick={() => setSelectedMonthly(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {/* KPI Metrics with Costs and Net Profit */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[16px]">
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Gross Sales</p>
                                    <p className="text-lg font-black text-neutral-900 mt-1">৳{selectedMonthly.revenue.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-[16px]">
                                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Raw Material Cost</p>
                                    <p className="text-lg font-black text-rose-600 mt-1">৳{selectedMonthly.rawMaterialCost.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-[16px]">
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Net Profit</p>
                                    <p className="text-lg font-black text-emerald-600 mt-1">৳{selectedMonthly.netProfit.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-[16px]">
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Profit Margin</p>
                                    <p className="text-lg font-black text-indigo-600 mt-1">{selectedMonthly.profitMargin.toFixed(1)}%</p>
                                </div>
                            </div>

                            {/* Recharts Bar Chart of weekly sales */}
                            <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Weekly Revenue Breakdown</h4>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={selectedMonthly.weeklyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="week" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                                            <RechartsTooltip />
                                            <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Categories breakdown for that month */}
                            <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Sales Share by Category</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    {selectedMonthly.categories.map((c, idx) => (
                                        <div key={c.category} className="p-2 border border-neutral-100 rounded-[10px] flex items-center justify-between">
                                            <span className="text-neutral-500 font-bold flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                {c.category}
                                            </span>
                                            <span className="font-black text-neutral-800">৳{c.sales.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setSelectedMonthly(null)} className="px-5 py-2 bg-neutral-900 text-white rounded-[10px] text-xs font-bold hover:bg-neutral-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Product Detail (Drill down) */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[14px] bg-white border border-emerald-100 flex items-center justify-center shadow-sm">
                                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{selectedProduct.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-[6px] bg-white border border-neutral-200 text-[10px] font-bold text-neutral-600 uppercase tracking-widest shadow-2xs">
                                            {selectedProduct.category}
                                        </span>
                                        <span className="text-xs font-medium text-neutral-500">Unit Price: <strong className="text-neutral-900">৳{selectedProduct.price.toFixed(2)}</strong></span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="relative z-10 p-2.5 text-neutral-400 hover:text-rose-600 bg-white border border-neutral-200 hover:border-rose-200 hover:bg-rose-50 transition-all rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] bg-neutral-50/30">
                            {/* Product metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                <div className="relative overflow-hidden p-5 bg-white border border-indigo-100 rounded-[20px] shadow-sm flex flex-col items-center justify-center">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-60 -mr-8 -mt-8 pointer-events-none" />
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest relative z-10">Units Sold</p>
                                    <p className="text-3xl font-black text-indigo-700 mt-1 relative z-10">{selectedProduct.qtySold}</p>
                                </div>
                                <div className="relative overflow-hidden p-5 bg-white border border-emerald-100 rounded-[20px] shadow-sm flex flex-col items-center justify-center">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-60 -mr-8 -mt-8 pointer-events-none" />
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest relative z-10">Revenue Generated</p>
                                    <p className="text-3xl font-black text-emerald-600 mt-1 relative z-10">৳{selectedProduct.revenue.toLocaleString()}</p>
                                </div>
                                <div className="relative overflow-hidden p-5 bg-white border border-amber-100 rounded-[20px] shadow-sm flex flex-col items-center justify-center">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-60 -mr-8 -mt-8 pointer-events-none" />
                                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest relative z-10">Market Contribution</p>
                                    <p className="text-3xl font-black text-amber-600 mt-1 relative z-10">
                                        {((selectedProduct.revenue / 15100) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white border border-neutral-200/80 rounded-[20px] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Daily Sales volume (Units)</h4>
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedProduct.salesTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="day" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="qty" stroke="#10b981" strokeWidth={3.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recipes and stock matching */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Bill of Materials (BOM) Linked items */}
                                <div className="bg-white border border-neutral-200/80 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                                    <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-widest">BOM Raw Ingredients</h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-500 border border-neutral-200">
                                            {selectedProduct.ingredients.length} Items
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3 flex-1">
                                        {selectedProduct.ingredients.map((ingredient) => (
                                            <div key={ingredient.name} className="flex items-center justify-between p-3 border border-neutral-100 rounded-[12px] bg-white shadow-2xs hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ingredient.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        <Layers className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-800 text-sm">{ingredient.name}</p>
                                                        <p className="text-[10px] text-neutral-400 font-medium">Req. Qty: <span className="text-neutral-600">{ingredient.quantity}</span></p>
                                                    </div>
                                                </div>
                                                <span>
                                                    {ingredient.inStock ? (
                                                        <span className="px-2.5 py-1 rounded-[6px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px] flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-[6px] bg-rose-50 text-rose-700 font-bold border border-rose-100 text-[10px] flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Low Stock
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent orders purchasing this item */}
                                <div className="bg-white border border-neutral-200/80 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                                    <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Recent Orders Log</h4>
                                        <Clock className="w-4 h-4 text-neutral-400" />
                                    </div>
                                    <div className="p-4 space-y-3 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {selectedProduct.recentOrders.map((ord) => (
                                            <div key={ord.orderId} className="flex items-center justify-between p-3 border border-neutral-100 rounded-[12px] bg-white shadow-2xs hover:bg-neutral-50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 text-sm group-hover:text-emerald-700 transition-colors">{ord.orderId}</p>
                                                        <p className="text-[10px] text-neutral-400 font-medium">{ord.date} • {ord.customer}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-neutral-800">{ord.qty} <span className="text-[10px] text-neutral-400 font-medium uppercase">units</span></p>
                                                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-bold uppercase tracking-wider">
                                                        {ord.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-neutral-100 flex justify-end rounded-b-[24px]">
                            <button onClick={() => setSelectedProduct(null)} className="px-6 py-2.5 bg-neutral-900 text-white rounded-[12px] text-xs font-bold hover:bg-neutral-800 transition-colors shadow-md hover:shadow-lg active:scale-95">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Order Details */}
            {selectedOrderDetails && (() => {
                const parseItems = (itemsInput: any, totalAmount: number) => {
                    if (Array.isArray(itemsInput)) {
                        return itemsInput.map((i: any) => ({
                            name: i.title || i.name || "Item",
                            qty: i.quantity || i.qty || 1,
                            price: i.price || Math.round(totalAmount / (itemsInput.length || 1)),
                            addOns: i.addOns || []
                        }));
                    } else if (typeof itemsInput === "string") {
                        const parts = itemsInput.split(",");
                        const parsed = parts.map((part) => {
                            const trimmed = part.trim();
                            const match = trimmed.match(/^(\d+)x\s+(.+)$/);
                            if (match) {
                                return {
                                    name: match[2],
                                    qty: parseInt(match[1], 10),
                                    price: 0,
                                    addOns: []
                                };
                            }
                            return {
                                name: trimmed,
                                qty: 1,
                                price: 0,
                                addOns: []
                            };
                        });
                        
                        const totalQty = parsed.reduce((sum, i) => sum + i.qty, 0);
                        return parsed.map(item => ({
                            ...item,
                            price: totalQty > 0 ? Math.round((totalAmount * (item.qty / totalQty)) / item.qty) : totalAmount
                        }));
                    }
                    return [{ name: "General Menu Items", qty: 1, price: totalAmount, addOns: [] }];
                };

                const itemList = parseItems(selectedOrderDetails.items, selectedOrderDetails.amount);
                const subtotal = Math.round(selectedOrderDetails.amount * 0.85);
                const vatTax = selectedOrderDetails.amount - subtotal;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden my-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-neutral-900">{selectedOrderDetails.orderId}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            selectedOrderDetails.type === "Online Delivery" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                                            selectedOrderDetails.type === "Takeaway" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                            "bg-blue-50 text-blue-700 border border-blue-100"
                                        }`}>
                                            {selectedOrderDetails.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-0.5">{selectedOrderDetails.dateTime}</p>
                                </div>
                                <button onClick={() => setSelectedOrderDetails(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                                {/* Customer & Payment Summary Card */}
                                <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-[16px] space-y-3">
                                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm">
                                                {selectedOrderDetails.customer.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => {
                                                        const custName = selectedOrderDetails.customer;
                                                        const custPhone = selectedOrderDetails.phone;
                                                        setSelectedOrderDetails(null);
                                                        handleCustomerClick(custName, custPhone);
                                                    }}
                                                    className="font-bold text-neutral-900 text-sm hover:text-primary hover:underline text-left flex items-center gap-1.5"
                                                    title="Click to view Customer Profile"
                                                >
                                                    {selectedOrderDetails.customer}
                                                    <User className="w-3.5 h-3.5 text-neutral-400" />
                                                </button>
                                                <p className="text-xs text-neutral-500 font-mono">{selectedOrderDetails.phone}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const custName = selectedOrderDetails.customer;
                                                const custPhone = selectedOrderDetails.phone;
                                                setSelectedOrderDetails(null);
                                                handleCustomerClick(custName, custPhone);
                                            }}
                                            className="px-3 py-1 bg-white border border-neutral-200 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all shadow-sm"
                                        >
                                            Profile
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-neutral-400 font-medium block">Payment Method:</span>
                                            <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                {selectedOrderDetails.payment}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 font-medium block">Order Status:</span>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase text-[10px]">
                                                ✓ {selectedOrderDetails.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Itemized Products Table */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Products & Items Purchased</h4>
                                        <span className="text-xs text-neutral-400 font-bold">{itemList.length} Items</span>
                                    </div>

                                    <div className="bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-4 py-2.5 font-bold">Item Description</th>
                                                    <th className="px-4 py-2.5 font-bold text-center">Qty</th>
                                                    <th className="px-4 py-2.5 font-bold text-right">Price</th>
                                                    <th className="px-4 py-2.5 font-bold text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {itemList.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50/50">
                                                        <td className="px-4 py-3 font-semibold text-neutral-900">
                                                            <div>{item.name}</div>
                                                            {item.addOns && item.addOns.length > 0 && (
                                                                <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                                                                    + {item.addOns.map((a: any) => a.name).join(", ")}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-neutral-700">
                                                            <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-800">
                                                                {item.qty}x
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-neutral-500">
                                                            ৳{item.price.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-black text-neutral-900">
                                                            ৳{(item.qty * item.price).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-[16px] space-y-1.5 text-xs">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold text-neutral-800">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Estimated VAT / Tax (15%):</span>
                                        <span className="font-semibold text-neutral-800">৳{vatTax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                                        <span>Grand Total Paid:</span>
                                        <span className="text-emerald-600 text-lg">৳{selectedOrderDetails.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const tx = selectedOrderDetails;
                                            setSelectedOrderDetails(null);
                                            setSelectedInvoiceOrder({
                                                orderId: tx.orderId,
                                                customer: tx.customer,
                                                phone: tx.phone,
                                                dateTime: tx.dateTime,
                                                items: tx.items,
                                                paymentMethod: tx.payment,
                                                orderType: tx.type,
                                                total: tx.amount,
                                                status: tx.status
                                            });
                                        }}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        <Printer className="w-4 h-4" /> Print Invoice
                                    </button>
                                    <button
                                        onClick={() => {
                                            const tx = selectedOrderDetails;
                                            setSelectedOrderDetails(null);
                                            setEditingOrder(tx);
                                        }}
                                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Order
                                    </button>
                                </div>
                                <button onClick={() => setSelectedOrderDetails(null)} className="px-5 py-2.5 bg-neutral-900 text-white rounded-[10px] text-xs font-bold hover:bg-black transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Modal: Edit Order */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">Edit Order: {editingOrder.orderId}</h3>
                                <p className="text-xs text-neutral-400">Update order details, payment mode or status.</p>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveOrderEdit(editingOrder); }} className="p-6 space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-neutral-500 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={editingOrder.customer}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, customer: e.target.value })}
                                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-neutral-900 font-bold focus:bg-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-500 mb-1">Customer Phone</label>
                                <input
                                    type="text"
                                    value={editingOrder.phone}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-neutral-900 font-bold focus:bg-white focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-500 mb-1">Payment Method</label>
                                    <select
                                        value={editingOrder.payment}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, payment: e.target.value as any })}
                                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-neutral-900 font-bold focus:bg-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                        <option value="bKash / Mobile">bKash / Mobile</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-neutral-500 mb-1">Order Status</label>
                                    <select
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-neutral-900 font-bold focus:bg-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="Completed">Completed</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-500 mb-1">Total Amount (৳)</label>
                                <input
                                    type="number"
                                    value={editingOrder.amount}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, amount: Number(e.target.value) })}
                                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-[10px] text-neutral-900 font-bold focus:bg-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                                <button type="button" onClick={() => setEditingOrder(null)} className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-[10px] font-bold hover:bg-neutral-200">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-[10px] font-bold flex items-center gap-1.5">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Customer Profile & Order History */}
            {selectedCustomerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                                    {selectedCustomerModal.customer.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-neutral-900">{selectedCustomerModal.customer}</h3>
                                    <p className="text-xs text-neutral-400">Phone: {selectedCustomerModal.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomerModal(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Spent</p>
                                    <p className="text-xl font-black text-emerald-600 mt-1">৳{selectedCustomerModal.totalSpent.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Orders</p>
                                    <p className="text-xl font-black text-blue-600 mt-1">{selectedCustomerModal.totalOrders}</p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Avg Order Ticket</p>
                                    <p className="text-xl font-black text-amber-600 mt-1">
                                        ৳{(selectedCustomerModal.totalOrders > 0 ? selectedCustomerModal.totalSpent / selectedCustomerModal.totalOrders : 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Order History Log</h4>
                                <div className="space-y-2">
                                    {selectedCustomerModal.orders.map((ord) => (
                                        <div key={ord.id} className="p-3.5 bg-neutral-50 border border-neutral-100 rounded-[12px] flex items-center justify-between text-xs">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-neutral-900 text-sm">{ord.orderId}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium">{ord.dateTime}</span>
                                                </div>
                                                {renderItemBadges(ord.items)}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="font-black text-emerald-600 text-sm block">৳{ord.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] text-neutral-500 font-medium">{ord.payment}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomerModal(null);
                                                        setSelectedInvoiceOrder({
                                                            orderId: ord.orderId,
                                                            customer: ord.customer,
                                                            phone: ord.phone,
                                                            dateTime: ord.dateTime,
                                                            items: ord.items,
                                                            paymentMethod: ord.payment,
                                                            orderType: ord.type,
                                                            total: ord.amount,
                                                            status: ord.status
                                                        });
                                                    }}
                                                    className="p-1.5 bg-white border border-neutral-200 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 rounded-[6px] transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setSelectedCustomerModal(null)} className="px-5 py-2 bg-neutral-900 text-white rounded-[10px] text-xs font-bold hover:bg-neutral-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: BOM Recipe Editor */}
            {editingBOMProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-neutral-200 rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-[12px] bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-sm">
                                    {editingBOMProduct.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">Edit BOM Recipe</h3>
                                    <p className="text-xs font-bold text-neutral-500 mt-0.5">{editingBOMProduct.name} • {editingBOMProduct.category}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingBOMProduct(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100 bg-white shadow-sm border border-neutral-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 flex items-start gap-3">
                                <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">Recipe Warning</h4>
                                    <p className="text-xs text-amber-700 mt-1">Changes to the BOM will immediately affect cost calculations and inventory deductions for all future orders.</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-neutral-900">Raw Materials & Ingredients</h4>
                                    <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-[8px] hover:bg-emerald-100 transition-colors">
                                        + Add Ingredient
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {editingBOMProduct.ingredients.map((ingredient, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-[12px] shadow-sm">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Ingredient Name</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue={ingredient.name}
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-sm font-bold text-neutral-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div className="w-24 shrink-0">
                                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Quantity</label>
                                                <input 
                                                    type="text" 
                                                    defaultValue={ingredient.quantity}
                                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-[8px] px-3 py-2 text-sm font-bold text-neutral-800 text-center focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div className="shrink-0 self-end mb-1">
                                                <button className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-[8px] transition-colors" title="Remove Ingredient">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3 rounded-b-[24px]">
                            <button onClick={() => setEditingBOMProduct(null)} className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-[12px] text-xs font-bold hover:bg-neutral-50 transition-colors shadow-sm">
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success("BOM Recipe updated successfully!");
                                    setEditingBOMProduct(null);
                                }} 
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-[12px] text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {selectedInvoiceOrder && (
                <InvoiceModal
                    order={selectedInvoiceOrder}
                    onClose={() => setSelectedInvoiceOrder(null)}
                />
            )}
        </AdminLayout>
    );
};

// Metric Card Component
const MetricCard = ({ 
    title, 
    value, 
    change, 
    isPositive, 
    icon,
    subtitle
}: { 
    title: string; 
    value: string; 
    change: number; 
    isPositive: boolean; 
    icon: React.ReactNode;
    subtitle?: string;
}) => (
    <div className="bg-white border border-neutral-200/60 rounded-[20px] p-6 hover:shadow-lg hover:border-neutral-300 transition-all duration-300 relative overflow-hidden group">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neutral-50 to-transparent rounded-full opacity-50 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex items-start justify-between mb-6 relative z-10">
            <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{title}</h3>
            <div className="p-2.5 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-[12px] border border-neutral-100 shadow-sm group-hover:shadow transition-shadow">
                {icon}
            </div>
        </div>
        
        <div className="relative z-10">
            <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-black text-neutral-900 tracking-tight">{value}</span>
            </div>
            
            <div className="flex items-center justify-between">
                {subtitle ? (
                    <div className="text-xs text-neutral-400 font-medium">
                        {subtitle}
                    </div>
                ) : (
                    <div className="h-4" />
                )}
                
                {change !== undefined && change !== 0 && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default AdminReports;
