import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const LanguageSwitcher = ({ isMobileNav = false }: { isMobileNav?: boolean }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const isBn = currentLang.startsWith('bn');

  const toggleLanguage = () => {
    const nextLang = isBn ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
  };

  const setLanguage = (lang: string) => {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  if (isMobileNav) {
    return (
      <div className="w-full px-2 py-1">
        <div 
          onClick={toggleLanguage}
          className="relative flex items-center justify-between w-full p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 cursor-pointer select-none overflow-hidden"
        >
          {/* Animated Background Pill for Mobile */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-xl bg-primary shadow-md"
            initial={false}
            animate={{
              left: isBn ? '50%' : '4px',
              right: isBn ? '4px' : '50%',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />

          {/* Option EN */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLanguage('en');
            }}
            className={`relative z-10 flex items-center justify-center gap-1.5 w-1/2 py-2 text-xs font-bold transition-colors duration-200 ${
              !isBn ? 'text-primary-foreground' : 'text-primary-foreground/70 hover:text-primary-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>ENGLISH</span>
          </button>

          {/* Option BN */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLanguage('bn');
            }}
            className={`relative z-10 flex items-center justify-center gap-1.5 w-1/2 py-2 text-xs font-bold transition-colors duration-200 ${
              isBn ? 'text-primary-foreground' : 'text-primary-foreground/70 hover:text-primary-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>বাংলা</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="relative flex items-center gap-1.5 p-1 rounded-full bg-white border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer select-none"
      role="button"
      tabIndex={0}
      aria-label="Toggle language"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleLanguage();
        }
      }}
    >
      {/* Animated Globe Icon Container */}
      <motion.div
        className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shadow-inner"
        animate={{ rotate: isBn ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Globe className="w-4 h-4" />
      </motion.div>

      {/* Segmented Pill Switch */}
      <div className="relative flex items-center bg-neutral-100/90 rounded-full p-0.5 border border-neutral-200/60">
        {/* Animated Sliding Highlight */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-white shadow-sm border border-neutral-200/80"
          initial={false}
          animate={{
            left: isBn ? '50%' : '2px',
            right: isBn ? '2px' : '50%',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />

        {/* EN Button */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setLanguage('en');
          }}
          className={`relative z-10 px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase transition-colors duration-200 ${
            !isBn ? 'text-primary' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          ENG
        </span>

        {/* BN Button */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            setLanguage('bn');
          }}
          className={`relative z-10 px-2.5 py-0.5 text-[11px] font-black tracking-wider transition-colors duration-200 ${
            isBn ? 'text-primary' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          বাংলা
        </span>
      </div>
    </motion.div>
  );
};

