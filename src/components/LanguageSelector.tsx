import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = i18n.language.split('-')[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label={t('settings.language.select')}
      >
        <Languages className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage === 'pt' ? 'PT' : 'EN'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
              currentLanguage === 'en' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
            }`}
          >
            <span>{t('settings.language.en')}</span>
            {currentLanguage === 'en' && <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => changeLanguage('pt')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between ${
              currentLanguage === 'pt' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
            }`}
          >
            <span>{t('settings.language.pt')}</span>
            {currentLanguage === 'pt' && <Check className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}