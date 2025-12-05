import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Language, LANGUAGE_CONFIG } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelect }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[140px] justify-between"
      >
        <div className="flex items-center space-x-2">
           <span>{LANGUAGE_CONFIG[selectedLanguage].icon}</span>
           <span>{LANGUAGE_CONFIG[selectedLanguage].name}</span>
        </div>
        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-[80vh] overflow-y-auto">
            {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => {
                  onSelect(key as Language);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-700 transition-colors group ${
                  selectedLanguage === key ? 'bg-indigo-900/20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg opacity-80 group-hover:opacity-100">{config.icon}</span>
                  <span className={`${selectedLanguage === key ? 'text-indigo-300 font-medium' : 'text-slate-300'}`}>
                    {config.name}
                  </span>
                </div>
                {selectedLanguage === key && <Check size={14} className="text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;