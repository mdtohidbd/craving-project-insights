import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Clock,
    Package,
    ChefHat,
    Truck,
    ThumbsUp,
    Calendar,
    ArrowRight,
    History,
    Loader2,
    AlertCircle,
    MapPin,
    User,
    ShoppingBag,
    ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface OrderSummary {
    id: string;
    date: string;
    total: number;
    itemCount: number;
}

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState(searchParams.get("id") || "");
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderHistory, setOrderHistory] = useState<OrderSummary[]>([]);

    useEffect(() => {
        // Load history from localStorage
        const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        setOrderHistory(history);

        if (searchParams.get("id")) {
            handleSearch(searchParams.get("id")!);
        }
    }, [searchParams]);

    const handleSearch = async (id: string) => {
        if (!id.trim()) return;

        setIsLoading(true);
        setError(null);
        setOrder(null);
        setOrderId(id);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/orders/${id}`);

            if (!res.ok) {
                if (res.status === 404) throw new Error("Order not found. Please check the ID.");
                throw new Error("Failed to fetch order details.");
            }

            const data = await res.json();
            setOrder(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'pending') return 0;
        if (s === 'preparing') return 1;
        if (s === 'ready' || s === 'assigned' || s === 'out_for_delivery') return 2;
        if (s === 'completed' || s === 'delivered') return 3;
        return 0;
    };

    const statusSteps = [
        { label: "Order Placed", icon: Package, key: "pending" },
        { label: "In the Kitchen", icon: ChefHat, key: "preparing" },
        { label: "Ready / Out", icon: Truck, key: "ready" },
        { label: "Enjoy!", icon: ThumbsUp, key: "completed" }
    ];

    const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

    return (
        <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
            <Navbar />

            {/* Header Section */}
            <section className="bg-primary pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.08), transparent 70%)" }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-accent text-xs font-bold uppercase tracking-[0.4em] mb-4 block">
                            ✦ Real-Time Updates
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tighter">
                            Track Your <span className="italic text-accent">Order</span>
                        </h1>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-focus-within:bg-accent/30 transition-all duration-300" />
                            <div className="relative flex p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                                <div className="flex-1 flex items-center px-4">
                                    <Search className="w-5 h-5 text-white/40 mr-3" />
                                    <input
                                        type="text"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch(orderId)}
                                        placeholder="Enter Order ID (e.g. 662bc...)"
                                        className="w-full bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 font-medium"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSearch(orderId)}
                                    disabled={isLoading}
                                    className="bg-accent text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Now"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="flex-1 py-16 -mt-10 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-10 items-start">

                        {/* Main Content Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center shadow-xl border border-black/5"
                                    >
                                        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-6" />
                                        <p className="text-muted-foreground font-medium">Fetching your order updates...</p>
                                    </motion.div>
                                ) : order ? (
                                    <motion.div
                                        key="order-found"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        {/* Status Tracker */}
                                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-black/5">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">
                                                            Current Status
                                                        </span>
                                                    </div>
                                                    <h3 className="text-3xl font-serif font-bold text-primary capitalize">
                                                        {order.status === 'pending' ? 'Order Received' :
                                                            order.status === 'preparing' ? 'Cooking in Progress' :
                                                                order.status === 'ready' ? 'Ready for Selection' :
                                                                    order.status === 'assigned' ? 'Courier Assigned' :
                                                                        order.status === 'out_for_delivery' ? 'Out for Delivery' :
                                                                            order.status === 'completed' ? 'Delivered & Enjoyed' :
                                                                                order.status.replace(/_/g, ' ')}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Order ID</p>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <p className="font-mono font-bold text-primary bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100 shadow-inner">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                        </p>
                                                        <p className="text-[9px] font-mono text-muted-foreground opacity-50 px-2">
                                                            Full: {order._id.toLowerCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative pt-4 pb-4">
                                                <div className="absolute top-9 left-12 right-12 h-1 bg-neutral-100 rounded-full">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(228,168,32,0.4)]"
                                                    />
                                                </div>

                                                <div className="relative flex justify-between">
                                                    {statusSteps.map((step, idx) => {
                                                        const Icon = step.icon;
                                                        const isCompleted = idx <= currentStatusIndex;
                                                        const isActive = idx === currentStatusIndex;

                                                        return (
                                                            <div key={idx} className="flex flex-col items-center gap-4 text-center">
                                                                <motion.div
                                                                    initial={false}
                                                                    animate={{
                                                                        scale: isActive ? 1.2 : 1,
                                                                        backgroundColor: isCompleted ? "var(--tw-bg-opacity)" : "#fff"
                                                                    }}
                                                                    className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 shadow-md ${isCompleted ? 'bg-accent text-primary' : 'bg-white border-2 border-neutral-100 text-neutral-300'
                                                                        } ${isActive ? 'ring-4 ring-accent/20' : ''}`}
                                                                >
                                                                    <Icon className="w-6 h-6" />
                                                                    {isActive && (
                                                                        <motion.div
                                                                            layoutId="active-ping"
                                                                            className="absolute inset-0 rounded-full bg-accent animate-ping opacity-25"
                                                                        />
                                                                    )}
                                                                </motion.div>
                                                                <div className="space-y-1">
                                                                    <span className={`text-[11px] font-bold uppercase tracking-tighter block leading-none ${isCompleted ? 'text-primary' : 'text-neutral-400'
                                                                        }`}>
                                                                        {step.label}
                                                                    </span>
                                                                    {isActive && <span className="text-[10px] text-accent font-bold">In Progress</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Details Grid */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Customer & Delivery */}
                                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-black/5">
                                                <h4 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
                                                    <MapPin className="w-5 h-5 text-accent" />
                                                    Delivery Details
                                                </h4>
                                                <div className="space-y-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5 text-primary/30" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Customer</p>
                                                            <p className="font-bold text-primary">{order.customerInfo.name}</p>
                                                            <p className="text-sm text-muted-foreground">{order.customerInfo.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="w-5 h-5 text-primary/30" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Address</p>
                                                            <p className="font-bold text-primary leading-snug">{order.customerInfo.address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-lg border border-black/5">
                                                <h4 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
                                                    <ShoppingBag className="w-5 h-5 text-accent" />
                                                    Order Items
                                                </h4>
                                                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-lg">
                                                                    {item.quantity}
                                                                </span>
                                                                <span className="font-bold text-primary text-sm">{item.title}</span>
                                                            </div>
                                                            <span className="font-bold text-accent text-sm">৳{Math.round(item.price * item.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Total Paid</p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-primary font-serif text-3xl font-bold">৳{Math.round(order.total)}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                                                        <AnimatePresence mode="wait">
                                                            <motion.span
                                                                key={order.paymentMethod}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="capitalize"
                                                            >
                                                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod || 'Paid'}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error-state"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl border border-red-50"
                                    >
                                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <AlertCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-primary mb-3">Order Not Found</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                            {error}
                                        </p>
                                        <button
                                            onClick={() => setOrderId("")}
                                            className="text-primary font-bold underline underline-offset-4 hover:text-accent transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                    </motion.div>
                                ) : (
                                    /* Empty state / Introduction */
                                    <motion.div
                                        key="empty-state"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl border border-black/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16" />

                                        <div className="w-24 h-24 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                            <Package className="w-10 h-10 text-primary/20" />
                                        </div>
                                        <h3 className="text-3xl font-serif font-bold text-primary mb-4">Awaiting Your Order ID</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto line-relaxed">
                                            Enter your unique order identifier from your receipt or choose from your recent orders to see the current status of your delicious meal.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar: History */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-black/5">
                                <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
                                    <History className="w-5 h-5 text-accent" />
                                    Recent Orders
                                </h3>

                                {orderHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {orderHistory.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSearch(item.id)}
                                                className={`w-full text-left p-5 rounded-2xl border transition-all group ${order?._id === item.id
                                                    ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-neutral-50 border-neutral-100 hover:border-accent hover:bg-white'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${order?._id === item.id ? 'text-white/60' : 'text-muted-foreground'
                                                        }`}>
                                                        {item.date.split(',')[0]}
                                                    </span>
                                                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${order?._id === item.id ? 'bg-white/10 text-white' : 'bg-white text-primary border border-neutral-100'
                                                        }`}>
                                                        #{item.id.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className={order?._id === item.id ? 'text-white' : 'text-primary'}>
                                                        <p className="font-bold text-sm">৳{Math.round(item.total)}</p>
                                                        <p className={`text-[10px] font-medium opacity-70`}>{item.itemCount} Items Ordered</p>
                                                    </div>
                                                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${order?._id === item.id ? 'text-accent' : 'text-neutral-300'
                                                        }`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-40">
                                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-medium">No order history found on this device.</p>
                                    </div>
                                )}
                            </div>

                            {/* Need Help Card */}
                            <div className="bg-accent rounded-[2.5rem] p-8 shadow-xl shadow-accent/20 text-primary">
                                <h4 className="font-serif font-bold text-xl mb-3">Need Assistance?</h4>
                                <p className="text-xs font-medium mb-6 leading-relaxed opacity-80">
                                    If you can't find your order or have issues tracking it, our support team is ready to help you.
                                </p>
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    Contact Support
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #eab308;
        }
      `}} />
        </div>
    );
};

export default OrderTracking;
