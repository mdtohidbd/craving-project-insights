import React, { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import { Package, TrendingUp, Clock, AlertCircle, Phone, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
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
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#525252"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#525252"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `৳${value}`}
                                            dx={-10}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                                            itemStyle={{ color: '#e5e5e5' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#eab308" /* yellow-500 */
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#fef08a' }}
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
                                            {sms.message}
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
