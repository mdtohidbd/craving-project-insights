import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { 
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar,
    Download, Filter, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell
} from "recharts";

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

const AdminReports = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("7days");
    const [reportType, setReportType] = useState("overview");

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
    }, [dateRange]);

    const COLORS = ['#eab308', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading || !reportData) {
        return (
            <AdminLayout title="Reports">
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Reports">
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReportType("overview")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                reportType === "overview"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setReportType("sales")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                reportType === "sales"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                        >
                            Sales
                        </button>
                        <button
                            onClick={() => setReportType("items")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                reportType === "items"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                        >
                            Items
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="1year">Last Year</option>
                        </select>
                        <button className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value={`৳${reportData.summary.totalRevenue.toLocaleString()}`}
                        change={reportData.summary.revenueChange}
                        isPositive={reportData.summary.revenueChange > 0}
                        icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
                    />
                    <MetricCard
                        title="Total Orders"
                        value={reportData.summary.totalOrders.toLocaleString()}
                        change={reportData.summary.ordersChange}
                        isPositive={reportData.summary.ordersChange > 0}
                        icon={<ShoppingCart className="w-4 h-4 text-blue-400" />}
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={`৳${reportData.summary.averageOrderValue.toFixed(2)}`}
                        change={0}
                        isPositive={true}
                        icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
                    />
                    <MetricCard
                        title="Customers"
                        value={reportData.summary.customerCount.toLocaleString()}
                        change={0}
                        isPositive={true}
                        icon={<Users className="w-4 h-4 text-purple-400" />}
                    />
                </div>

                {reportType === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Daily Sales Trend</h2>
                                <BarChart3 className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportData.dailySales}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#525252"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#525252"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                                            itemStyle={{ color: '#e5e5e5' }}
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
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Sales by Category</h2>
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
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                                            itemStyle={{ color: '#e5e5e5' }}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {reportType === "sales" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by Category Table */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Sales by Category</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-800">
                                            <th className="text-left py-3 text-neutral-400">Category</th>
                                            <th className="text-right py-3 text-neutral-400">Revenue</th>
                                            <th className="text-right py-3 text-neutral-400">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.categorySales.map((category, index) => (
                                            <tr key={category.category} className="border-b border-neutral-800/50">
                                                <td className="py-3 text-neutral-300">{category.category}</td>
                                                <td className="text-right py-3 text-neutral-300">৳{category.sales.toLocaleString()}</td>
                                                <td className="text-right py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
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
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-6">Payment Methods</h2>
                            <div className="space-y-4">
                                {reportData.paymentMethods.map((method) => (
                                    <div key={method.method} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-neutral-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{method.method}</p>
                                                <p className="text-sm text-neutral-400">{method.count} transactions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-medium">{method.percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {reportType === "items" && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Top Selling Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="text-left py-3 text-neutral-400">Item Name</th>
                                        <th className="text-right py-3 text-neutral-400">Quantity Sold</th>
                                        <th className="text-right py-3 text-neutral-400">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.topItems.map((item, index) => (
                                        <tr key={item.name} className="border-b border-neutral-800/50">
                                            <td className="py-3 text-neutral-300">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                                        {index + 1}
                                                    </span>
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="text-right py-3 text-neutral-300">{item.quantity}</td>
                                            <td className="text-right py-3 text-neutral-300">৳{item.revenue.toLocaleString()}</td>
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
            <div className="p-2 bg-neutral-800 rounded-lg">
                {icon}
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{value}</span>
            {change !== 0 && (
                <span className={`text-sm font-medium flex items-center gap-1 ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
    </div>
);

export default AdminReports;
