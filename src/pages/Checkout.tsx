import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Banknote, Printer, Clock, MapPin, User, Package, ChefHat, Truck, ThumbsUp, Calendar, Minus, Plus, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";

const Checkout = () => {
  const { cart, totalAmount, clearCart, updateQuantity, toggleAddOn } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "cod">("cod");

  const deliveryFee = settings.deliveryFee;

  const finalTotal = totalAmount + (cart.length > 0 ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(t("pos.your_cart_is_empty", "Your cart is empty"));
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      customerInfo: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        notes: formData.get("notes") || "",
      },
      items: cart.map(item => {
        // Need to extract the actual numeric ID if we appended string for variations
        const actualId = item.id.toString().split('-')[0];
        return {
          menuItemId: actualId,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          addOns: item.addOns
        };
      }),
      subtotal: totalAmount,
      tax: 0,
      total: finalTotal,
      status: "pending",
      orderType: "online",
      paymentMethod: paymentMethod
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error("Order failed");

      const resData = await res.json().catch(() => ({}));

      const newOrderDetails = {
        orderId: resData.orderId || resData._id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cart,
        subtotal: totalAmount,
        deliveryFee: deliveryFee,
        total: finalTotal,
        customerInfo: orderData.customerInfo,
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bkash" ? "bKash" : "Nagad",
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      setOrderDetails(newOrderDetails);

      // Save to localStorage for order tracking
      try {
        const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        const orderSummary = {
          id: newOrderDetails.orderId,
          date: newOrderDetails.date,
          total: newOrderDetails.total,
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        };
        // Keep only last 10 orders
        const updatedHistory = [orderSummary, ...history].slice(0, 10);
        localStorage.setItem("orderHistory", JSON.stringify(updatedHistory));
      } catch (err) {
        console.error("Failed to save order history:", err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      toast.error(t("pos.failed_to_place_order_please_try_again", "Failed to place order. Please try again."));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col relative overflow-hidden">
        <div className="print-hidden">
          <Navbar theme="light" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center pt-24 pb-16 relative z-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto"
          >
            {/* Back to Home Button at the Top */}
            <div className="flex justify-start mb-6 print-hidden">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-50 text-primary font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-neutral-100 hover:-translate-y-0.5 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-accent" />
                Back to Home
              </button>
            </div>

            {/* Header Success Section */}
            <div className="text-center mb-12 print-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_15px_40px_rgba(228,168,32,0.4)]"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-4">
                Thank you, {orderDetails?.customerInfo?.name?.split(' ')[0]}!
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto font-medium">
                Your order has been received and is now being processed by our kitchen.
                Get ready for some deliciousness!
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Left Column: Order Status and Details */}
              <div className="lg:col-span-3 space-y-6 print-hidden">
                {/* Order Progress Tracker */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-black/5">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-3">
                      <Clock className="w-5 h-5 text-accent" />
                      Order Status
                    </h3>
                    <span className="px-4 py-1.5 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider rounded-full">
                      Processing
                    </span>
                  </div>

                  <div className="relative pt-2 pb-4">
                    {/* Horizontal Stepper for Desktop */}
                    <div className="hidden md:block relative">
                      {/* Progress Bar Line */}
                      <div className="absolute top-5 left-6 right-6 h-1 bg-gray-100 rounded-full">
                        <div className="h-full bg-accent rounded-full" style={{ width: '25%' }}></div>
                      </div>

                      {/* Status Steps */}
                      <div className="relative flex justify-between">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center relative z-10 shadow-lg">
                            <Package className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-primary uppercase tracking-tighter">{t("pos.order", "Order")}<br />{t("pos.placed", "Placed")}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10">
                            <ChefHat className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{t("pos.in_the", "In the")}<br />{t("pos.kitchen", "Kitchen")}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10">
                            <Truck className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{t("pos.out_for", "Out for")}<br />{t("pos.delivery", "Delivery")}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10">
                            <ThumbsUp className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{t("pos.enjoy_your", "Enjoy your")}<br />{t("pos.meal", "Meal")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vertical Stepper for Mobile */}
                    <div className="md:hidden relative flex flex-col gap-6 pl-8">
                      {/* Vertical line connecting steps */}
                      <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-neutral-100">
                        <div className="absolute top-0 left-0 w-full bg-accent rounded-full" style={{ height: '25%' }}></div>
                      </div>

                      {/* Step 1 */}
                      <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center relative z-10 shadow-lg -ml-[19px]">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">{t("pos.order_placed", "Order Placed")}</p>
                          <p className="text-[10px] text-accent font-semibold uppercase tracking-widest mt-0.5">{t("pos.completed", "Completed")}</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10 -ml-[19px]">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("pos.in_the_kitchen", "In the Kitchen")}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t("pos.pending", "Pending")}</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10 -ml-[19px]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("pos.out_for_delivery", "Out for Delivery")}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t("pos.pending", "Pending")}</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 text-gray-300 flex items-center justify-center relative z-10 -ml-[19px]">
                          <ThumbsUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t("pos.enjoy_your_meal", "Enjoy your Meal")}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{t("pos.pending", "Pending")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-black/5">
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-8 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-accent" />
                    Delivery Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary/40" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{t("pos.customer", "Customer")}</p>
                          <p className="font-bold text-primary">{orderDetails.customerInfo.name}</p>
                          <p className="text-sm text-muted-foreground">{orderDetails.customerInfo.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary/40" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{t("pos.address", "Address")}</p>
                          <p className="font-bold text-primary leading-tight">{orderDetails.customerInfo.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {orderDetails.customerInfo.notes && (
                    <div className="mt-8 pt-6 border-t border-gray-50">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">{t("pos.order_notes", "Order Notes")}</p>
                      <p className="text-sm italic text-muted-foreground bg-gray-50 p-4 rounded-xl border border-gray-100">
                        "{orderDetails.customerInfo.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(`/track-order?id=${orderDetails.orderId}`)}
                    className="flex-1 bg-accent text-primary font-bold py-4 px-6 rounded-2xl hover:bg-accent/90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-xs uppercase tracking-wider"
                  >
                    <Clock className="w-4 h-4" />
                    Track Your Order
                  </button>
                  <button
                    onClick={() => navigate("/menu")}
                    className="flex-1 bg-primary text-white font-bold py-4 px-6 rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl text-xs uppercase tracking-wider"
                  >
                    Return to Menu
                  </button>
                  <button
                    onClick={handlePrint}
                    className="sm:px-8 bg-white border border-black/5 text-primary font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg text-xs uppercase tracking-wider"
                  >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Digital Receipt */}
              <div className="lg:col-span-2">
                <div className="receipt-container relative bg-white rounded-[1.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                  {/* Receipt Jagged Edge Top */}
                  <div className="h-4 bg-primary flex overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-white transform rotate-45 translate-y-2 -translate-x-1 flex-shrink-0"></div>
                    ))}
                  </div>

                  <div className="p-8 md:p-10 pt-4">
                    {/* Restaurant Branding */}
                    <div className="text-center mb-8 pb-6 border-b border-dashed border-gray-200">
                      <h2 className="text-3xl font-serif font-bold text-primary mb-1 uppercase">{settings.websiteName}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">{t("pos.exquisite_dining", "Exquisite Dining")}</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {orderDetails.date}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{t("pos.order_id", "Order ID")}</span>
                        <span className="font-bold font-mono text-primary">#{orderDetails.orderId.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{t("pos.payment", "Payment")}</span>
                        <span className="font-bold text-primary">{orderDetails.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Itemized List */}
                    <div className="space-y-4 mb-8">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("pos.order_items", "Order Items")}</div>
                      {orderDetails.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between gap-4 group">
                          <div className="flex-1">
                            <p className="font-bold text-primary text-sm leading-tight">{item.quantity}x {item.title}</p>
                            {item.addOns && item.addOns.length > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Add-ons: {item.addOns.map((a: any) => a.name).join(', ')}
                              </p>
                            )}
                            {item.notes && <p className="text-[11px] text-muted-foreground italic mt-0.5">{item.notes}</p>}
                          </div>
                          <div className="font-bold text-primary text-sm whitespace-nowrap">
                            ৳{Math.round(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals Section */}
                    <div className="pt-8 border-t border-dashed border-gray-200 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{t("pos.subtotal", "Subtotal")}</span>
                        <span className="font-bold text-primary">৳{Math.round(orderDetails.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">{t("pos.delivery", "Delivery")}</span>
                        <span className="font-bold text-primary">৳{Math.round(orderDetails.deliveryFee)}</span>
                      </div>
                      
                      <div className="mt-6 p-6 bg-gray-50 rounded-[1.25rem] border border-gray-100 flex flex-col items-center gap-1 shadow-inner overflow-hidden">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{t("pos.total_amount", "Total Amount")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-serif font-bold text-accent">৳</span>
                          <span className="text-4xl font-serif font-bold text-primary tracking-tighter">
                            {Math.round(orderDetails.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Simple Message */}
                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{t("pos.thank_you_for_choosing", "Thank you for Choosing")} {settings.websiteName}</p>
                    </div>
                  </div>

                  {/* Receipt Jagged Edge Bottom */}
                  <div className="h-4 bg-primary flex overflow-hidden -mt-1 rotate-180">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-white transform rotate-45 translate-y-2 -translate-x-1 flex-shrink-0"></div>
                    ))}
                  </div>
                </div>

                {/* Notification Hint */}
                <div className="text-center mt-6 text-xs text-muted-foreground print-hidden flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Your order status will be updated via SMS.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="print-hidden">
          <Footer />
        </div>

        {/* Global Print Styling - Dynamic */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body { background: white !important; }
            .receipt-container { 
              box-shadow: none !important; 
              border: 1px solid #eee !important;
              max-width: 400px !important;
              margin: 0 auto !important;
              border-radius: 0 !important;
            }
            .min-h-screen { min-height: auto !important; padding: 0 !important; }
            .pt-24 { padding-top: 2rem !important; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-primary pt-28 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-4 md:mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Secure Checkout
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Checkout Area */}
      <section className="py-12 relative z-20 -mt-4 md:-mt-8 pb-28 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-6xl">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-black/5">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">{t("pos.your_cart_is_empty", "Your cart is empty")}</h2>
              <p className="text-muted-foreground mb-8">{t("pos.add_some_delicious_items_from_our_menu_f", "Add some delicious items from our menu first.")}</p>
              <button
                onClick={() => navigate("/menu")}
                className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 px-10 rounded-2xl shadow-[0_8px_20px_rgba(228,168,32,0.3)] hover:-translate-y-1 transition-all text-[13px] uppercase tracking-wider"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-12 items-start">

              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-7 bg-white p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/5"
              >
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">

                  {/* Shipping Details */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0 bottom-0 w-1 bg-accent/20 rounded-full hidden md:block" />
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      Delivery Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">{t("pos.full_name", "Full Name")}</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <input name="name" required type="text" className="w-full bg-[hsl(40_18%_96%)] border-2 border-transparent rounded-2xl pl-12 pr-5 py-4 text-primary font-bold focus:bg-white focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none placeholder:text-muted-foreground/40 placeholder:font-normal" placeholder="Enter your full name" />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">{t("pos.phone_number", "Phone Number")}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground group-focus-within:text-accent transition-colors">+88</div>
                          <input name="phone" required type="tel" className="w-full bg-[hsl(40_18%_96%)] border-2 border-transparent rounded-2xl pl-14 pr-5 py-4 text-primary font-bold focus:bg-white focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none placeholder:text-muted-foreground/40 placeholder:font-normal" placeholder="017XXXXXXXX" />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">{t("pos.delivery_address", "Delivery Address")}</label>
                        <textarea name="address" required rows={3} className="w-full bg-[hsl(40_18%_96%)] border-2 border-transparent rounded-2xl px-6 py-4 text-primary font-bold focus:bg-white focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none placeholder:text-muted-foreground/40 placeholder:font-normal" placeholder="House no, Street name, Area, Landmark..."></textarea>
                      </div>
                      <div className="md:col-span-2 space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-1">{t("pos.chef_instructions_optional", "Chef Instructions (Optional)")}</label>
                        <textarea name="notes" rows={2} className="w-full bg-[hsl(40_18%_96%)] border-2 border-transparent rounded-2xl px-6 py-4 text-primary font-bold focus:bg-white focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all outline-none resize-none placeholder:text-muted-foreground/40 placeholder:font-normal" placeholder="Add any special requests or delivery notes..."></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Interactive Section) */}
                  <div className="pt-6 border-t border-black/5">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-5 sm:mb-6 flex items-center gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm shrink-0">2</span>
                      Order Items
                    </h2>
                    <div className="space-y-6">
                      {cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="bg-[hsl(40_18%_96%)] p-6 rounded-[2rem] border border-black/5 shadow-sm">
                          <div className="flex items-center gap-5">
                            <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-primary text-lg">{item.title}</h4>
                                <span className="font-bold text-accent text-lg">৳{Math.round(item.price * item.quantity)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-black/5">
                                  <button 
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-7 h-7 rounded-lg hover:bg-accent hover:text-primary flex items-center justify-center transition-all text-muted-foreground"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-bold text-primary min-w-[20px] text-center">{item.quantity}</span>
                                  <button 
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-7 h-7 rounded-lg hover:bg-accent hover:text-primary flex items-center justify-center transition-all text-muted-foreground"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">৳{Math.round(item.price)} {t("pos.per_unit", "per unit")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Add-ons for Checkout */}
                          {item.availableAddOns && item.availableAddOns.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-black/5">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mb-4">{t("pos.customize_your_selection", "Customize Your Selection")}</p>
                              <div className="flex flex-wrap gap-2">
                                {item.availableAddOns.map((addon, aIdx) => {
                                  const isSelected = item.addOns?.some(a => a.name === addon.name);
                                  return (
                                    <button
                                      key={aIdx}
                                      type="button"
                                      onClick={() => toggleAddOn(item.id, addon)}
                                      className={`text-[11px] px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                                        isSelected 
                                        ? "bg-accent border-accent text-primary font-bold shadow-lg shadow-accent/20" 
                                        : "bg-white border-black/5 text-muted-foreground hover:border-accent/50"
                                      }`}
                                    >
                                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                      <span>{addon.name}</span>
                                      <span className={isSelected ? "text-primary/60" : "text-accent"}>+৳{addon.price}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="pt-8 sm:pt-10 border-t border-black/5 relative">
                    <div className="absolute -left-12 top-10 bottom-0 w-1 bg-accent/20 rounded-full hidden md:block" />
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      <label className={`group block relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === "bkash" ? "border-accent bg-accent/5 ring-4 ring-accent/5" : "border-black/5 hover:border-black/10 bg-[hsl(40_18%_96%)]/50"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "bkash"} onChange={() => setPaymentMethod("bkash")} />
                        <div className="flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "bkash" ? "border-accent bg-accent" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"}`}>
                            {paymentMethod === "bkash" && <Check className="w-4 h-4 text-primary font-bold" />}
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform duration-300">
                            <img src="/images/bkash.svg" alt="bKash" className="w-10 h-10 object-contain" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-primary text-lg">{t("pos.bkash", "bKash")}</p>
                            <p className="text-sm text-muted-foreground font-medium">{t("pos.safe_secure_digital_payment", "Safe & secure digital payment")}</p>
                          </div>
                          {paymentMethod === "bkash" && (
                            <motion.div layoutId="active-badge" className="px-3 py-1 bg-accent text-primary text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-accent/20">{t("pos.selected", "Selected")}</motion.div>
                          )}
                        </div>
                      </label>

                      <label className={`group block relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === "nagad" ? "border-accent bg-accent/5 ring-4 ring-accent/5" : "border-black/5 hover:border-black/10 bg-[hsl(40_18%_96%)]/50"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "nagad"} onChange={() => setPaymentMethod("nagad")} />
                        <div className="flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "nagad" ? "border-accent bg-accent" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"}`}>
                            {paymentMethod === "nagad" && <Check className="w-4 h-4 text-primary font-bold" />}
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform duration-300">
                            <img src="/images/nagad.svg" alt="Nagad" className="w-10 h-10 object-contain" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-primary text-lg">{t("pos.nagad", "Nagad")}</p>
                            <p className="text-sm text-muted-foreground font-medium">{t("pos.fast_reliable_transaction", "Fast & reliable transaction")}</p>
                          </div>
                          {paymentMethod === "nagad" && (
                            <motion.div layoutId="active-badge" className="px-3 py-1 bg-accent text-primary text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-accent/20">{t("pos.selected", "Selected")}</motion.div>
                          )}
                        </div>
                      </label>

                      <label className={`group block relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-accent bg-accent/5 ring-4 ring-accent/5" : "border-black/5 hover:border-black/10 bg-[hsl(40_18%_96%)]/50"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                        <div className="flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "cod" ? "border-accent bg-accent" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"}`}>
                            {paymentMethod === "cod" && <Check className="w-4 h-4 text-primary font-bold" />}
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform duration-300">
                            <Banknote className="w-7 h-7 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-primary text-lg">{t("pos.cash_on_delivery", "Cash on Delivery")}</p>
                            <p className="text-sm text-muted-foreground font-medium">{t("pos.pay_with_cash_at_your_doorstep", "Pay with cash at your doorstep")}</p>
                          </div>
                          {paymentMethod === "cod" && (
                            <motion.div layoutId="active-badge" className="px-3 py-1 bg-accent text-primary text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-accent/20">{t("pos.selected", "Selected")}</motion.div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                </form>
              </motion.div>

              {/* Order Summary Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="lg:col-span-5 lg:sticky lg:top-32"
              >
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden flex flex-col">
                  {/* Decorative Header */}
                  <div className="bg-primary px-8 py-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h3 className="text-xl font-serif font-bold relative z-10">
                      Order Summary
                    </h3>
                    <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold mt-1 relative z-10">{t("pos.review_your_selections", "Review your selections")}</p>
                  </div>

                  <div className="p-8 md:p-10">
                    {/* Items list */}
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar pr-4 mb-8 -mr-2 space-y-5">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-5 group items-center">
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-black/5">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            </div>
                            <span className="absolute -top-2.5 -right-2.5 bg-accent text-primary text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black shadow-lg border-2 border-white ring-1 ring-black/5">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-primary text-sm leading-tight truncate">{item.title}</h4>
                            {item.addOns && item.addOns.length > 0 && (
                              <div className="text-[10px] text-accent mt-1 font-bold flex flex-wrap gap-1">
                                {item.addOns.map((a, i) => (
                                  <span key={i} className="bg-accent/10 px-1.5 py-0.5 rounded-md">+{a.name}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-muted-foreground text-[11px] font-medium tracking-tight">৳{Math.round(item.price)} {t("pos.per_unit", "per unit")}</span>
                            </div>
                          </div>
                          <div className="font-bold text-primary text-right flex-shrink-0">
                            <div className="text-[11px] text-muted-foreground font-medium mb-0.5">{t("pos.subtotal", "Subtotal")}</div>
                            <div className="text-base font-serif">৳{Math.round(item.price * item.quantity)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{t("pos.subtotal", "Subtotal")}</span>
                        <span className="font-bold text-primary">৳{Math.round(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{t("pos.delivery_fee", "Delivery Fee")}</span>
                        <span className="font-bold text-primary">৳{Math.round(deliveryFee)}</span>
                      </div>

                      {/* Total Section */}
                      <div className="relative mt-8 pt-8 border-t-2 border-primary/5">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                          <Package className="w-5 h-5 text-accent" />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] text-center mb-2">{t("pos.grand_total", "Grand Total")}</span>
                          <div className="flex items-center justify-center gap-2 py-4 bg-[hsl(40_18%_96%)] rounded-2xl border border-black/5 shadow-inner">
                            <span className="text-3xl font-serif font-bold text-accent">৳</span>
                            <span className="text-5xl font-serif font-bold text-primary tracking-tighter">
                              {Math.round(finalTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting}
                        className="group w-full relative overflow-hidden bg-primary text-white font-bold py-5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0 text-[14px] uppercase tracking-widest"
                      >
                        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                        <div className="relative z-10 flex items-center justify-center gap-3 group-hover:text-primary transition-colors duration-300">
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShieldCheck className="w-5 h-5" />
                          )}
                          {isSubmitting ? "Processing..." : paymentMethod === "cod" ? "Confirm Order" : `Pay ৳${Math.round(finalTotal)}`}
                        </div>
                      </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"><CreditCard className="w-3 h-3" /></div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center"><ShieldCheck className="w-3 h-3" /></div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t("pos.secure_checkout", "Secure Checkout")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
