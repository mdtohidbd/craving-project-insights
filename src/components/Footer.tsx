import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Menu", path: "/menu" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
  { name: "Track Order", path: "/track-order" },
];

const Footer = () => {
  const { settings } = useSettings();
  const domain = settings.websiteName.toLowerCase().replace(/\s+/g, '') + ".com";
  return (
    <footer className="relative overflow-hidden">


      {/* Footer Content */}
      <div className="bg-primary pt-8 pb-28 md:pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-6 md:gap-12 mb-8 border-b pb-8"
            style={{ borderColor: "hsl(40 20% 96% / 0.08)" }}>
            {/* Brand */}
            <div className="col-span-2 md:col-span-5 pr-0 md:pr-12 text-center md:text-left flex flex-col items-center md:items-start">
              <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
                <Flame className="w-6 h-6 transition-transform duration-500 group-hover:rotate-12 shrink-0"
                  style={{ color: "hsl(43 74% 48%)" }} />
                <span className="text-2xl font-serif font-bold text-primary-foreground tracking-tight">
                  {settings.websiteName}
                </span>
              </Link>
              <p className="text-[13px] leading-[1.7] max-w-sm"
                style={{ color: "hsl(40 20% 96% / 0.5)" }}>
                Experience the art of fine dining. Every dish crafted with passion,
                every moment designed to be truly unforgettable.
              </p>
            </div>

            {/* Navigation */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Navigate
              </h4>
              <ul className="space-y-3">
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
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Find Us
              </h4>
              <ul className="space-y-3 text-[13px] leading-relaxed"
                style={{ color: "hsl(40 20% 96% / 0.6)" }}>
                <li>2464 Royal Ln<br />Mesa, New Jersey</li>
                <li>(629) 555-0129</li>
                <li className="pt-1 hover:text-white transition-colors cursor-pointer break-all">
                  hello@{domain}
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div className="col-span-2 md:col-span-3 text-center md:text-left mt-2 md:mt-0 pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5"
                style={{ color: "hsl(43 74% 48% / 0.8)" }}>
                Hours
              </h4>
              <ul className="space-y-4 text-[13px]">
                <li>
                  <span className="block mb-1 font-medium text-white">Monday — Friday</span>
                  <span style={{ color: "hsl(40 20% 96% / 0.6)" }}>11:00 AM — 11:00 PM</span>
                </li>
                <li>
                  <span className="block mb-1 font-medium text-white">Saturday — Sunday</span>
                  <span style={{ color: "hsl(40 20% 96% / 0.6)" }}>10:00 AM — 12:00 AM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center">
            <p className="text-[12px] md:text-[13px] tracking-wide w-full md:w-auto order-2 md:order-1"
              style={{ color: "hsl(40 20% 96% / 0.4)" }}>
              © {new Date().getFullYear()} {settings.websiteName}. All Rights Reserved.
            </p>
            <div className="flex items-center justify-center gap-8 w-full md:w-auto order-1 md:order-2">
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
