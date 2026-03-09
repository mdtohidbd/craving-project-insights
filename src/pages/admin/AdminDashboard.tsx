import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import { Package, TrendingUp, Clock, AlertCircle, Phone, ArrowUpRight, ArrowDownRight } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

// Dummy Data
const salesData = [
    { name: "Mon", sales: 4000 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 5000 },
    { name: "Thu", sales: 4500 },
    { name: "Fri", sales: 6000 },
    { name: "Sat", sales: 7000 },
    { name: "Sun", sales: 5500 },
];

const inventoryData = [
    { id: 1, name: "Premium Coffee Beans", category: "Beverages", stock: 120, status: "In Stock" },
    { id: 2, name: "Vanilla Syrup", category: "Add-ons", stock: 15, status: "Low Stock" },
    { id: 3, name: "Croissants", category: "Food", stock: 45, status: "In Stock" },
    { id: 4, name: "Almond Milk", category: "Dairy Alt", stock: 8, status: "Low Stock" },
    { id: 5, name: "Espresso Cups", category: "Supplies", stock: 200, status: "In Stock" },
];

const smsNotifications = [
    { id: 1, from: "+1 (555) 0123", message: "New Order #1042: 2x Latte, 1x Croissant.", time: "2 min ago", unread: true },
    { id: 2, from: "+1 (555) 0199", message: "Order #1041 ready for pickup.", time: "15 min ago", unread: false },
    { id: 3, from: "+1 (555) 0842", message: "New Order #1040: 1x Espresso.", time: "1 hour ago", unread: false },
];

const AdminDashboard = () => {
    return (
        <AdminLayout title="Overview">
            <div className="space-y-8">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Total Sales"
                        value="$12,450"
                        trend="+12.5%"
                        isPositive={true}
                        icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                    />
                    <MetricCard
                        title="Active Orders"
                        value="24"
                        trend="+4"
                        isPositive={true}
                        icon={<Package className="w-4 h-4 text-blue-400" />}
                    />
                    <MetricCard
                        title="Low Stock Items"
                        value="2"
                        trend="-1"
                        isPositive={false}
                        icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sales Chart & Inventory */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Chart Section */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Daily Sales</h2>
                                    <p className="text-sm text-neutral-400">Revenue overview for the last 7 days</p>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
                                            tickFormatter={(value) => `$${value}`}
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
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">Inventory Status</h2>
                                    <p className="text-sm text-neutral-400">Manage your product stock levels</p>
                                </div>
                                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                    View All
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-neutral-400 bg-neutral-900/50 uppercase border-b border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Item Name</th>
                                            <th className="px-6 py-4 font-medium">Category</th>
                                            <th className="px-6 py-4 font-medium">Stock</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryData.map((item) => (
                                            <tr key={item.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-4 font-medium text-neutral-100">{item.name}</td>
                                                <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                                                <td className="px-6 py-4 font-medium">{item.stock}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'In Stock'
                                                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                                        : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* SMS Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-semibold">SMS Orders</h2>
                                </div>
                                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">1 New</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {smsNotifications.map((sms) => (
                                    <div
                                        key={sms.id}
                                        className={`p-4 rounded-xl border transition-all ${sms.unread
                                            ? 'bg-neutral-800/50 border-primary/30'
                                            : 'bg-neutral-900/50 border-neutral-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-neutral-200">{sms.from}</span>
                                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {sms.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-300 leading-relaxed">
                                            {sms.message}
                                        </p>
                                        {sms.unread && (
                                            <div className="mt-3 flex gap-2">
                                                <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                                                    Confirm
                                                </button>
                                                <button className="text-xs font-medium bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors">
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-2.5 text-sm font-medium text-neutral-400 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-neutral-50 transition-colors">
                                View All Messages
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

// Sub-component for clean metric cards
const MetricCard = ({ title, value, trend, isPositive, icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-neutral-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
            <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-neutral-700/50 transition-colors">
                {icon}
            </div>
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-3xl font-bold tracking-tight text-neutral-50">{value}</span>
            <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend}
            </span>
        </div>
    </div>
);

export default AdminDashboard;
