import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useCurrency, Currency, CURRENCIES } from '../contexts/CurrencyContext';
import { DollarSign, Coins } from 'lucide-react';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'card';
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '',
  variant = 'dropdown'
}) => {
  const { currency, setCurrency } = useCurrency();

  if (variant === 'toggle') {
    return (
      <div className={`flex bg-gray-100 rounded-xl p-1 ${className}`}>
        {Object.values(CURRENCIES).map((config) => (
          <Button
            key={config.code}
            onClick={() => setCurrency(config.code)}
            variant={currency === config.code ? 'default' : 'ghost'}
            className={`flex-1 h-10 rounded-lg font-medium transition-all ${
              currency === config.code 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{config.symbol}</span>
            {config.code}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {Object.values(CURRENCIES).map((config) => (
          <Card
            key={config.code}
            onClick={() => setCurrency(config.code)}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              currency === config.code
                ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currency === config.code ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                {config.code === 'USD' ? (
                  <DollarSign className="w-5 h-5" />
                ) : (
                  <Coins className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{config.name}</div>
                <div className="text-sm text-gray-500">{config.code}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
      >
        {Object.values(CURRENCIES).map((config) => (
          <option key={config.code} value={config.code}>
            {config.symbol} {config.code} - {config.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default CurrencySelector;
