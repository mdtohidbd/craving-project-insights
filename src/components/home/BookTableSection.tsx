import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  User, 
  Phone, 
  CheckCircle2,
  UtensilsCrossed
} from "lucide-react";
import { toast } from "sonner";

const BookTableSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const date = formData.get("date");
    const time = formData.get("time");
    const guests = formData.get("guests");
    const name = formData.get("name");
    const phone = formData.get("phone");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          guests,
          name,
          phone,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to book table");
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Table reserved successfully!");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error("Failed to make a reservation. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10"
          >
            <div className="w-20 h-20 bg-[hsl(43_74%_48%)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[hsl(43_74%_48%)]" />
            </div>
            <h2 className="text-4xl font-serif font-bold text-primary-foreground mb-4">Table Reserved!</h2>
            <p className="text-primary-foreground/70 mb-8">We look forward to hosting you soon.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-[hsl(43_74%_48%)] font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Make another reservation
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-primary" id="book-table">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.15), transparent 70%)" }}
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.1), transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(43_74%_48%)]/30 bg-[hsl(43_74%_48%)]/10 text-[hsl(43_74%_48%)] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Reservations</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary-foreground mb-6 leading-[1.1]">
              Book Your <br />
              <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Perfect Table</span>
            </h2>
            <p className="text-primary-foreground/60 text-lg mb-8 max-w-md leading-relaxed">
              Experience culinary excellence in an atmosphere of luxury. Reserve your spot for an unforgettable dining journey.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Phone className="w-5 h-5 text-[hsl(43_74%_48%)]" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/40 uppercase tracking-widest font-bold mb-0.5">Call Us</p>
                  <p className="text-primary-foreground font-medium">+880 123 456 7890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock className="w-5 h-5 text-[hsl(43_74%_48%)]" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/40 uppercase tracking-widest font-bold mb-0.5">Hours</p>
                  <p className="text-primary-foreground font-medium">Mon - Sun: 10:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40 ml-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                    <input required name="name" type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-primary-foreground focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40 ml-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                    <input required name="phone" type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-primary-foreground focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40 ml-2">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                    <input required name="date" type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-primary-foreground focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all outline-none [color-scheme:dark]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40 ml-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                    <input required name="time" type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-primary-foreground focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all outline-none [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40 ml-2">Guests</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                  <select required name="guests" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-primary-foreground focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all outline-none appearance-none">
                    <option value="2">2 People</option>
                    <option value="4">4 People</option>
                    <option value="6">6 People</option>
                    <option value="8">8+ People</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 text-[12px] uppercase tracking-[0.2em] mt-4"
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BookTableSection;
