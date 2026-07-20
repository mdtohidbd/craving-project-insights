import { Link, useLocation } from "react-router-dom";
import { Home, Utensils, CalendarPlus, User, Phone, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Hide on admin routes, checkout, and pdf view
  if (
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/menu/pdf')
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-[99]">
      <div className="bg-primary/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/10 p-2 flex items-center justify-between">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${
            location.pathname === "/" ? "bg-[hsl(43_74%_48%)] text-black shadow-[0_4px_15px_rgba(228,168,32,0.3)] scale-105" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95"
          }`}
        >
          <Home className="w-[22px] h-[22px] mb-1" />
          <span className="text-[10px] font-bold tracking-wide">{t("nav.home")}</span>
        </Link>
        <Link
          to="/menu"
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${
            location.pathname === "/menu" || location.pathname.startsWith("/menu/") ? "bg-[hsl(43_74%_48%)] text-black shadow-[0_4px_15px_rgba(228,168,32,0.3)] scale-105" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95"
          }`}
        >
          <Utensils className="w-[22px] h-[22px] mb-1" />
          <span className="text-[10px] font-bold tracking-wide">{t("nav.menu")}</span>
        </Link>
        
        <Link
          to="/contact"
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${
            location.pathname === "/contact" ? "bg-[hsl(43_74%_48%)] text-black shadow-[0_4px_15px_rgba(228,168,32,0.3)] scale-105" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95"
          }`}
        >
          <Phone className="w-[22px] h-[22px] mb-1" />
          <span className="text-[10px] font-bold tracking-wide">{t("nav.contact", "Contact")}</span>
        </Link>

        <Link
          to="/book-table"
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${
            location.pathname === "/book-table" ? "bg-[hsl(43_74%_48%)] text-black shadow-[0_4px_15px_rgba(228,168,32,0.3)] scale-105" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95"
          }`}
        >
          <CalendarPlus className="w-[22px] h-[22px] mb-1" />
          <span className="text-[10px] font-bold tracking-wide">{t("nav.book_table")}</span>
        </Link>

        {/* Adding Language Switcher instead of standard link to keep it in UI easily accessible */}
        <div className="flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5">
          <LanguageSwitcher />
        </div>

        <Link
          to="/admin/login"
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${
            location.pathname.startsWith("/admin") ? "bg-[hsl(43_74%_48%)] text-black shadow-[0_4px_15px_rgba(228,168,32,0.3)] scale-105" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95"
          }`}
        >
          <User className="w-[22px] h-[22px] mb-1" />
          <span className="text-[10px] font-bold tracking-wide">{t("nav.admin")}</span>
        </Link>
      </div>
    </div>
  );
};
