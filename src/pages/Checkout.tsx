import { useState } from "react";
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
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "cod">("cod");

  const deliveryFee = 50;
  const finalTotal = totalAmount + (cart.length > 0 ? deliveryFee : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate order processing API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-black/5 text-center max-w-2xl mx-4"
          >
            <div className="w-24 h-24 bg-[hsl(43_74%_48%)]/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-12 h-12 text-[hsl(43_74%_48%)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6" style={{ letterSpacing: "-0.03em" }}>
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Thank you for your order. We've received it and are preparing it right away. You will receive a confirmation message shortly.
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 px-10 rounded-2xl shadow-[0_8px_20px_rgba(228,168,32,0.3)] hover:shadow-[0_8px_25px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all text-[13px] uppercase tracking-wider"
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
      <section className="bg-primary pt-40 pb-20 relative overflow-hidden">
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
      <section className="py-20 relative z-20 -mt-10">
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
                        <input required type="text" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Phone Number</label>
                        <input required type="tel" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" placeholder="017XXXXXXXX" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Full Address</label>
                        <textarea required rows={3} className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all resize-none" placeholder="House/Flat No, Road No, Area"></textarea>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Order Notes (Optional)</label>
                        <textarea rows={2} className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all resize-none" placeholder="Any special instructions for the chef?"></textarea>
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
                          <span className="text-muted-foreground text-xs mt-1">৳{item.price.toFixed(2)} each</span>
                        </div>
                        <div className="font-bold text-primary self-center">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 pt-6 mt-4">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-primary text-base">৳{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground pb-6 border-b border-black/5">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-primary text-base">৳{deliveryFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-end pt-4 mb-10">
                      <span className="text-[14px] font-bold text-primary uppercase tracking-widest pb-1">Total</span>
                      <div className="flex items-start">
                        <span className="text-4xl font-serif font-bold leading-none" style={{ color: "hsl(43 74% 48%)" }}>
                          ৳
                        </span>
                        <span className="text-3xl font-serif font-bold leading-none align-bottom text-primary ml-1" style={{ color: "hsl(43 74% 48%)" }}>
                          {finalTotal.toFixed(2)}
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
                    {isSubmitting ? "Processing..." : `PAY ৳${finalTotal.toFixed(2)}`}
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
