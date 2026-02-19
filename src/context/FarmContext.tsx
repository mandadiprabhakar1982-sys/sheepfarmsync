'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, SalesTransaction } from '@/lib/types';

interface FarmContextType {
  purchases: LivestockPurchase[];
  addPurchase: (purchase: Omit<LivestockPurchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  sales: SalesTransaction[];
  addSale: (sale: Omit<SalesTransaction, 'id'>) => void;
  deleteSale: (id: string) => void;
  flockSize: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<LivestockPurchase[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);

  const addPurchase = useCallback((purchase: Omit<LivestockPurchase, 'id'>) => {
    const newPurchase = { ...purchase, id: crypto.randomUUID() };
    setPurchases((prev) => [...prev, newPurchase]);
  }, []);
  
  const deletePurchase = useCallback((id: string) => {
    setPurchases(currentPurchases => currentPurchases.filter(p => p.id !== id));
  }, []);

  const addSale = useCallback((sale: Omit<SalesTransaction, 'id'>) => {
    const newSale = { ...sale, id: crypto.randomUUID() };
    setSales((prev) => [...prev, newSale]);
  }, []);
  
  const deleteSale = useCallback((id: string) => {
    setSales(currentSales => currentSales.filter(s => s.id !== id));
  }, []);

  const flockSize = useMemo(() => {
    const purchased = purchases.reduce((sum, p) => sum + p.animalCount, 0);
    const sold = sales.reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold;
  }, [purchases, sales]);

  const value = {
    purchases,
    addPurchase,
    deletePurchase,
    sales,
    addSale,
    deleteSale,
    flockSize,
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
