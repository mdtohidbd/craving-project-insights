import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Cart } from "./Cart";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },

];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`transition-all duration-700 ${
          scrolled
            ? "bg-primary/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(30,50,45,0.2)]"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-3xl font-serif font-bold text-primary-foreground" style={{ letterSpacing: "-0.01em" }}>
                Craving
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group py-2"
                >
                  <span
                    className={`text-[12px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                      location.pathname === link.path
                        ? ""
                        : "text-primary-foreground/70 group-hover:text-primary-foreground"
                    }`}
                    style={location.pathname === link.path ? { color: "hsl(43 74% 48%)" } : {}}
                  >
                    {link.name}
                  </span>
                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] transition-all duration-500 ${
                      location.pathname === link.path
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                    style={{ background: "hsl(43 74% 48%)" }}
                  />
                </Link>
              ))}
            </div>

            {/* CTA Button and Cart */}
            <div className="hidden md:flex items-center gap-6">
              <Cart />
              <Link
                to="/menu"
                className="inline-flex items-center px-7 py-3 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full transition-all duration-500 hover:-translate-y-0.5"
                style={{
                  background: "hsl(43 74% 48%)",
                  color: "hsl(195 30% 8%)",
                  boxShadow: "0 8px 18px rgba(228, 168, 32, 0.25)"
                }}
              >
                Order Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <Cart />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-primary-foreground p-2 transition-colors duration-300 hover:opacity-80 appearance-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed top-20 left-0 right-0 bg-primary/98 backdrop-blur-xl border-t border-white/5"
          >
            <div className="container mx-auto px-6 py-12 flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 text-2xl font-serif tracking-tight transition-colors ${
                      location.pathname === link.path
                        ? ""
                        : "text-primary-foreground/70 active:text-primary-foreground"
                    }`}
                    style={location.pathname === link.path ? { color: "hsl(43 74% 48%)" } : {}}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Link
                  to="/menu"
                  onClick={() => setIsOpen(false)}
                  className="btn-gold block shadow-xl transition-all duration-300 transform hover:scale-105 px-12"
                  style={{
                    background: "hsl(43 74% 48%)",
                    color: "hsl(195 30% 8%)",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "12px 0"
                  }}
                >
                  Order Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
