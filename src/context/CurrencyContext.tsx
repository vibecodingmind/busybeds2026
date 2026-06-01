'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type CurrencyCode = 'USD' | 'TZS' | 'KES';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (usdAmount: number) => string;
  convert: (usdAmount: number) => number;
}

const rates: Record<CurrencyCode, number> = { USD: 1, TZS: 2750, KES: 155 };
const symbols: Record<CurrencyCode, string> = { USD: '$', TZS: 'TSh ', KES: 'KSh ' };

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('bb_currency') as CurrencyCode | null;
    if (saved && rates[saved]) setCurrencyState(saved);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('bb_currency', c);
  };

  const convert = (usdAmount: number) => {
    return Math.round(usdAmount * rates[currency]);
  };

  const formatPrice = (usdAmount: number) => {
    const amount = convert(usdAmount);
    return `${symbols[currency]}${amount.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}
