import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package, TrendingUp, Clock, AlertCircle, Phone, ArrowUpRight,
    DollarSign, ShoppingCart, Users, Calendar, Download, BarChart3, PieChart as PieChartIcon,
    CreditCard, Smartphone, Activity, ChevronLeft, ChevronRight, Truck, AlertTriangle,
    Zap, ExternalLink, ArrowRight, RefreshCw, FileText, CheckCircle2, ShieldCheck
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, AreaChart, Area
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
        pendingDeliveries?: number;
        pendingReservations?: number;
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
    const navigate = useNavigate();

    const [data, setData] = useState<DashboardData | null>(() => {
        try {
            const cached = localStorage.getItem('cached_admin_dashboard_data');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(!data);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [chartView, setChartView] = useState<'trend' | 'daily' | 'combined'>('trend');

    // Pagination States
    const [recentOrdersPage, setRecentOrdersPage] = useState(1);
    const recentOrdersPerPage = 4;

    const [inventoryPage, setInventoryPage] = useState(1);
    const inventoryPerPage = 3;

    const [smsPage, setSmsPage] = useState(1);
    const smsPerPage = 3;

    const normalizeSmsCurrency = (message: string) => {
        return message.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (_, amount: string) => {
            const parsed = Number(amount);
            if (Number.isNaN(parsed)) return `৳${amount}`;
            return `৳${parsed.toFixed(2)}`;
        });
    };

    const fetchDashboard = async (isManualRefresh = false) => {
        if (isManualRefresh) setIsRefreshing(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/dashboard`);
            if (res.ok) {
                const dashboardData = await res.json();
                setData(dashboardData);
                try {
                    localStorage.setItem('cached_admin_dashboard_data', JSON.stringify(dashboardData));
                } catch {}
                if (isManualRefresh) toast.success("Dashboard data refreshed");
            }
        } catch (error) {
            console.error("Fetch dashboard error:", error);
            if (isManualRefresh) toast.error("Failed to refresh dashboard");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Fallback default data for instant initial render
    const safeData: DashboardData = data || {
        metrics: { 
            totalSales: 0, 
            todaySales: 0, 
            monthlySales: 0, 
            totalOrders: 0, 
            activeOrders: 0, 
            lowStockItems: 0,
            pendingDeliveries: 0,
            pendingReservations: 0
        },
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
            <div className="space-y-4 lg:space-y-5 pb-10">
                {/* ── Top Compact Manager Operational Header & Quick Shortcuts Bar ── */}
                <div className="bg-white rounded-[20px] p-4 lg:px-6 lg:py-4 border border-neutral-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-lg lg:text-xl font-black text-neutral-900 tracking-tight">
                                {t("dashboard.control_hub", "Restaurant Control Hub")}
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {t("dashboard.shift_active", "Shift Active")}
                            </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-medium">
                            {t("dashboard.control_hub_desc", "Real-time operational summary & direct management controls")}
                        </p>
                    </div>

                    {/* Quick Manager Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* POS Button with White Text & White Icon */}
                        <button
                            onClick={() => navigate('/admin/pos')}
                            className="px-3.5 py-2 rounded-[12px] bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold shadow-sm transition-all duration-200 flex items-center gap-1.5 active:scale-95"
                        >
                            <Zap className="w-3.5 h-3.5 text-white fill-white" />
                            <span className="text-white">{t("dashboard.new_pos_order", "New POS Order")}</span>
                        </button>

                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="px-3 py-2 rounded-[12px] bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                        >
                            <ShoppingCart className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{t("dashboard.live_orders", "Live Orders")}</span>
                        </button>

                        <button
                            onClick={() => navigate('/admin/delivery')}
                            className="px-3 py-2 rounded-[12px] bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                        >
                            <Truck className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{t("dashboard.delivery_hub", "Delivery Hub")}</span>
                        </button>

                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="px-3 py-2 rounded-[12px] bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80 text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{t("dashboard.full_reports", "Full Reports")}</span>
                        </button>

                        <button
                            onClick={() => fetchDashboard(true)}
                            disabled={isRefreshing}
                            title="Refresh Data"
                            className="p-2 rounded-[12px] bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── Executive Manager KPI Cards Grid (Compact 5-Col Row) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Card 1: Today's Revenue */}
                    <div 
                        onClick={() => navigate('/admin/reports')}
                        className="bg-white border border-neutral-200/70 rounded-[18px] p-3.5 lg:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    {t("dashboard.todays_sales", "Today's Sales")}
                                </h3>
                                <div className="h-[2px] w-5 bg-emerald-400 rounded-full" />
                            </div>
                            <div className="w-8 h-8 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xl font-black text-neutral-900 tracking-tight block">
                                ৳{Math.round(safeData.metrics?.todaySales || 0).toLocaleString()}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-neutral-400">
                                <span>{t("dashboard.month_total", "Month")}: ৳{Math.round(safeData.metrics?.monthlySales || 0).toLocaleString()}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Active Orders */}
                    <div 
                        onClick={() => navigate('/admin/orders')}
                        className="bg-white border border-neutral-200/70 rounded-[18px] p-3.5 lg:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    {t("dashboard.active_orders", "Active Orders")}
                                </h3>
                                <div className="h-[2px] w-5 bg-amber-400 rounded-full" />
                            </div>
                            <div className="w-8 h-8 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform relative">
                                <Clock className="w-3.5 h-3.5" />
                                {safeData.metrics?.activeOrders > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                )}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xl font-black text-neutral-900 tracking-tight block">
                                {safeData.metrics?.activeOrders || 0}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-amber-600 font-semibold">
                                <span>{t("dashboard.kitchen_prep_queue", "Kitchen / Prep queue")}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Pending Deliveries */}
                    <div 
                        onClick={() => navigate('/admin/delivery')}
                        className="bg-white border border-neutral-200/70 rounded-[18px] p-3.5 lg:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    {t("dashboard.pending_delivery", "Pending Delivery")}
                                </h3>
                                <div className="h-[2px] w-5 bg-blue-400 rounded-full" />
                            </div>
                            <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Truck className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xl font-black text-neutral-900 tracking-tight block">
                                {safeData.metrics?.pendingDeliveries || 0}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-blue-600 font-semibold">
                                <span>{t("dashboard.dispatch_board", "Dispatch board")}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Low Stock Alert */}
                    <div 
                        onClick={() => navigate('/admin/inventory')}
                        className="bg-white border border-neutral-200/70 rounded-[18px] p-3.5 lg:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    {t("dashboard.low_stock_items", "Low Stock Items")}
                                </h3>
                                <div className="h-[2px] w-5 bg-rose-400 rounded-full" />
                            </div>
                            <div className="w-8 h-8 rounded-[10px] bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xl font-black text-neutral-900 tracking-tight block">
                                {safeData.metrics?.lowStockItems || 0}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-rose-600 font-semibold">
                                <span>{t("dashboard.need_restock", "Need restock")}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Table Reservations */}
                    <div 
                        onClick={() => navigate('/admin/reservations')}
                        className="bg-white border border-neutral-200/70 rounded-[18px] p-3.5 lg:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer group hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] hover:border-neutral-300 transition-all duration-300 hover:-translate-y-0.5 col-span-2 lg:col-span-1"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                                    {t("dashboard.reservations", "Reservations")}
                                </h3>
                                <div className="h-[2px] w-5 bg-purple-400 rounded-full" />
                            </div>
                            <div className="w-8 h-8 rounded-[10px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Calendar className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-xl font-black text-neutral-900 tracking-tight block">
                                {safeData.metrics?.pendingReservations || 0}
                            </span>
                            <div className="flex items-center justify-between text-[10px] text-purple-600 font-semibold">
                                <span>{t("dashboard.pending_bookings", "Pending bookings")}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SIDE-BY-SIDE SPLIT GRID: Daily Revenue Trend + Live Orders Queue ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                    {/* LEFT SIDE: Daily Revenue Trend Chart Card (7 Cols) */}
                    <div className="lg:col-span-7 bg-white rounded-[22px] p-5 lg:p-6 shadow-[0_2px_24px_rgba(0,0,0,0.03)] border border-neutral-100 flex flex-col justify-between relative group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-base lg:text-lg font-serif text-neutral-900 tracking-tight">
                                    {chartView === 'trend' ? t("dashboard.daily_sales_trend", "Daily Revenue Trend") : chartView === 'daily' ? t("dashboard.daily_sales", "Daily Sales") : t("dashboard.combined", "Combined Analytics")}
                                </h2>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                    {t("dashboard.daily_revenue_peak", "7-Day Revenue & Peak Sales")}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <div className="flex items-center gap-0.5 bg-neutral-100/80 p-0.5 rounded-[12px]">
                                    <button 
                                        onClick={() => setChartView('trend')}
                                        className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all duration-200 ${chartView === 'trend' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        {t("dashboard.trend", "Trend")}
                                    </button>
                                    <button 
                                        onClick={() => setChartView('daily')}
                                        className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all duration-200 ${chartView === 'daily' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        {t("dashboard.daily", "Daily")}
                                    </button>
                                    <button 
                                        onClick={() => setChartView('combined')}
                                        className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all duration-200 ${chartView === 'combined' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        {t("dashboard.combined", "Combined")}
                                    </button>
                                </div>

                                <button
                                    onClick={() => navigate('/admin/reports')}
                                    className="px-2.5 py-1 rounded-[10px] bg-primary/10 text-neutral-900 hover:bg-primary/20 text-[11px] font-extrabold transition-all duration-200 flex items-center gap-1"
                                >
                                    <span>{t("dashboard.reports_link", "Reports")}</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Compact Stats Bar */}
                        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-[16px] bg-neutral-50/80 border border-neutral-100">
                            <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t("dashboard.seven_day_total", "7-Day Total")}</span>
                                <span className="text-sm lg:text-base font-black text-neutral-900">৳{safeData.salesData.reduce((acc, curr) => acc + curr.sales, 0).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t("dashboard.daily_avg", "Daily Avg")}</span>
                                <span className="text-sm lg:text-base font-black text-neutral-900">৳{Math.round(safeData.salesData.reduce((acc, curr) => acc + curr.sales, 0) / (safeData.salesData.length || 1)).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">{t("dashboard.peak_day", "Peak Day")}</span>
                                <span className="text-sm lg:text-base font-black text-emerald-600">
                                    {safeData.salesData.length > 0 
                                        ? safeData.salesData.reduce((max, curr) => curr.sales > max.sales ? curr : max, safeData.salesData[0]).name 
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Recharts Area Chart */}
                        <div className="h-[210px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartView === 'trend' ? (
                                    <AreaChart data={safeData.salesData} margin={{ top: 5, right: 15, bottom: 0, left: 0 }}>
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
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={5}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                            dx={-5}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                                            itemStyle={{ color: '#171717', fontWeight: 700, fontSize: '12px' }}
                                            labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '11px', marginBottom: '2px' }}
                                            formatter={(val: any) => [`৳${val}`, 'Sales']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="#F5B925" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                        />
                                    </AreaChart>
                                ) : chartView === 'daily' ? (
                                    <LineChart data={safeData.salesData} margin={{ top: 5, right: 15, bottom: 0, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={5}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                            dx={-5}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                                            itemStyle={{ color: '#171717', fontWeight: 700, fontSize: '12px' }}
                                            labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '11px', marginBottom: '2px' }}
                                            formatter={(value: any) => [`৳${value}`, 'Sales']}
                                        />
                                        <Line
                                            type="linear"
                                            dataKey="sales"
                                            stroke="#F5B925"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#F5B925', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#fff', stroke: '#F5B925', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={safeData.salesData} margin={{ top: 5, right: 15, bottom: 0, left: 0 }}>
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
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={5}
                                        />
                                        <YAxis
                                            stroke="#9ca3af"
                                            fontSize={11}
                                            fontWeight={600}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                            dx={-5}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                                            itemStyle={{ color: '#171717', fontWeight: 700, fontSize: '12px' }}
                                            labelStyle={{ color: '#9ca3af', fontWeight: 600, fontSize: '11px', marginBottom: '2px' }}
                                            formatter={(value: any) => [`৳${value}`, 'Sales']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="#F5B925" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSalesComb)" 
                                            dot={{ r: 3, fill: '#F5B925', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#fff', stroke: '#F5B925', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Live Recent Orders Queue Card (5 Cols - Side-by-Side!) */}
                    <div className="lg:col-span-5 bg-white border border-neutral-200/60 rounded-[22px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                        <div className="p-4 border-b border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-black text-neutral-900 tracking-tight">
                                    {t("dashboard.live_orders_queue", "Live Orders Queue")}
                                </h2>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                    {t("dashboard.kitchen_shift_feed", "Kitchen & Shift Feed")}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="px-2.5 py-1 rounded-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                                <span>{t("dashboard.view_all", "View All")}</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-neutral-100 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                            {isLoading && !data ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-8 h-8 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3.5 w-24" />
                                                <Skeleton className="h-3 w-36" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                ))
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        onClick={() => navigate('/admin/orders')}
                                        className="p-3.5 hover:bg-neutral-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <ShoppingCart className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold text-xs text-neutral-900 truncate">#{order.orderId}</p>
                                                    <span className="text-xs text-neutral-400">•</span>
                                                    <p className="text-xs font-semibold text-neutral-700 truncate">{order.customerName}</p>
                                                </div>
                                                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0 gap-1">
                                            <span className="font-black text-xs text-neutral-900">৳{order.total?.toLocaleString()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
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
                                <div className="p-6 text-center text-neutral-400 text-xs font-medium">No recent orders in shift.</div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {totalOrdersPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 bg-neutral-50/50">
                                <span className="text-[11px] font-semibold text-neutral-400">
                                    Page {recentOrdersPage} of {totalOrdersPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setRecentOrdersPage(prev => Math.max(prev - 1, 1))}
                                        disabled={recentOrdersPage === 1}
                                        className="p-1 rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setRecentOrdersPage(prev => Math.min(prev + 1, totalOrdersPages))}
                                        disabled={recentOrdersPage >= totalOrdersPages}
                                        className="p-1 rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── LOWER COMPACT GRID (3 Columns: Inventory Watchlist | Delivery Fleet | SMS Feed) ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                    {/* Inventory Watchlist */}
                    <div className="bg-white border border-neutral-200/60 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                        <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-neutral-900 tracking-tight">
                                    {t("dashboard.inventory_watchlist", "Inventory Watchlist")}
                                </h2>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{t("dashboard.low_stock_items", "Low Stock Items")}</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/inventory')}
                                className="px-2 py-1 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-bold transition-colors flex items-center gap-0.5"
                            >
                                <span>{t("dashboard.restock", "Restock")}</span>
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-neutral-100 flex-1">
                            {isLoading && !data ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-3 flex items-center justify-between">
                                        <Skeleton className="h-3.5 w-24" />
                                        <Skeleton className="h-4 w-12 rounded-full" />
                                    </div>
                                ))
                            ) : paginatedInventory.length > 0 ? (
                                paginatedInventory.map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => navigate('/admin/inventory')}
                                        className="p-3 hover:bg-neutral-50 transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                                            <p className="text-[10px] text-neutral-400">{item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {item.stock} {t("dashboard.stock_left", "left")} ({item.status})
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-neutral-400 text-center py-6">{t("dashboard.healthy_stock", "All stock levels healthy.")}</p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Fleet Quick Panel */}
                    <div 
                        onClick={() => navigate('/admin/delivery')}
                        className="bg-white border border-neutral-200/60 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-neutral-900 tracking-tight">{t("dashboard.delivery_fleet", "Delivery Fleet")}</h2>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{t("dashboard.active_riders", "Active Riders")}</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5">
                                {t("dashboard.hub", "Hub")} <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>

                        <div className="space-y-2 flex-1">
                            {safeData.staffData?.deliveryManPerformance?.slice(0, 3).map((dm) => (
                                <div key={dm.id} className="p-2.5 bg-neutral-50 rounded-[10px] flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">{dm.name}</p>
                                        <p className="text-[10px] text-neutral-400">{dm.phone}</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[9px] font-bold">
                                        {dm.completedOrders} {t("dashboard.delivered_count", "delivered")}
                                    </span>
                                </div>
                            ))}
                            {(!safeData.staffData?.deliveryManPerformance || safeData.staffData.deliveryManPerformance.length === 0) && (
                                <p className="text-xs text-neutral-400 text-center py-6">{t("dashboard.no_riders", "No active delivery personnel online.")}</p>
                            )}
                        </div>
                    </div>

                    {/* Real-time SMS & Order Alerts Feed */}
                    <div className="bg-white border border-neutral-200/60 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-rose-50 rounded-[10px] flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-neutral-900 tracking-tight">{t("dashboard.sms_alert_feed", "SMS & Alert Feed")}</h2>
                                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">{t("dashboard.live_order_alerts", "Live Order Alerts")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] custom-scrollbar">
                            {isLoading && !data ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="p-2.5 rounded-[10px] border border-neutral-200 bg-neutral-50 space-y-1">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-2.5 w-full" />
                                    </div>
                                ))
                            ) : paginatedSms.length > 0 ? (
                                paginatedSms.map((sms) => (
                                    <div
                                        key={sms.id}
                                        className={`p-2.5 rounded-[10px] border transition-all ${sms.unread
                                            ? 'bg-primary/5 border-primary/30'
                                            : 'bg-neutral-50/80 border-neutral-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-bold text-neutral-900">{sms.from}</span>
                                            <span className="text-[9px] text-neutral-400 flex items-center gap-0.5 font-semibold">
                                                <Clock className="w-2.5 h-2.5" />
                                                {sms.time}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-600 leading-tight font-medium line-clamp-2">
                                            {normalizeSmsCurrency(sms.message)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-400 text-xs text-center py-6">{t("dashboard.no_sms_logs", "No recent SMS logs.")}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
