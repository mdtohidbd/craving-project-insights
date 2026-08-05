import React, { useState, useEffect } from "react";
import {
    Package, TrendingUp, Clock, AlertCircle, Phone, ArrowUpRight, ArrowDownRight,
    DollarSign, ShoppingCart, Users, Calendar, Download, BarChart3, PieChart as PieChartIcon,
    CreditCard, Smartphone, Banknote, Activity, ChevronLeft, ChevronRight
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
    metrics: {
        totalSales: number;
        todaySales: number;
        monthlySales: number;
        totalOrders: number;
        activeOrders: number;
        lowStockItems: number;
    };
    salesData: { name: string; date: string; sales: number }[];
    inventoryData: { id: string; name: string; category: string; stock: number; status: string }[];
    smsNotifications: { id: string; from: string; message: string; time: string; unread: boolean }[];
    staffData: {
        activeStaffCount: number;
        activeDeliveryManCount: number;
        staffRoleBreakdown: { role: string; count: number }[];
        deliveryManPerformance: { id: string; name: string; phone: string; completedOrders: number }[];
    };
    categorySales: { category: string; sales: number; percentage: number }[];
    topItems: { name: string; quantity: number; revenue: number }[];
    paymentMethods: { method: string; count: number; percentage: number }[];
    recentOrders: {
        id: string;
        orderId: string;
        customerName: string;
        items: { name: string; quantity: number }[];
        total: number;
        status: string;
        time: string;
    }[];
}

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<DashboardData | null>(() => {
        try {
            const cached = localStorage.getItem('cached_admin_dashboard_data');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(!data);
    const [reportType, setReportType] = useState("overview");
    const [chartView, setChartView] = useState<'trend' | 'daily'>('trend');

    // Pagination States
    const [recentOrdersPage, setRecentOrdersPage] = useState(1);
    const recentOrdersPerPage = 4;

    const [inventoryPage, setInventoryPage] = useState(1);
    const inventoryPerPage = 4;

    const [smsPage, setSmsPage] = useState(1);
    const smsPerPage = 3;

    const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const normalizeSmsCurrency = (message: string) => {
        return message.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (_, amount: string) => {
            const parsed = Number(amount);
            if (Number.isNaN(parsed)) return `৳${amount}`;
            return `৳${parsed.toFixed(2)}`;
        });
    };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/dashboard`);
                if (res.ok) {
                    const dashboardData = await res.json();
                    setData(dashboardData);
                    try {
                        localStorage.setItem('cached_admin_dashboard_data', JSON.stringify(dashboardData));
                    } catch {}
                }
            } catch (error) {
                console.error("Fetch dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Fallback default data for instant initial render if cache is empty
    const safeData: DashboardData = data || {
        metrics: { totalSales: 0, todaySales: 0, monthlySales: 0, totalOrders: 0, activeOrders: 0, lowStockItems: 0 },
        salesData: [],
        inventoryData: [],
        smsNotifications: [],
        staffData: { activeStaffCount: 0, activeDeliveryManCount: 0, staffRoleBreakdown: [], deliveryManPerformance: [] },
        categorySales: [],
        topItems: [],
        paymentMethods: [],
        recentOrders: []
    };

    // Paginated datasets
    const paginatedOrders = safeData.recentOrders?.slice(
        (recentOrdersPage - 1) * recentOrdersPerPage,
        recentOrdersPage * recentOrdersPerPage
    ) || [];
    const totalOrdersPages = Math.ceil((safeData.recentOrders?.length || 0) / recentOrdersPerPage) || 1;

    const paginatedInventory = safeData.inventoryData?.slice(
        (inventoryPage - 1) * inventoryPerPage,
        inventoryPage * inventoryPerPage
    ) || [];
    const totalInventoryPages = Math.ceil((safeData.inventoryData?.length || 0) / inventoryPerPage) || 1;

    const paginatedSms = safeData.smsNotifications?.slice(
        (smsPage - 1) * smsPerPage,
        smsPage * smsPerPage
    ) || [];
    const totalSmsPages = Math.ceil((safeData.smsNotifications?.length || 0) / smsPerPage) || 1;

    return (
        <AdminLayout title={t("dashboard.overview", "Overview")}>
            <div className="space-y-8 pb-10">
                {/* Pills Navigation - Premium Mushy Design */}
                <div className="flex gap-2.5 p-1.5 bg-neutral-100/50 rounded-[12px] w-fit">
                    <button
                        onClick={() => setReportType("overview")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${reportType === "overview"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        {t("dashboard.overview", "OVERVIEW")}
                    </button>
                    <button
                        onClick={() => setReportType("sales")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${reportType === "sales"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        {t("dashboard.sales_report", "SALES REPORT")}
                    </button>
                    <button
                        onClick={() => setReportType("items")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${reportType === "items"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        {t("dashboard.item_analysis", "ITEM ANALYSIS")}
                    </button>
                    <button
                        onClick={() => setReportType("staff")}
                        className={`px-6 py-2.5 rounded-[8px] text-xs font-black transition-all duration-300 active:scale-95 ${reportType === "staff"
                                ? "bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40"
                            }`}
                    >
                        {t("dashboard.staff_analysis", "STAFF ANALYSIS")}
                    </button>
                </div>

                {reportType === "overview" && (
                    <>
                        {/* Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            <MetricCard
                                title={t("dashboard.todays_sales", "Today's Sales")}
                                value={`৳${Math.round(safeData.metrics?.todaySales || 0)}`}
                                trend=""
                                isPositive={true}
                                icon={<TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400" />}
                            />
                            <MetricCard
                                title={t("dashboard.this_month", "This Month")}
                                value={`৳${Math.round(safeData.metrics?.monthlySales || 0)}`}
                                trend=""
                                isPositive={true}
                                icon={<TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400" />}
                            />
                            <MetricCard
                                title={t("dashboard.total_orders", "Total Orders")}
                                value={(safeData.metrics?.totalOrders || 0).toString()}
                                trend=""
                                isPositive={true}
                                icon={<Package className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-400" />}
                            />
                            <MetricCard
                                title={t("dashboard.active_orders", "Active Orders")}
                                value={(safeData.metrics?.activeOrders || 0).toString()}
                                trend=""
                                isPositive={true}
                                icon={<Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sales Chart & Inventory */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Chart Section */}
                                <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-neutral-100 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-shadow duration-500 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#F4F5F7] rounded-bl-[120px] -z-10 transition-transform duration-500 group-hover:scale-105" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-serif text-neutral-900 tracking-tight">
                                                {chartView === 'trend' ? t("dashboard.daily_sales_trend", "Daily Sales Trend") : chartView === 'daily' ? t("dashboard.daily_sales", "Daily Sales") : "Combined Sales Analytics"}
                                            </h2>
                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                                {t("dashboard.revenue_overview", "Revenue overview for the last 7 days")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-neutral-100/80 p-1.5 rounded-[16px] self-start sm:self-auto">
                                            <button 
                                                onClick={() => setChartView('trend')}
                                                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all duration-300 ${chartView === 'trend' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                            >
                                                Trend
                                            </button>
                                            <button 
                                                onClick={() => setChartView('daily')}
                                                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all duration-300 ${chartView === 'daily' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                            >
                                                Daily
                                            </button>
                                            <button 
                                                onClick={() => setChartView('combined' as any)}
                                                className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all duration-300 ${chartView === ('combined' as any) ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                            >
                                                Combined
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats bar */}
                                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-[20px] bg-neutral-50/80 border border-neutral-100">
                                        <div>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">7-Day Total</span>
                                            <span className="text-base font-black text-neutral-900">৳{safeData.salesData.reduce((acc, curr) => acc + curr.sales, 0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Daily Avg</span>
                                            <span className="text-base font-black text-neutral-900">৳{Math.round(safeData.salesData.reduce((acc, curr) => acc + curr.sales, 0) / (safeData.salesData.length || 1))}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Peak Day</span>
                                            <span className="text-base font-black text-emerald-600">
                                                {safeData.salesData.length > 0 
                                                    ? safeData.salesData.reduce((max, curr) => curr.sales > max.sales ? curr : max, safeData.salesData[0]).name 
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartView === 'trend' ? (
                                                <AreaChart data={safeData.salesData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#F5B925" stopOpacity={0.45}/>
                                                            <stop offset="95%" stopColor="#F5B925" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => `৳${value}`}
                                                        dx={-5}
                                                    />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                                        itemStyle={{ color: '#171717', fontWeight: 700 }}
                                                        labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                                                        formatter={(val: any) => [`৳${val}`, 'Sales']}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="sales" 
                                                        stroke="#F5B925" 
                                                        strokeWidth={4}
                                                        fillOpacity={1} 
                                                        fill="url(#colorSales)" 
                                                    />
                                                </AreaChart>
                                            ) : chartView === 'daily' ? (
                                                <LineChart data={safeData.salesData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => `৳${value}`}
                                                        dx={-5}
                                                    />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                                        itemStyle={{ color: '#171717', fontWeight: 700 }}
                                                        labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                                                        formatter={(value: any) => [`৳${value}`, 'Sales']}
                                                    />
                                                    <Line
                                                        type="linear"
                                                        dataKey="sales"
                                                        stroke="#F5B925"
                                                        strokeWidth={3}
                                                        dot={{ r: 5, fill: '#F5B925', strokeWidth: 0 }}
                                                        activeDot={{ r: 8, fill: '#fff', stroke: '#F5B925', strokeWidth: 3 }}
                                                    />
                                                </LineChart>
                                            ) : (
                                                <AreaChart data={safeData.salesData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                                                    <defs>
                                                        <linearGradient id="colorSalesComb" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#F5B925" stopOpacity={0.35}/>
                                                            <stop offset="95%" stopColor="#F5B925" stopOpacity={0.02}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        stroke="#9ca3af"
                                                        fontSize={12}
                                                        fontWeight={600}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => `৳${value}`}
                                                        dx={-5}
                                                    />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                                        itemStyle={{ color: '#171717', fontWeight: 700 }}
                                                        labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}
                                                        formatter={(value: any) => [`৳${value}`, 'Sales']}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="sales" 
                                                        stroke="#F5B925" 
                                                        strokeWidth={4}
                                                        fillOpacity={1} 
                                                        fill="url(#colorSalesComb)" 
                                                        dot={{ r: 4, fill: '#F5B925', strokeWidth: 0 }}
                                                        activeDot={{ r: 8, fill: '#fff', stroke: '#F5B925', strokeWidth: 3 }}
                                                    />
                                                </AreaChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-black text-neutral-900 tracking-tight">{t("dashboard.recent_orders", "Recent Orders")}</h2>
                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Live order feed and products</p>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-neutral-100">
                                        {isLoading && !data ? (
                                            Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="p-6 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-48" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </div>
                                            ))
                                        ) : paginatedOrders.length > 0 ? (
                                            paginatedOrders.map((order) => (
                                                <div key={order.id} className="p-6 hover:bg-neutral-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                                                            <ShoppingCart className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-neutral-900">#{order.orderId}</p>
                                                                <span className="text-sm text-neutral-500">•</span>
                                                                <p className="text-sm font-medium text-neutral-700">{order.customerName}</p>
                                                            </div>
                                                            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1">
                                                        <div className="flex items-center gap-1.5 text-neutral-400">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-semibold">{order.time}</span>
                                                        </div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                            order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                            order.status === 'preparing' || order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-neutral-500 font-medium">No recent orders.</div>
                                        )}
                                    </div>
                                    {/* Pagination Footer */}
                                    {totalOrdersPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
                                            <span className="text-xs font-semibold text-neutral-400">
                                                Page {recentOrdersPage} of {totalOrdersPages}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setRecentOrdersPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={recentOrdersPage === 1}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setRecentOrdersPage(prev => Math.min(prev + 1, totalOrdersPages))}
                                                    disabled={recentOrdersPage >= totalOrdersPages}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Inventory Table */}
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-black text-neutral-900 tracking-tight">{t("inventory.inventory_preview", "Inventory Preview")}</h2>
                                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{t("inventory.manage_stock_levels", "Manage your product stock levels")}</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-neutral-500 bg-neutral-50 uppercase border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">{t("inventory.item_name", "Item Name")}</th>
                                                    <th className="px-6 py-4 font-medium">{t("inventory.category", "Category")}</th>
                                                    <th className="px-6 py-4 font-medium">{t("inventory.stock", "Stock")}</th>
                                                    <th className="px-6 py-4 font-medium">{t("inventory.status", "Status")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoading && !data ? (
                                                    Array.from({ length: 4 }).map((_, i) => (
                                                        <tr key={i} className="border-b border-neutral-100">
                                                            <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                                            <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                                                            <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                        </tr>
                                                    ))
                                                ) : paginatedInventory.length > 0 ? (
                                                    paginatedInventory.map((item) => (
                                                        <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-neutral-900">{item.name}</td>
                                                            <td className="px-6 py-4 text-neutral-600">{item.category}</td>
                                                            <td className="px-6 py-4 font-medium">{item.stock}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'In Stock'
                                                                    ? 'bg-emerald-100 text-primary border border-primary/30'
                                                                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                                    }`}>
                                                                    {item.status === 'In Stock' ? t("inventory.in_stock", "In Stock") : (item.status === 'Low Stock' ? t("inventory.low_stock", "Low Stock") : t("inventory.out_of_stock", "Out of Stock"))}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-neutral-500">{t("inventory.no_items_found", "No items found")}</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination Footer */}
                                    {totalInventoryPages > 1 && (
                                        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
                                            <span className="text-xs font-semibold text-neutral-400">
                                                Page {inventoryPage} of {totalInventoryPages}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setInventoryPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={inventoryPage === 1}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setInventoryPage(prev => Math.min(prev + 1, totalInventoryPages))}
                                                    disabled={inventoryPage >= totalInventoryPages}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SMS Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white border border-neutral-200/60 rounded-[16px] p-8 shadow-sm hover:shadow-md transition-shadow duration-500 flex flex-col h-full min-h-[500px]">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-rose-50 rounded-[12px] flex items-center justify-center shadow-inner">
                                                <Phone className="w-6 h-6 text-rose-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-neutral-900 tracking-tight">{t("dashboard.sms_logs", "SMS Logs")}</h2>
                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">{t("dashboard.real_time_alerts", "Real-time alerts")}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {isLoading && !data ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="p-4 rounded-[8px] border border-neutral-200 bg-neutral-50 space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-full" />
                                                </div>
                                            ))
                                        ) : paginatedSms.length > 0 ? (
                                            paginatedSms.map((sms) => (
                                                <div
                                                    key={sms.id}
                                                    className={`p-4 rounded-[8px] border transition-all ${sms.unread
                                                        ? 'bg-primary/5 border-primary/30'
                                                        : 'bg-neutral-50 border-neutral-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-semibold text-neutral-900">{sms.from}</span>
                                                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {sms.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                                        {normalizeSmsCurrency(sms.message)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-neutral-500 text-sm text-center pt-8">{t("dashboard.no_sms_logs", "No Recent SMS logs.")}</p>
                                        )}
                                    </div>
                                    {/* Pagination Footer */}
                                    {totalSmsPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
                                            <span className="text-xs font-semibold text-neutral-400">
                                                Page {smsPage} of {totalSmsPages}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setSmsPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={smsPage === 1}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setSmsPage(prev => Math.min(prev + 1, totalSmsPages))}
                                                    disabled={smsPage >= totalSmsPages}
                                                    className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {reportType === "sales" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        {/* Sales Distribution */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-neutral-100">
                            {/* Subtle top-right curved accent matching the image */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F4F5F7] rounded-bl-[120px] -z-10 transition-transform duration-500 group-hover:scale-105" />
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h2 className="text-xl font-medium text-neutral-900 tracking-tight">{t("dashboard.sales_distribution", "Sales Distribution")}</h2>
                                    <p className="text-sm text-neutral-500 mt-1.5 font-medium">{t("dashboard.revenue_share", "Revenue share by category")}</p>
                                </div>
                                <div className="p-3 bg-neutral-200/50 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-colors cursor-pointer">
                                    <PieChartIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="h-[360px] relative mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={safeData.categorySales}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={95}
                                            outerRadius={135}
                                            paddingAngle={8}
                                            dataKey="sales"
                                            stroke="none"
                                            cornerRadius={20}
                                        >
                                            {safeData.categorySales?.map((entry, index) => {
                                                const flatColors = ['#F5B925', '#4285F4', '#34A853', '#F99318', '#EA4335'];
                                                return <Cell key={`cell-${index}`} fill={flatColors[index % flatColors.length]} />
                                            })}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                                            itemStyle={{ fontWeight: 600 }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center mt-2">
                                        <p className="text-[15px] text-neutral-500 font-semibold mb-1 tracking-wide">Total Revenue</p>
                                        <p className="text-[32px] font-black text-neutral-800 tracking-tight">৳{safeData.metrics?.totalSales?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-6">
                                {safeData.categorySales?.map((entry, index) => {
                                    const flatColors = ['#F5B925', '#4285F4', '#34A853', '#F99318', '#EA4335'];
                                    return (
                                    <div key={index} className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: flatColors[index % flatColors.length] }} />
                                        <span className="text-[13px] font-bold text-neutral-600">{entry.category}</span>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group border border-neutral-100 flex flex-col">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#F4F5F7] rounded-tl-[120px] -z-10 transition-transform duration-500 group-hover:scale-105" />
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-medium text-neutral-900 tracking-tight">{t("dashboard.payment_methods", "Payment Methods")}</h2>
                                    <p className="text-sm text-neutral-500 mt-1.5 font-medium">Transaction distribution</p>
                                </div>
                                <div className="p-3 bg-neutral-200/50 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-colors cursor-pointer">
                                    <Activity className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                                {safeData.paymentMethods?.map((method, i) => {
                                    const isCash = method.method.toLowerCase().includes('cash');
                                    const isCard = method.method.toLowerCase().includes('card');
                                    const colorCls = isCash ? 'text-neutral-700 bg-neutral-100' : isCard ? 'text-neutral-700 bg-neutral-100' : 'text-neutral-700 bg-neutral-100';
                                    
                                    return (
                                    <div key={method.method} className="group/item relative overflow-hidden bg-[#F8F9FB] p-5 rounded-[20px] hover:bg-neutral-100 transition-colors cursor-default border border-transparent">
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-105 ${colorCls}`}>
                                                    {isCash ? <DollarSign className="w-6 h-6" /> : isCard ? <CreditCard className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="text-neutral-900 font-bold text-[17px]">{method.method}</p>
                                                    <p className="text-[13px] text-neutral-500 font-semibold mt-0.5">{method.count} {t("dashboard.transactions", "transactions")}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-neutral-900">{method.percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* Sales by Category Table */}
                        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-neutral-100 mt-2">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-medium text-neutral-900 tracking-tight">{t("dashboard.category_breakdown", "Category Breakdown")}</h2>
                                    <p className="text-sm text-neutral-500 mt-1.5 font-medium">Detailed performance by menu segment</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-100">
                                            <th className="text-left py-4 text-neutral-400 font-bold tracking-wider uppercase text-xs">{t("dashboard.category", "Category")}</th>
                                            <th className="text-center py-4 text-neutral-400 font-bold tracking-wider uppercase text-xs">{t("dashboard.revenue", "Revenue")}</th>
                                            <th className="text-right py-4 text-neutral-400 font-bold tracking-wider uppercase text-xs">{t("dashboard.market_share", "Market Share")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {safeData.categorySales?.sort((a,b)=>b.sales-a.sales).map((category, index) => {
                                            return (
                                            <tr key={category.category} className="group hover:bg-[#F8F9FB] transition-colors rounded-xl">
                                                <td className="py-5 px-2 font-bold text-neutral-800 text-[15px] rounded-l-xl">
                                                    {category.category}
                                                </td>
                                                <td className="text-center py-5 font-semibold text-neutral-600 text-[15px]">৳{category.sales.toLocaleString()}</td>
                                                <td className="text-right py-5 px-2 rounded-r-xl">
                                                    <div className="flex items-center justify-end gap-5">
                                                        <div className="w-32 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{ width: `${category.percentage}%`, backgroundColor: '#334155' }}
                                                            />
                                                        </div>
                                                        <span className="text-neutral-900 font-black min-w-[3.5rem] text-right text-[15px]">
                                                            {category.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {reportType === "items" && (
                    <div className="bg-white border border-neutral-200 rounded-[8px] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-[4px]">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">{t("dashboard.top_performing_items", "Top Performing Items")}</h2>
                                <p className="text-sm text-neutral-500">{t("dashboard.top_items_desc", "Based on sales volume and total revenue")}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.rank", "Rank")}</th>
                                        <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.item_name", "Item Name")}</th>
                                        <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.qty_sold", "Qty Sold")}</th>
                                        <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.total_revenue", "Total Revenue")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {safeData.topItems?.map((item, index) => (
                                        <tr key={item.name} className="hover:bg-neutral-50 transition-colors">
                                            <td className="py-4">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="py-4 text-neutral-900 font-semibold">{item.name}</td>
                                            <td className="text-right py-4 text-neutral-600 font-medium">{item.quantity}</td>
                                            <td className="text-right py-4 text-neutral-900 font-bold">৳{item.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {reportType === "staff" && (
                    <div className="space-y-6">
                        {/* Staff Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                            <MetricCard
                                title={t("dashboard.active_staff", "Active Staff")}
                                value={(safeData.staffData?.activeStaffCount || 0).toString()}
                                trend=""
                                isPositive={true}
                                icon={<Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-500" />}
                            />
                            <MetricCard
                                title={t("dashboard.active_deliverymen", "Active Deliverymen")}
                                value={(safeData.staffData?.activeDeliveryManCount || 0).toString()}
                                trend=""
                                isPositive={true}
                                icon={<Package className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Staff Role Breakdown */}
                            <div className="bg-white border border-neutral-200 rounded-[8px] p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-6">{t("dashboard.staff_distribution", "Staff Distribution")}</h2>
                                <div className="space-y-4">
                                    {safeData.staffData?.staffRoleBreakdown.map((role) => (
                                        <div key={role.role} className="flex items-center justify-between p-3 rounded-[4px] hover:bg-neutral-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-[4px] flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-neutral-900 font-medium capitalize">{role.role}</p>
                                                    <p className="text-sm text-neutral-500">{role.count} {t("dashboard.members", "members")}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-neutral-900 font-semibold">{role.count}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!safeData.staffData?.staffRoleBreakdown || safeData.staffData.staffRoleBreakdown.length === 0) && (
                                        <p className="text-neutral-500 text-sm text-center">{t("dashboard.no_staff_role_data", "No staff role data available.")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Deliveryman Performance */}
                            <div className="bg-white border border-neutral-200 rounded-[8px] p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-lg font-semibold text-neutral-900">{t("dashboard.delivery_performance", "Delivery Performance")}</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-200">
                                                <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.name", "Name")}</th>
                                                <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.phone", "Phone")}</th>
                                                <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">{t("dashboard.completed_orders", "Completed Orders")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {safeData.staffData?.deliveryManPerformance.map((dm) => (
                                                <tr key={dm.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                    <td className="py-4 text-neutral-900 font-medium">{dm.name}</td>
                                                    <td className="py-4 text-neutral-600">{dm.phone}</td>
                                                    <td className="text-right py-4">
                                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                                            {dm.completedOrders} {t("dashboard.orders", "orders")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!safeData.staffData?.deliveryManPerformance || safeData.staffData.deliveryManPerformance.length === 0) && (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-neutral-500">{t("dashboard.no_deliveryman_data", "No deliveryman data available.")}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

// Sub-component for clean, compact metric cards
const MetricCard = ({ title, value, trend, isPositive, icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode }) => (
    <div className="bg-white border border-neutral-100/80 rounded-[20px] p-5 lg:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-200 transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1.5">
                <h3 className="text-[11px] font-serif text-neutral-400 uppercase tracking-widest leading-none">{title}</h3>
                <div className="h-[2px] w-5 bg-neutral-300 rounded-full" />
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#F3F4F6] rounded-[12px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {icon}
            </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 mt-auto">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-neutral-900 group-hover:text-neutral-800 transition-colors">{value}</span>
            {trend && (
                <span className={`text-[10px] lg:text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-primary' : 'text-rose-500'}`}>
                    <div className={`p-0.5 rounded-[4px] ${isPositive ? 'bg-primary/10' : 'bg-rose-50'}`}>
                        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    </div>
                    {trend}
                </span>
            )}
        </div>
    </div>
);

export default AdminDashboard;
