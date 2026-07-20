import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t("pos.toggle_language", "Toggle language")}</span>
        </Button>
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
