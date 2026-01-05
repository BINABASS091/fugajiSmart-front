import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

export type Currency = 'USD' | 'TZS';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate to USD (base currency)
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    exchangeRate: 0.00041, // 1 TZS = 0.00041 USD (approximate rate)
  },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number, targetCurrency?: Currency) => string;
  convertCurrency: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getCurrencySymbol: (currency?: Currency) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from user profile on mount
  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        // First try localStorage for immediate response
        const savedCurrency = localStorage.getItem('fugaji_currency') as Currency;
        if (savedCurrency && CURRENCIES[savedCurrency]) {
          setCurrencyState(savedCurrency);
        }

        // Then load from backend to sync with user preference
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.data && userResponse.data.preferred_currency) {
          const userCurrency = userResponse.data.preferred_currency as Currency;
          if (CURRENCIES[userCurrency]) {
            setCurrencyState(userCurrency);
            localStorage.setItem('fugaji_currency', userCurrency);
          }
        }
      } catch (error) {
        console.error('Failed to load user currency preference:', error);
        // Fallback to localStorage or default
        const savedCurrency = localStorage.getItem('fugaji_currency') as Currency;
        if (savedCurrency && CURRENCIES[savedCurrency]) {
          setCurrencyState(savedCurrency);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserCurrency();
  }, []);

  // Update currency both locally and on backend
  const setCurrency = async (newCurrency: Currency) => {
    // Update local state immediately for responsive UI
    setCurrencyState(newCurrency);
    localStorage.setItem('fugaji_currency', newCurrency);

    // Try to update backend preference
    try {
      await authApi.updateCurrency(newCurrency);
    } catch (error) {
      console.error('Failed to update currency preference on backend:', error);
      // Continue with local preference even if backend update fails
    }
  };

  // Convert amount from one currency to another
  const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first (base currency)
    const amountInUSD = amount * CURRENCIES[fromCurrency].exchangeRate;
    
    // Convert from USD to target currency
    return amountInUSD / CURRENCIES[toCurrency].exchangeRate;
  };

  // Format currency with appropriate symbol and formatting
  const formatCurrency = (amount: number, targetCurrency?: Currency): string => {
    const currencyToUse = targetCurrency || currency;
    const config = CURRENCIES[currencyToUse];
    
    // Convert amount to target currency (assuming input is in USD)
    const convertedAmount = convertCurrency(amount, 'USD', currencyToUse);
    
    // Format based on currency
    if (currencyToUse === 'TZS') {
      // TZS typically doesn't show decimal places
      return `${config.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else {
      // USD shows 2 decimal places
      return `${config.symbol}${convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (targetCurrency?: Currency): string => {
    return CURRENCIES[targetCurrency || currency].symbol;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatCurrency,
    convertCurrency,
    getCurrencySymbol,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Utility function for formatting currency outside of React components
export const formatCurrencyStatic = (
  amount: number, 
  currency: Currency = 'USD',
  exchangeRates?: Record<Currency, number>
): string => {
  const config = CURRENCIES[currency];
  const rate = exchangeRates?.[currency] || config.exchangeRate;
  
  // Convert amount to target currency (assuming input is in USD)
  const convertedAmount = amount * rate;
  
  if (currency === 'TZS') {
    return `${config.symbol}${Math.round(convertedAmount).toLocaleString()}`;
  } else {
    return `${config.symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
};
