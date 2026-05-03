import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const Cart = ({ className }: { className?: string }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const navigate = useNavigate();

  // Bounce the cart icon whenever items are added
  useEffect(() => {
    if (totalItems > 0) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 600);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className={`relative p-2 flex items-center justify-center ${className || ""}`} aria-label="Cart">
          <motion.div
            animate={bouncing ? { scale: [1, 1.4, 0.85, 1.15, 1], rotate: [0, -12, 12, -6, 0] } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ShoppingCart className="w-6 h-6" />
          </motion.div>
          {totalItems > 0 && (
            <motion.span
              key={totalItems}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className="absolute -top-0 -right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(43_74%_48%)] text-[10px] font-bold text-[hsl(195_30%_8%)] shadow-md"
            >
              {totalItems}
            </motion.span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-[100%] sm:max-w-md bg-[hsl(40_18%_96%)] flex flex-col h-[100dvh] border-l-[hsl(43_74%_48%)]/20 shadow-2xl p-4 md:p-6 overflow-hidden">
        <SheetHeader className="pb-4 border-b border-black/10 shrink-0">
          <SheetTitle className="text-2xl md:text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 text-[hsl(43_74%_48%)]" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-2 custom-scrollbar touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
              <ShoppingCart className="w-16 h-16 text-primary mb-2 opacity-20" />
              <p className="text-2xl font-serif font-bold text-primary">Your cart is empty</p>
              <p className="text-sm text-primary max-w-[200px]">Looks like you haven't made your choice yet.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary truncate text-lg">{item.title}</h4>
                  {item.addOns && item.addOns.length > 0 && (
                    <div className="text-xs text-neutral-500 mt-0.5 mb-1 truncate">
                      + {item.addOns.map(a => a.name).join(', ')}
                    </div>
                  )}
                  <p className="text-xl font-bold mt-1 text-accent">{item.priceStr?.replace('$', '৳')}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 bg-[hsl(40_18%_96%)] rounded-full px-2 py-1 shadow-inner border border-black/5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-black/5 active:scale-95 transition-all text-primary"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[hsl(43_74%_48%)] shadow-sm hover:brightness-110 active:scale-95 transition-all text-[hsl(195_30%_8%)]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <SheetFooter className="mt-auto border-t border-black/10 pt-6 flex-col">
          <div className="flex justify-between items-center w-full mb-6">
            <span className="text-lg font-medium text-primary/80">Total</span>
            <span className="font-bold text-3xl text-primary font-serif">৳{Math.round(totalAmount)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-br from-[hsl(43_74%_52%)] to-[hsl(38_80%_42%)] text-[hsl(195_30%_8%)] font-bold py-4 rounded-xl shadow-[0_8px_25px_hsl(43_74%_48%/0.3)] hover:shadow-[0_12px_35px_hsl(43_74%_48%/0.4)] hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-lg uppercase tracking-widest"
          >
            Checkout Securely
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
