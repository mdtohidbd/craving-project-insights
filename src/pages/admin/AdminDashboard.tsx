import React, { useState, useEffect } from "react";
import {
    Package, TrendingUp, Clock, AlertCircle, Phone, ArrowUpRight, ArrowDownRight,
    DollarSign, ShoppingCart, Users, Calendar, Download, BarChart3, PieChart as PieChartIcon
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import { toast } from "sonner";

interface DashboardData {
    metrics: {
        totalSales: number;
        todaySales: number;
        monthlySales: number;
        totalOrders: number;
        activeOrders: number;
        lowStockItems: number;
    };
    salesData: { name: string; sales: number }[];
    inventoryData: { id: string; name: string; category: string; stock: number; status: string }[];
    smsNotifications: { id: string; from: string; message: string; time: string; unread: boolean }[];
}

const AdminDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reportType, setReportType] = useState("overview");

    // Report specific mock data (from AdminReports)
    const reportData = {
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
        ]
    };

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
                }
            } catch (error) {
                console.error("Fetch dashboard error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading || !data) {
        return (
            <AdminLayout title="Overview">
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Overview">
            <div className="space-y-8 pb-10">
                {/* Pills Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setReportType("overview")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reportType === "overview"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setReportType("sales")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reportType === "sales"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                            }`}
                    >
                        Sales Report
                    </button>
                    <button
                        onClick={() => setReportType("items")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reportType === "items"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                            }`}
                    >
                        Item Analysis
                    </button>
                </div>

                {reportType === "overview" && (
                    <>
                        {/* Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Today's Sales"
                                value={`৳${Math.round(data.metrics.todaySales || 0)}`}
                                trend=""
                                isPositive={true}
                                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                            />
                            <MetricCard
                                title="This Month"
                                value={`৳${Math.round(data.metrics.monthlySales || 0)}`}
                                trend=""
                                isPositive={true}
                                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                            />
                            <MetricCard
                                title="Total Orders"
                                value={(data.metrics.totalOrders || 0).toString()}
                                trend=""
                                isPositive={true}
                                icon={<Package className="w-4 h-4 text-blue-400" />}
                            />
                            <MetricCard
                                title="Active Orders"
                                value={data.metrics.activeOrders.toString()}
                                trend=""
                                isPositive={true}
                                icon={<Clock className="w-4 h-4 text-amber-400" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sales Chart & Inventory */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Chart Section */}
                                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-lg font-semibold text-neutral-900">Daily Sales</h2>
                                            <p className="text-sm text-neutral-500">Revenue overview for the last 7 days</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#737373"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    stroke="#737373"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value) => `৳${value}`}
                                                    dx={-10}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ color: '#171717' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#eab308" /* yellow-500 */
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }}
                                                    activeDot={{ r: 6, fill: '#fef9c3', stroke: '#eab308', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Inventory Table */}
                                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-neutral-900">Inventory Preview</h2>
                                            <p className="text-sm text-neutral-500">Manage your product stock levels</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-neutral-500 bg-neutral-50 uppercase border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Item Name</th>
                                                    <th className="px-6 py-4 font-medium">Category</th>
                                                    <th className="px-6 py-4 font-medium">Stock</th>
                                                    <th className="px-6 py-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.inventoryData.map((item) => (
                                                    <tr key={item.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-neutral-900">{item.name}</td>
                                                        <td className="px-6 py-4 text-neutral-600">{item.category}</td>
                                                        <td className="px-6 py-4 font-medium">{item.stock}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'In Stock'
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.inventoryData.length === 0 && (
                                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-neutral-500">No items found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* SMS Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[500px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-neutral-900">SMS Logs</h2>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {data.smsNotifications.map((sms) => (
                                            <div
                                                key={sms.id}
                                                className={`p-4 rounded-xl border transition-all ${sms.unread
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
                                        ))}
                                        {data.smsNotifications.length === 0 && (
                                            <p className="text-neutral-500 text-sm text-center pt-8">No Recent SMS logs.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {reportType === "sales" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Sales Pie Chart (Consolidated from reports) */}
                        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900">Sales Distribution</h2>
                                    <p className="text-sm text-neutral-500">Revenue share by category</p>
                                </div>
                                <PieChartIcon className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={reportData.categorySales}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percentage }) => `${category}: ${percentage}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="sales"
                                        >
                                            {reportData.categorySales.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Payment Methods</h2>
                            <div className="space-y-4">
                                {reportData.paymentMethods.map((method) => (
                                    <div key={method.method} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-neutral-900 font-medium">{method.method}</p>
                                                <p className="text-sm text-neutral-500">{method.count} transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-neutral-900 font-semibold">{method.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sales by Category Table */}
                        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Category Breakdown</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200">
                                            <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">Category</th>
                                            <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">Revenue</th>
                                            <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">Market Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.categorySales.map((category) => (
                                            <tr key={category.category} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                                <td className="py-4 text-neutral-900 font-medium">{category.category}</td>
                                                <td className="text-right py-4 text-neutral-700">৳{category.sales.toLocaleString()}</td>
                                                <td className="text-right py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${category.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-neutral-900 font-medium min-w-[3rem]">
                                                            {category.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {reportType === "items" && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">Top Performing Items</h2>
                                <p className="text-sm text-neutral-500">Based on sales volume and total revenue</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">Rank</th>
                                        <th className="text-left py-4 text-neutral-500 font-medium uppercase text-xs">Item Name</th>
                                        <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">Qty Sold</th>
                                        <th className="text-right py-4 text-neutral-500 font-medium uppercase text-xs">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.topItems.map((item, index) => (
                                        <tr key={item.name} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
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
            </div>
        </AdminLayout>

    );
};

// Sub-component for clean metric cards
const MetricCard = ({ title, value, trend, isPositive, icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode }) => (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-neutral-300 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
            <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-neutral-200 transition-colors">
                {icon}
            </div>
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-3xl font-bold tracking-tight text-neutral-900">{value}</span>
            {trend && (
                <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </span>
            )}
        </div>
    </div>
);

export default AdminDashboard;
