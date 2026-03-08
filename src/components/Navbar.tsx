import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Flame } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Menu", path: "/menu" },
  { name: "Blog", path: "/blog" },
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
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Flame className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" style={{ color: "hsl(43 74% 48%)" }} />
                <div className="absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: "hsl(43 74% 48% / 0.4)" }} />
              </div>
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

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                to="/contact"
                className="btn-outline-gold inline-flex items-center px-8 py-3 text-[12px] uppercase tracking-[0.2em] transition-all duration-500"
              >
                Reserve
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-primary-foreground p-2 transition-colors duration-300 hover:opacity-80 appearance-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
            className="md:hidden fixed top-24 left-0 right-0 bg-primary/98 backdrop-blur-xl border-t border-white/5"
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
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="btn-gold block shadow-xl"
                >
                  Reserve a Table
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
