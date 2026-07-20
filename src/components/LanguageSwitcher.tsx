import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const LanguageSwitcher = ({ isMobileNav = false }: { isMobileNav?: boolean }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isMobileNav ? (
          <button className="flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/5 active:scale-95 outline-none border-none bg-transparent">
            <Globe className="w-[22px] h-[22px] mb-1" />
            <span className="text-[10px] font-bold tracking-wide uppercase">{i18n.language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>
        ) : (
          <button className="group relative flex items-center gap-2 px-1.5 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-primary text-neutral-600 group-hover:text-primary-foreground transition-colors duration-300">
              <Globe className="w-4 h-4" />
            </div>
            <span className="relative text-xs font-bold text-neutral-700 group-hover:text-primary tracking-wider uppercase pr-2 transition-colors duration-300">
              {i18n.language === 'en' ? 'Eng' : 'বাংলা'}
            </span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'bg-accent' : ''}>
          {t('common.english', 'English')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('bn')} className={i18n.language === 'bn' ? 'bg-accent' : ''}>
          {t('common.bengali', 'বাংলা')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
