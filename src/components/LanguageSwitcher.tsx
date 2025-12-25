import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/90 border border-gray-200 rounded-lg shadow-sm p-1">
      <Globe className="w-4 h-4 text-gray-500 ml-2" />
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          language === 'en'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('sw')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          language === 'sw'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        SW
      </button>
    </div>
  );
}
