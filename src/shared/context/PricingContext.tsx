import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface PricingState {
  isAnnual: boolean;
  currency: string;
  setIsAnnual: (value: boolean) => void;
  setCurrency: (value: string) => void;
  toggleAnnual: () => void;
}

const PricingContext = createContext<PricingState | null>(null);

export const PricingProvider = ({ children }: { children: ReactNode }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const toggleAnnual = useCallback(() => {
    setIsAnnual((prev) => !prev);
  }, []);

  return (
    <PricingContext.Provider value={{ isAnnual, currency, setIsAnnual, setCurrency, toggleAnnual }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricingState = (): PricingState => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricingState must be used within a PricingProvider');
  }
  return context;
};

export default PricingContext;