import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Banknote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "cod">("cod");

  const [deliveryFee, setDeliveryFee] = useState(50);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.deliveryFee === 'number') {
            setDeliveryFee(data.deliveryFee);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const finalTotal = totalAmount + (cart.length > 0 ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
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
      items: cart.map(item => ({
        menuItemId: item.id.toString(),
        title: item.title,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: totalAmount,
      tax: 0,
      total: finalTotal,
      status: "pending"
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
      
      setOrderDetails({
        orderId: resData._id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cart,
        subtotal: totalAmount,
        deliveryFee: deliveryFee,
        total: finalTotal,
        customerInfo: orderData.customerInfo,
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bkash" ? "bKash" : "Nagad",
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
        <Navbar />
        
        {/* Atmospheric Warm Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full" 
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.08), transparent 70%)" }} 
          />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full" 
            style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.05), transparent 70%)" }} 
          />
        </div>

        <div className="flex-1 flex items-center justify-center pt-24 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-foreground/5 backdrop-blur-xl p-12 md:p-16 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/5 text-center max-w-2xl mx-4"
          >
            <div className="w-24 h-24 bg-[hsl(43_74%_48%)]/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-[hsl(43_74%_48%)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-6" style={{ letterSpacing: "-0.03em" }}>
              Order Confirmed!
            </h1>
            <p className="text-primary-foreground/60 text-lg mb-8 leading-relaxed font-medium">
              Thank you for your order. We've received it and are preparing it right away. You will receive a confirmation message shortly.
            </p>

            {/* Receipt Modal/View */}
            {orderDetails && (
              <div className="bg-white text-left p-6 md:p-8 rounded-3xl mt-4 mb-10 text-[hsl(195_30%_8%)] shadow-2xl mx-auto max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-accent opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}></div>
                <div className="text-center mb-6 border-b border-gray-200 pb-6 pt-2">
                  <h3 className="font-serif font-bold text-2xl text-primary mb-1">Cravings...</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">Order Receipt</p>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-bold">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-xs">{orderDetails.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-6">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium text-[13px]">{orderDetails.paymentMethod}</span>
                </div>

                <div className="border-t border-b border-dashed border-gray-300 py-4 mb-6 space-y-3">
                  {orderDetails.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex-1 pr-4">
                        <span className="font-bold block">{item.quantity}x {item.title}</span>
                      </div>
                      <span className="font-medium">৳{Math.round(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">৳{Math.round(orderDetails.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">৳{Math.round(orderDetails.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-base">Total</span>
                    <span className="font-bold text-lg text-accent">৳{Math.round(orderDetails.total)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-xs text-muted-foreground border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-1">Delivery Details:</span>
                  {orderDetails.customerInfo.name} <br/>
                  {orderDetails.customerInfo.phone} <br/>
                  {orderDetails.customerInfo.address}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/menu")}
              className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 px-10 rounded-2xl shadow-[0_12px_30px_rgba(228,168,32,0.3)] hover:shadow-[0_12px_40px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all text-[13px] uppercase tracking-wider"
            >
              Return to Menu
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="bg-primary pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-6"
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
      <section className="py-12 relative z-20 -mt-10">
        <div className="container mx-auto px-6 md:px-12">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-black/5">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Add some delicious items from our menu first.</p>
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
                className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/5"
              >
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">

                  {/* Shipping Details */}
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                      Delivery Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Full Name</label>
                        <input name="name" required type="text" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Phone Number</label>
                        <input name="phone" required type="tel" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" placeholder="017XXXXXXXX" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Full Address</label>
                        <textarea name="address" required rows={3} className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all resize-none" placeholder="House/Flat No, Road No, Area"></textarea>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Order Notes (Optional)</label>
                        <textarea name="notes" rows={2} className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all resize-none" placeholder="Any special instructions for the chef?"></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="pt-6 border-t border-black/5">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                      Payment Method
                    </h2>
                    <div className="space-y-4">
                      <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "bkash" ? "border-[hsl(43_74%_48%)] bg-[hsl(43_74%_48%)]/5" : "border-black/5 hover:border-black/10"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "bkash"} onChange={() => setPaymentMethod("bkash")} />
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "bkash" ? "border-[hsl(43_74%_48%)]" : "border-muted-foreground"}`}>
                            {paymentMethod === "bkash" && <div className="w-3 h-3 bg-[hsl(43_74%_48%)] rounded-full" />}
                          </div>
                          <CreditCard className="w-6 h-6 text-pink-600" />
                          <div>
                            <p className="font-bold text-primary">bKash</p>
                            <p className="text-sm text-muted-foreground">Pay securely via bKash</p>
                          </div>
                        </div>
                      </label>

                      <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "nagad" ? "border-[hsl(43_74%_48%)] bg-[hsl(43_74%_48%)]/5" : "border-black/5 hover:border-black/10"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "nagad"} onChange={() => setPaymentMethod("nagad")} />
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "nagad" ? "border-[hsl(43_74%_48%)]" : "border-muted-foreground"}`}>
                            {paymentMethod === "nagad" && <div className="w-3 h-3 bg-[hsl(43_74%_48%)] rounded-full" />}
                          </div>
                          <CreditCard className="w-6 h-6 text-orange-500" />
                          <div>
                            <p className="font-bold text-primary">Nagad</p>
                            <p className="text-sm text-muted-foreground">Pay securely via Nagad</p>
                          </div>
                        </div>
                      </label>

                      <label className={`block relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[hsl(43_74%_48%)] bg-[hsl(43_74%_48%)]/5" : "border-black/5 hover:border-black/10"}`}>
                        <input type="radio" name="payment" className="hidden" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-[hsl(43_74%_48%)]" : "border-muted-foreground"}`}>
                            {paymentMethod === "cod" && <div className="w-3 h-3 bg-[hsl(43_74%_48%)] rounded-full" />}
                          </div>
                          <Banknote className="w-6 h-6 text-emerald-600" />
                          <div>
                            <p className="font-bold text-primary">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Pay with cash when your food arrives</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                </form>
              </motion.div>

              {/* Order Summary Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-5 sticky top-32"
              >
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/5">
                  <h3 className="text-xl font-serif font-bold text-primary mb-6 pb-4 border-b border-black/5">
                    Order Summary
                  </h3>

                  {/* Items list */}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative">
                          <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                          <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-primary text-sm leading-tight">{item.title}</h4>
                          <span className="text-muted-foreground text-xs mt-1">৳{Math.round(item.price)} each</span>
                        </div>
                        <div className="font-bold text-primary self-center text-lg">
                          ৳{Math.round(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pt-6 mt-4">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-primary text-base">৳{Math.round(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground pb-6 border-b border-black/5">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-primary text-base">৳{Math.round(deliveryFee)}</span>
                    </div>

                    <div className="flex justify-between items-end pt-4 mb-10">
                      <span className="text-[14px] font-bold text-primary uppercase tracking-widest pb-1">Total</span>
                      <div className="flex items-start">
                        <span className="text-4xl font-serif font-bold leading-none text-accent">
                          ৳
                        </span>
                        <span className="text-4xl font-serif font-bold leading-none align-bottom text-primary ml-1 text-accent">
                          {Math.round(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-5 rounded-xl shadow-[0_8px_20px_rgba(228,168,32,0.3)] hover:shadow-[0_8px_25px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 text-[14px] uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                    {isSubmitting ? "Processing..." : paymentMethod === "cod" ? "Order Confirm" : `PAY NOW ৳${Math.round(finalTotal)}`}
                  </button>

                  <p className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Secure encrypted checkout
                  </p>
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
