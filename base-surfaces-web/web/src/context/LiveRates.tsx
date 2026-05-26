import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { usdBaseRates as fallbackRates } from '@shared/data/currency-rates';

type Rates = Record<string, number>;

const LiveRatesContext = createContext<Rates>(fallbackRates);

const CURRENCY_CODES = Object.keys(fallbackRates).filter((c) => c !== 'USD');

async function fetchLiveRates(): Promise<Rates> {
  const results = await Promise.allSettled(
    CURRENCY_CODES.map(async (code) => {
      const res = await fetch(`/api/wise-rates?source=USD&target=${code}`);
      if (!res.ok) throw new Error(`${code}: ${res.status}`);
      const data = await res.json();
      return { code, value: data.value as number };
    })
  );

  const rates: Rates = { USD: 1.0 };
  for (const result of results) {
    if (result.status === 'fulfilled') {
      rates[result.value.code] = result.value.value;
    }
  }
  return rates;
}

export function LiveRatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Rates>(fallbackRates);

  useEffect(() => {
    fetchLiveRates().then(setRates).catch(() => {});
  }, []);

  return (
    <LiveRatesContext.Provider value={rates}>
      {children}
    </LiveRatesContext.Provider>
  );
}

export function useLiveRates(): Rates {
  return useContext(LiveRatesContext);
}
