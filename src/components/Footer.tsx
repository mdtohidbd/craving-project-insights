import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Menu", path: "/menu" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      {/* CTA Section */}
      <div className="relative py-10 md:py-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary" />
        
        {/* Decorative Elements */}
        <div className="absolute top-1/2 right-[-15%] w-[600px] h-[600px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, hsl(43 60% 50% / 0.05), transparent 70%)" }} />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium mb-4 block"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
              ✦ Don't Wait Any Longer
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-primary-foreground mb-3 leading-[0.9]"
                style={{ letterSpacing: "-0.04em" }}>
              Your Table
              <br />
              <span className="italic" style={{ color: "hsl(43 74% 48%)" }}>Awaits</span>
            </h2>
            <p className="max-w-lg mx-auto mb-5 text-[15px] leading-[1.7]"
               style={{ color: "hsl(40 20% 96% / 0.6)" }}>
              From classic comfort food to exotic international flavors — every dish
              tells a story worth tasting. Let us serve you perfection.
            </p>
            <Link
              to="/menu"
              className="btn-gold inline-flex items-center gap-4 group px-10 py-4"
            >
              Order Now
              <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-primary pt-8 pb-5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-8 border-b pb-8"
               style={{ borderColor: "hsl(40 20% 96% / 0.08)" }}>
            {/* Brand */}
            <div className="md:col-span-5 pr-4">
              <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                <Flame className="w-6 h-6 transition-transform duration-500 group-hover:rotate-12"
                       style={{ color: "hsl(43 74% 48%)" }} />
                <span className="text-2xl font-serif font-bold text-primary-foreground tracking-tight">
                  Craving
                </span>
              </Link>
              <p className="text-[13px] leading-[1.7] max-w-sm"
                 style={{ color: "hsl(40 20% 96% / 0.5)" }}>
                Experience the art of fine dining. Every dish crafted with passion,
                every moment designed to be truly unforgettable.
              </p>
            </div>

            {/* Navigation */}
            <div className="md:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Navigate
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[13px] hover:text-white transition-colors duration-300"
                      style={{ color: "hsl(40 20% 96% / 0.6)" }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Find Us
              </h4>
              <ul className="space-y-2.5 text-[13px] leading-relaxed"
                  style={{ color: "hsl(40 20% 96% / 0.6)" }}>
                <li>2464 Royal Ln<br/>Mesa, New Jersey</li>
                <li>(629) 555-0129</li>
                <li className="pt-2 hover:text-white transition-colors cursor-pointer">
                  hello@craving.com
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div className="md:col-span-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                  style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Hours
              </h4>
              <ul className="space-y-3 text-[13px]">
                <li>
                  <span className="block mb-1 text-white">Monday — Friday</span>
                  <span style={{ color: "hsl(40 20% 96% / 0.6)" }}>11:00 AM — 11:00 PM</span>
                </li>
                <li>
                  <span className="block mb-1 text-white">Saturday — Sunday</span>
                  <span style={{ color: "hsl(40 20% 96% / 0.6)" }}>10:00 AM — 12:00 AM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[13px] tracking-wide"
               style={{ color: "hsl(40 20% 96% / 0.4)" }}>
              © {new Date().getFullYear()} Craving. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Instagram", "Twitter", "Facebook"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[11px] uppercase tracking-[0.2em] transition-colors duration-300"
                  style={{ color: "hsl(40 20% 96% / 0.4)" }}
                  onMouseOver={(e) => e.currentTarget.style.color = "hsl(43 74% 48%)"}
                  onMouseOut={(e) => e.currentTarget.style.color = "hsl(40 20% 96% / 0.4)"}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
