import { createContext, useContext, useState, type ReactNode } from 'react';

interface PrototypeNamesContextValue {
  consumerName: string;
  setConsumerName: (name: string) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  consumerHomeCurrency: string;
  setConsumerHomeCurrency: (code: string) => void;
  businessHomeCurrency: string;
  setBusinessHomeCurrency: (code: string) => void;
}

const PrototypeNamesContext = createContext<PrototypeNamesContextValue>({
  consumerName: 'Benhur Senabathi',
  setConsumerName: () => {},
  businessName: 'Benhur Design',
  setBusinessName: () => {},
  consumerHomeCurrency: 'GBP',
  setConsumerHomeCurrency: () => {},
  businessHomeCurrency: 'GBP',
  setBusinessHomeCurrency: () => {},
});

export function PrototypeNamesProvider({ children }: { children: ReactNode }) {
  const [consumerName, setConsumerName] = useState('Benhur Senabathi');
  const [businessName, setBusinessName] = useState('Benhur Design');
  const [consumerHomeCurrency, setConsumerHomeCurrency] = useState('GBP');
  const [businessHomeCurrency, setBusinessHomeCurrency] = useState('GBP');

  return (
    <PrototypeNamesContext.Provider value={{ consumerName, setConsumerName, businessName, setBusinessName, consumerHomeCurrency, setConsumerHomeCurrency, businessHomeCurrency, setBusinessHomeCurrency }}>
      {children}
    </PrototypeNamesContext.Provider>
  );
}

export function usePrototypeNames() {
  return useContext(PrototypeNamesContext);
}
