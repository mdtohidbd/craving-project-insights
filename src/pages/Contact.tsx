import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you shortly.",
    });
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputStyles =
    "w-full px-6 py-5 rounded-2xl border bg-background text-foreground text-[16px] focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all duration-300 placeholder:text-muted-foreground/60 shadow-sm border-border";

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary pt-40 pb-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" 
               style={{ background: "radial-gradient(circle, hsl(38 50% 40% / 0.04), transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
            style={{ color: "hsl(43 74% 48% / 0.8)" }}
          >
            ✦ Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold leading-[0.9] mb-8"
            style={{ color: "hsl(40 20% 96%)", letterSpacing: "-0.04em" }}
          >
            Let's <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Connect</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto text-[18px] leading-[1.8]"
            style={{ color: "hsl(40 20% 96% / 0.5)" }}
          >
            We'd love to hear from you — whether it's a reservation for tonight, important feedback,
            or just to say hello to our incredible staff.
          </motion.p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="-mt-20 relative z-20 pb-32" style={{ background: "hsl(40 18% 96%)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto bg-card rounded-[2.5rem] p-10 md:p-16 shadow-2xl"
            style={{ border: "1px solid hsl(38 12% 88%)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold mb-4"
                         style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your elegant name"
                    required
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold mb-4"
                         style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                    className={inputStyles}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold mb-4"
                         style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@domain.com"
                    required
                    className={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-bold mb-4"
                         style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`${inputStyles} cursor-pointer appearance-none`}
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a1a1aa\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1.5rem center",
                      backgroundSize: "1.2rem",
                    }}
                  >
                    <option value="" disabled hidden>Choose a topic</option>
                    <option value="reservation">Table Reservation</option>
                    <option value="catering">Catering Services</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] font-bold mb-4"
                       style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  required
                  className={`${inputStyles} resize-none`}
                />
              </div>

              <button
                type="submit"
                className="btn-gold inline-flex items-center gap-4 group px-12 py-5 w-full md:w-auto"
              >
                Send Message
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Get in Touch & Info */}
      <section className="section-divide relative overflow-hidden" style={{ background: "hsl(38 15% 92% / 0.3)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" 
             style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.04), transparent 70%)" }} />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-6 block"
                    style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                ✦ Contact Information
              </span>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-primary mb-12 leading-[0.9]"
                  style={{ letterSpacing: "-0.04em" }}>
                Visit Us
                <br />
                <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Today</span>
              </h2>

              <div className="space-y-10">
                {[
                  {
                    icon: MapPin,
                    label: "Location",
                    value: "2464 Royal Ln, Mesa, New Jersey",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "(629) 555-0129",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "hello@craving.com",
                  },
                ].map((contact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-6 group cursor-pointer"
                  >
                    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-sm"
                         style={{ background: "hsl(40 18% 96%)", borderRadius: "1.5rem", border: "1px solid hsl(38 12% 88%)" }}>
                      <contact.icon className="w-6 h-6" style={{ color: "hsl(43 74% 48%)" }} />
                    </div>
                    <div className="pt-1.5">
                      <div className="text-[11px] uppercase tracking-[0.2em] font-medium mb-1.5"
                           style={{ color: "hsl(195 30% 12% / 0.6)" }}>
                        {contact.label}
                      </div>
                      <div className="font-serif font-bold text-primary text-[22px] group-hover:text-accent transition-colors duration-300">
                        {contact.value}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="overflow-hidden max-w-lg mx-auto shadow-2xl" style={{ borderRadius: "3rem" }}>
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"
                  alt="Restaurant interior"
                  className="w-full h-full object-cover transition-transform [transition-duration:2s] hover:scale-105"
                  style={{ minHeight: "750px" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
