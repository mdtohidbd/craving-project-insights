import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { 
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar,
    Download, Filter, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
    Search, X, Eye, ArrowUpDown, Printer
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from "recharts";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Calendar as CalendarWidget } from "../../components/ui/calendar";
import { cn } from "../../lib/utils";

interface ReportData {
    dailySales: { date: string; sales: number; orders: number }[];
    categorySales: { category: string; sales: number; percentage: number }[];
    topItems: { name: string; quantity: number; revenue: number }[];
    paymentMethods: { method: string; count: number; percentage: number }[];
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        customerCount: number;
        revenueChange: number;
        ordersChange: number;
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

const AdminReports = () => {
    const { t } = useTranslation();
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    });
    const [reportType, setReportType] = useState("overview"); // overview, sales, items, weekly_monthly, products

    // Product search/sort state
    const [productSearch, setProductSearch] = useState("");
    const [productSort, setProductSort] = useState<"qty" | "revenue" | "name">("qty");
    const [productSortOrder, setProductSortOrder] = useState<"asc" | "desc">("desc");

    // Modal states
    const [selectedWeekly, setSelectedWeekly] = useState<WeeklyCalculation | null>(null);
    const [selectedMonthly, setSelectedMonthly] = useState<MonthlyCalculation | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductSale | null>(null);

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
            
            // Mock data for demo
            const mockData: ReportData = {
                dailySales: [
                    { date: "Mon", sales: 1200, orders: 45 },
                    { date: "Tue", sales: 1800, orders: 62 },
                    { date: "Wed", sales: 1500, orders: 51 },
                    { date: "Thu", sales: 2200, orders: 78 },
                    { date: "Fri", sales: 2800, orders: 95 },
                    { date: "Sat", sales: 3200, orders: 110 },
                    { date: "Sun", sales: 2500, orders: 85 }
                ],
                categorySales: [
                    { category: "Appetizers", sales: 2800, percentage: 18.5 },
                    { category: "Main Course", sales: 6200, percentage: 41.0 },
                    { category: "Desserts", sales: 1800, percentage: 11.9 },
                    { category: "Beverages", sales: 3200, percentage: 21.2 },
                    { category: "Others", sales: 1100, percentage: 7.4 }
                ],
                topItems: [
                    { name: "Grilled Chicken", quantity: 145, revenue: 4350 },
                    { name: "Pasta Alfredo", quantity: 128, revenue: 3840 },
                    { name: "Caesar Salad", quantity: 112, revenue: 2240 },
                    { name: "Beef Burger", quantity: 98, revenue: 2940 },
                    { name: "Fish & Chips", quantity: 87, revenue: 2610 }
                ],
                paymentMethods: [
                    { method: "Cash", count: 234, percentage: 42.3 },
                    { method: "Card", count: 268, percentage: 48.5 },
                    { method: "Mobile", count: 50, percentage: 9.2 }
                ],
                summary: {
                    totalRevenue: 15100,
                    totalOrders: 526,
                    averageOrderValue: 28.71,
                    customerCount: 412,
                    revenueChange: 12.5,
                    ordersChange: 8.3
                }
            };
            
            setReportData(mockData);
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
            if (data.length === 0) return;
            const colWidths = Object.keys(data[0]).map(key => ({
                wch: Math.max(
                    key.length,
                    ...data.map(item => (item[key] !== null && item[key] !== undefined) ? item[key].toString().length : 0)
                ) + 2
            }));
            ws["!cols"] = colWidths;
        };

        // 1. Comprehensive Order & Customer Details (MOVED TO FIRST SHEET)
        const orderDetailsData: any[] = [];
        productSalesData.forEach(p => {
            p.recentOrders.forEach(o => {
                orderDetailsData.push({
                    "Order ID": o.orderId,
                    "Order Date": o.date,
                    "Customer Name": o.customer,
                    "Phone Number": o.phone || "N/A",
                    "Delivery Address": o.address || "Dine-in / Pickup",
                    "Product Name": p.name,
                    "Category": p.category,
                    "Quantity Ordered": o.qty,
                    "Unit Price (৳)": p.price,
                    "Total Amount (৳)": o.qty * p.price,
                    "Order Status": o.status.toUpperCase()
                });
            });
        });
        
        // Sort chronologically (descending)
        orderDetailsData.sort((a, b) => b["Order ID"].localeCompare(a["Order ID"]));
        const wsOrderDetails = XLSX.utils.json_to_sheet(orderDetailsData);
        autoSize(orderDetailsData, wsOrderDetails);
        XLSX.utils.book_append_sheet(wb, wsOrderDetails, "Customer Orders Details");

        // 2. Overview Summary
        if (reportData) {
            const summaryData = [
                { Metric: "Total Revenue", Value: `৳${reportData.summary.totalRevenue}` },
                { Metric: "Total Orders", Value: reportData.summary.totalOrders },
                { Metric: "Average Order Value", Value: `৳${reportData.summary.averageOrderValue}` },
                { Metric: "Customer Count", Value: reportData.summary.customerCount }
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryData);
            autoSize(summaryData, wsSummary);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

            const wsDaily = XLSX.utils.json_to_sheet(reportData.dailySales);
            autoSize(reportData.dailySales, wsDaily);
            XLSX.utils.book_append_sheet(wb, wsDaily, "Daily Sales");
        }

        // 3. Weekly Audits
        const weeklyData = weeklyCalculations.map(w => ({
            Week: w.weekName,
            Period: w.period,
            Revenue: w.revenue,
            Orders: w.orders,
            "Avg Ticket (AOV)": w.aov,
            "Top Category": w.topCategory,
            "Top Product": w.topProduct
        }));
        const wsWeekly = XLSX.utils.json_to_sheet(weeklyData);
        autoSize(weeklyData, wsWeekly);
        XLSX.utils.book_append_sheet(wb, wsWeekly, "Weekly Sales");

        // 4. Monthly Audits (Pocket & Profit)
        const monthlyData = monthlyCalculations.map(m => ({
            Month: m.monthName,
            "Total Pocket (Gross Revenue)": m.revenue,
            "Total Orders": m.orders,
            "Avg Order": m.aov,
            "BOM Material Cost": m.rawMaterialCost,
            "Total Profit (Net Profit)": m.netProfit,
            "Profit Margin (%)": m.profitMargin
        }));
        const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
        autoSize(monthlyData, wsMonthly);
        XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Pocket & Profit");

        // 5. Products
        const productsData = productSalesData.map(p => ({
            Name: p.name,
            Category: p.category,
            "Units Sold": p.qtySold,
            "Unit Price": p.price,
            "Total Revenue": p.revenue
        }));
        const wsProducts = XLSX.utils.json_to_sheet(productsData);
        autoSize(productsData, wsProducts);
        XLSX.utils.book_append_sheet(wb, wsProducts, "Product Sales Count");

        const dateStr = date?.from ? (date.to ? `${format(date.from, "LLL_dd_y")}__${format(date.to, "LLL_dd_y")}` : format(date.from, "LLL_dd_y")) : "All_Time";
        XLSX.writeFile(wb, `Restaurant_Reports_${dateStr}.xlsx`);
    };

    const getSortedProducts = () => {
        const filtered = productSalesData.filter(p => 
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
                            onClick={() => setReportType("sales")}
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
                            onClick={() => setReportType("daily")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "daily"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.daily", "Daily")}
                        </button>
                        <button
                            onClick={() => setReportType("weekly")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "weekly"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.weekly", "Weekly")}
                        </button>
                        <button
                            onClick={() => setReportType("monthly")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "monthly"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {t("reports.monthly", "Monthly")}
                        </button>
                        <button
                            onClick={() => setReportType("products")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-[8px] text-xs font-bold transition-all ${
                                reportType === "products"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
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
                    
                    <div className="flex gap-2 w-full md:w-auto justify-end print:hidden">
                        <div className="flex items-center bg-white border border-neutral-200 rounded-[8px] p-0.5 shadow-sm">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-[130px] justify-start text-left font-semibold px-3 py-1.5 text-sm focus:outline-none flex items-center gap-2 transition-colors hover:bg-neutral-50 rounded-[6px]",
                                            !date?.from && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {date?.from ? format(date.from, "LLL dd, y") : <span>Start</span>}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[12px] border-neutral-200 shadow-xl" align="start">
                                    <CalendarWidget
                                        initialFocus
                                        mode="single"
                                        defaultMonth={date?.from}
                                        selected={date?.from}
                                        onSelect={(newDate) => setDate(prev => ({ from: newDate, to: prev?.to }))}
                                    />
                                </PopoverContent>
                            </Popover>
                            
                            <span className="text-neutral-300 font-bold px-1">-</span>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-[130px] justify-start text-left font-semibold px-3 py-1.5 text-sm focus:outline-none flex items-center gap-2 transition-colors hover:bg-neutral-50 rounded-[6px]",
                                            !date?.to && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {date?.to ? format(date.to, "LLL dd, y") : <span>End</span>}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-[12px] border-neutral-200 shadow-xl" align="end">
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
                        <button onClick={handleExportExcel} title="Export to Excel" className="p-2.5 bg-white border border-emerald-200 text-emerald-600 rounded-[8px] hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm font-semibold">
                            <Download className="w-4 h-4" /> <span className="hidden md:inline text-xs">Excel</span>
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
                    <MetricCard
                        title={t("reports.total_orders", "Total Orders")}
                        value={reportData.summary.totalOrders.toLocaleString()}
                        change={reportData.summary.ordersChange}
                        isPositive={reportData.summary.ordersChange > 0}
                        icon={<ShoppingCart className="w-4 h-4 text-blue-400" />}
                    />
                    <MetricCard
                        title={t("reports.avg_order_value", "Avg Order Value")}
                        value={`৳${reportData.summary.averageOrderValue.toFixed(2)}`}
                        change={0}
                        isPositive={true}
                        icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
                    />
                    <MetricCard
                        title={t("reports.customers", "Customers")}
                        value={reportData.summary.customerCount.toLocaleString()}
                        change={0}
                        isPositive={true}
                        icon={<Users className="w-4 h-4 text-purple-400" />}
                    />
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
                                    <LineChart data={reportData.dailySales}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#737373"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#737373"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                                            itemStyle={{ color: '#171717' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#eab308"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#fef08a' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Sales Pie Chart */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-neutral-900">{t("reports.sales_by_category", "Sales by Category")}</h2>
                                <PieChart className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={reportData.categorySales}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ percentage }) => `${percentage.toFixed(1)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="sales"
                                        >
                                            {reportData.categorySales.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content 2: Sales */}
                {reportType === "sales" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by Category Table */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-neutral-900 mb-6">{t("reports.sales_by_category", "Sales by Category")}</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] tracking-wider">
                                            <th className="text-left py-3 font-semibold">{t("reports.category", "Category")}</th>
                                            <th className="text-right py-3 font-semibold">{t("reports.revenue", "Revenue")}</th>
                                            <th className="text-right py-3 font-semibold">{t("reports.percentage", "Percentage")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.categorySales.map((category) => (
                                            <tr key={category.category} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                                <td className="py-3.5 text-neutral-800 font-semibold">{category.category}</td>
                                                <td className="text-right py-3.5 text-neutral-900 font-bold">৳{category.sales.toLocaleString()}</td>
                                                <td className="text-right py-3.5">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                                        {category.percentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-neutral-900 mb-6">{t("reports.payment_methods", "Payment Methods")}</h2>
                            <div className="space-y-4">
                                {reportData.paymentMethods.map((method) => (
                                    <div key={method.method} className="flex items-center justify-between p-3 border border-neutral-100 rounded-[12px] hover:border-neutral-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-50 rounded-[8px] flex items-center justify-center shadow-inner">
                                                <DollarSign className="w-5 h-5 text-neutral-500" />
                                            </div>
                                            <div>
                                                <p className="text-neutral-900 font-bold">{method.method}</p>
                                                <p className="text-xs text-neutral-400">{method.count} transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-neutral-900 font-black">{method.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content 3: Items */}
                {reportType === "items" && (
                    <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-neutral-900 mb-6">{t("reports.top_selling_items", "Top Selling Items")}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] tracking-wider">
                                        <th className="text-left py-3 font-semibold">{t("reports.item_name", "Item Name")}</th>
                                        <th className="text-right py-3 font-semibold">{t("reports.quantity_sold", "Quantity Sold")}</th>
                                        <th className="text-right py-3 font-semibold">{t("reports.revenue", "Revenue")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.topItems.map((item, index) => (
                                        <tr key={item.name} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                            <td className="py-3.5 text-neutral-800 font-semibold">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        index === 0 ? "bg-amber-100 text-amber-700" :
                                                        index === 1 ? "bg-slate-100 text-slate-700" :
                                                        index === 2 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-600"
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="text-right py-3.5 text-neutral-600 font-bold">{item.quantity}</td>
                                            <td className="text-right py-3.5 text-neutral-900 font-black">৳{item.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab content: Daily calculations */}
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

                {/* Tab content: Weekly calculations */}
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

                {/* Tab content: Monthly calculations */}
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
                    const onlineOrdersList = productSalesData
                        .flatMap(p => p.recentOrders.map(o => ({ ...o, product: p.name, price: p.price })))
                        .filter(o => o.address && o.address.toLowerCase() !== "takeaway" && o.address.toLowerCase() !== "dine-in" && o.address.toLowerCase() !== "dine-in / pickup");
                    
                    const totalOnlineRevenue = onlineOrdersList.reduce((sum, order) => sum + (order.qty * order.price), 0);
                    const totalOnlineProfit = totalOnlineRevenue * 0.65; // Estimated 65% profit margin
                    const totalOnlineOrdersCount = onlineOrdersList.length;

                    return (
                        <div className="space-y-6">
                            {/* Summary Cards for Online Orders */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Online Orders</h3>
                                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-3xl font-black text-neutral-900">{totalOnlineOrdersCount}</div>
                                </div>
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Pocket (Revenue)</h3>
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-3xl font-black text-emerald-600">৳{totalOnlineRevenue.toLocaleString()}</div>
                                </div>
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Profit (Est. 65%)</h3>
                                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="text-3xl font-black text-indigo-600">৳{totalOnlineProfit.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-neutral-900">{t("reports.online_orders", "Online / E-Commerce Orders")}</h2>
                                        <p className="text-xs text-neutral-400 mt-0.5">Showing orders placed through the website or third-party online platforms.</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-violet-50 text-violet-600 border border-violet-200 uppercase">Online Audit</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                                <th className="px-6 py-3 font-semibold">Date</th>
                                                <th className="px-6 py-3 font-semibold">Customer</th>
                                                <th className="px-6 py-3 font-semibold">Delivery Address</th>
                                                <th className="px-6 py-3 font-semibold">Product</th>
                                                <th className="px-6 py-3 font-semibold text-right">Qty</th>
                                                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                                                <th className="px-6 py-3 font-semibold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {onlineOrdersList
                                                .sort((a, b) => b.orderId.localeCompare(a.orderId))
                                                .map((order, idx) => (
                                                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-neutral-900">{order.orderId}</td>
                                                        <td className="px-6 py-4 text-xs text-neutral-500">{order.date}</td>
                                                        <td className="px-6 py-4 font-medium text-neutral-800">
                                                            <div>{order.customer}</div>
                                                            <div className="text-[10px] text-neutral-400">{order.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-neutral-600 max-w-[150px] truncate" title={order.address}>{order.address}</td>
                                                        <td className="px-6 py-4 font-medium text-neutral-700">{order.product}</td>
                                                        <td className="px-6 py-4 text-right font-semibold text-neutral-700">{order.qty}</td>
                                                        <td className="px-6 py-4 text-right font-black text-emerald-600">৳{(order.qty * order.price).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider">
                                                                {order.status}
                                                            </span>
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
                    <div className="bg-white border border-neutral-200/60 rounded-[16px] p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900">{t("reports.product_sales_count", "Product Sales Count")}</h2>
                                <p className="text-xs text-neutral-400 mt-0.5">Tracking unit sales of each product with raw materials BOM status.</p>
                            </div>
                            
                            {/* Search bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search products or categories..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full bg-white border border-neutral-200 rounded-[8px] pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                                    <tr>
                                        <th className="px-6 py-3 cursor-pointer select-none" onClick={() => handleSortProduct("name")}>
                                            <div className="flex items-center gap-1">Product Name <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right cursor-pointer select-none" onClick={() => handleSortProduct("qty")}>
                                            <div className="flex items-center justify-end gap-1">Units Sold <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-3 text-right">Unit Price</th>
                                        <th className="px-6 py-3 text-right cursor-pointer select-none" onClick={() => handleSortProduct("revenue")}>
                                            <div className="flex items-center justify-end gap-1">Total Revenue <ArrowUpDown className="w-3 h-3" /></div>
                                        </th>
                                        <th className="px-6 py-3 text-center">BOM Ingredients</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {getSortedProducts().map((product) => {
                                        const missingIngredients = product.ingredients.filter(i => !i.inStock).length;
                                        return (
                                            <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-900">{product.name}</td>
                                                <td className="px-6 py-4 text-xs text-neutral-500">{product.category}</td>
                                                <td className="px-6 py-4 text-right font-bold text-neutral-900">{product.qtySold} units</td>
                                                <td className="px-6 py-4 text-right font-medium text-neutral-500">৳{product.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600">৳{product.revenue.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {missingIngredients > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                            {missingIngredients} Ingredient Low
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                            All Ingredients OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-primary hover:text-white rounded-[8px] text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getSortedProducts().length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-neutral-400">
                                                No products found matching your search.
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
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">Product Analysis: {selectedProduct.name}</h3>
                                <p className="text-xs text-neutral-400">{selectedProduct.category} | Unit Price: ৳{selectedProduct.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            {/* Product metrics */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Units Sold</p>
                                    <p className="text-xl font-black text-indigo-700 mt-1">{selectedProduct.qtySold} Units</p>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Revenue Generated</p>
                                    <p className="text-xl font-black text-emerald-600 mt-1">৳{selectedProduct.revenue.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-[16px]">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Market Contribution</p>
                                    <p className="text-xl font-black text-amber-600 mt-1">
                                        {((selectedProduct.revenue / 15100) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Daily Sales volume (Units)</h4>
                                <div className="h-[180px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={selectedProduct.salesTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                            <XAxis dataKey="day" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="qty" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recipes and stock matching */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bill of Materials (BOM) Linked items */}
                                <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Linked BOM Raw Ingredients</h4>
                                    <div className="space-y-2">
                                        {selectedProduct.ingredients.map((ingredient) => (
                                            <div key={ingredient.name} className="flex items-center justify-between text-xs p-2 border border-neutral-100 rounded-[8px]">
                                                <div>
                                                    <p className="font-bold text-neutral-800">{ingredient.name}</p>
                                                    <p className="text-[10px] text-neutral-400">Qty required per order: {ingredient.quantity}</p>
                                                </div>
                                                <span>
                                                    {ingredient.inStock ? (
                                                        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 text-[10px]">
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-600 font-bold border border-rose-100 text-[10px]">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent orders purchasing this item */}
                                <div className="bg-white border border-neutral-200 rounded-[16px] p-4">
                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Recent Orders Log</h4>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                        {selectedProduct.recentOrders.map((ord) => (
                                            <div key={ord.orderId} className="flex items-center justify-between text-xs p-2 border border-neutral-100 rounded-[8px] hover:bg-neutral-50">
                                                <div>
                                                    <p className="font-bold text-neutral-800">{ord.orderId}</p>
                                                    <p className="text-[10px] text-neutral-400">{ord.date} by {ord.customer}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-neutral-800">{ord.qty} units</p>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                                        {ord.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                            <button onClick={() => setSelectedProduct(null)} className="px-5 py-2 bg-neutral-900 text-white rounded-[10px] text-xs font-bold hover:bg-neutral-800">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
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
    icon 
}: { 
    title: string; 
    value: string; 
    change: number; 
    isPositive: boolean; 
    icon: React.ReactNode;
}) => (
    <div className="bg-white border border-neutral-200 rounded-[12px] p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{title}</h3>
            <div className="p-2 bg-neutral-50 rounded-[8px] border shadow-inner">
                {icon}
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">{value}</span>
            {change !== 0 && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${
                    isPositive ? 'text-primary' : 'text-rose-600'
                }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
    </div>
);

export default AdminReports;
