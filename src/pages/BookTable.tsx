import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle2,
  UtensilsCrossed
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const BookTable = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const date = formData.get("date");
    const time = formData.get("time");
    const guests = formData.get("guests");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const requests = formData.get("requests");

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
          requests
        })
      });

      if (!response.ok) {
        throw new Error("Failed to book table");
      }

      const resData = await response.json();

      setReservationDetails({
        date,
        time,
        guests,
        name,
        bookingId: resData.bookingId || `RES-${Math.floor(100000 + Math.random() * 900000)}`
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error("Failed to make a reservation. Please try again.");
    }
  };

  if (isSuccess && reservationDetails) {
    return (
      <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
        <Navbar />
        
        {/* Atmospheric Warm Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] rounded-full" 
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.08), transparent 70%)" }} 
          />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full" 
            style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.05), transparent 70%)" }} 
          />
        </div>

        <div className="flex-1 flex items-center justify-center pt-24 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-foreground/5 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border border-white/5 text-center max-w-lg mx-4 w-full"
          >
            <div className="w-20 h-20 bg-[hsl(43_74%_48%)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[hsl(43_74%_48%)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4" style={{ letterSpacing: "-0.02em" }}>
              Table Reserved!
            </h1>
            <p className="text-primary-foreground/70 text-base mb-8 leading-relaxed font-medium">
              We look forward to hosting you, {reservationDetails.name}.
            </p>

            <div className="bg-white/5 rounded-3xl p-6 text-left border border-white/10 mb-8 space-y-4">
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-10 h-10 rounded-full bg-[hsl(43_74%_48%)]/10 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-[hsl(43_74%_48%)]" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-bold">Date</p>
                  <p className="font-medium">{reservationDetails.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-10 h-10 rounded-full bg-[hsl(43_74%_48%)]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[hsl(43_74%_48%)]" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-bold">Time</p>
                  <p className="font-medium">{reservationDetails.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-primary-foreground/90">
                <div className="w-10 h-10 rounded-full bg-[hsl(43_74%_48%)]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[hsl(43_74%_48%)]" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider font-bold">Guests</p>
                  <p className="font-medium">{reservationDetails.guests} People</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-2 flex justify-between items-center text-primary-foreground/70 text-sm">
                <span>Booking ID</span>
                <span className="font-bold text-[hsl(43_74%_48%)]">{reservationDetails.bookingId}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-4 px-10 rounded-2xl shadow-[0_10px_25px_rgba(228,168,32,0.3)] hover:shadow-[0_12px_35px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all text-[13px] uppercase tracking-wider w-full"
            >
              Back to Home
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(40_18%_96%)] flex flex-col font-sans">
      <Navbar />

      {/* Header Section */}
      <section className="bg-primary pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.06), transparent 70%)" }} />
           <div className="absolute bottom-[0%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.04), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center max-w-4xl">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(43_74%_48%)]/30 bg-[hsl(43_74%_48%)]/10 text-[hsl(43_74%_48%)] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Reservations</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-6 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Book a Table
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Reserve your spot for an unforgettable dining experience. Whether it's a romantic dinner, a family gathering, or a business lunch, we are ready to serve you.
          </motion.p>
        </div>
      </section>

      {/* Booking Form Layout */}
      <section className="py-16 md:py-24 relative z-20 -mt-16">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-start">

            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-8 bg-white p-8 md:p-12 pl-8 md:pl-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-black/5"
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Section 1: Reservation Details */}
                <div>
                  <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                    When & How Many?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Date</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <input required name="date" type="date" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Time</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <input required name="time" type="time" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" />
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Number of Guests</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <select required name="guests" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all appearance-none cursor-pointer">
                            <option value="">Select Guests</option>
                            <option value="1">1 Person</option>
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4 People</option>
                            <option value="5">5 People</option>
                            <option value="6">6 People</option>
                            <option value="7">7+ People</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Details */}
                <div className="pt-6 border-t border-black/5">
                  <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                    Your Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Full Name</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <input required name="name" type="text" placeholder="John Doe" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Phone Number</label>
                       <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <input required name="phone" type="tel" placeholder="+880 1XXXXXXXXX" className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all" />
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground ml-2">Special Requests (Optional)</label>
                       <div className="relative">
                         <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                         </div>
                         <textarea name="requests" rows={3} placeholder="Dietary requirements, special occasions, etc." className="w-full bg-[hsl(40_18%_96%)] border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-[hsl(43_74%_48%)] transition-all resize-none"></textarea>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[hsl(43_74%_48%)] text-[hsl(195_30%_8%)] font-bold py-5 rounded-xl shadow-[0_8px_20px_rgba(228,168,32,0.3)] hover:shadow-[0_12px_25px_rgba(228,168,32,0.4)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm Reservation
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Sidebar Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-4 space-y-8"
            >
              {/* Info Card */}
              <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[hsl(43_74%_48%)]/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <h4 className="text-xl font-serif font-bold mb-6">Working Hours</h4>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                    <span className="text-white/60">Mon - Thu</span>
                    <span className="font-semibold">10:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                    <span className="text-white/60">Fri - Sat</span>
                    <span className="font-semibold text-[hsl(43_74%_48%)]">10:00 AM - 11:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                    <span className="text-white/60">Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>

                <h4 className="text-xl font-serif font-bold mb-6 mt-8">Contact Us</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[hsl(43_74%_48%)]" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-widest">Phone</p>
                      <p className="font-medium">+880 123 456 7890</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Image/Pattern */}
              <div className="rounded-[2rem] overflow-hidden aspect-[4/3] bg-[hsl(40_18%_90%)] relative hidden lg:block">
                 <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2670&auto=format&fit=crop" alt="Restaurant interior" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                    <p className="text-primary-foreground font-serif text-lg font-medium leading-tight">Authentic flavors, <br/><span className="text-[hsl(43_74%_48%)] italic">Luxurious ambiance.</span></p>
                 </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookTable;
