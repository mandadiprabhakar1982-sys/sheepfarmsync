'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { LivestockPurchase, SalesTransaction, FeedCost, MedicineExpense, LaborCost, TrackedAnimal } from '@/lib/types';

interface FarmContextType {
  purchases: LivestockPurchase[];
  addPurchase: (purchase: Omit<LivestockPurchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  
  sales: SalesTransaction[];
  addSale: (sale: Omit<SalesTransaction, 'id'>) => void;
  deleteSale: (id: string) => void;
  
  feedCosts: FeedCost[];
  addFeedCost: (cost: Omit<FeedCost, 'id'>) => void;
  deleteFeedCost: (id: string) => void;

  medicineExpenses: MedicineExpense[];
  addMedicineExpense: (expense: Omit<MedicineExpense, 'id'>) => void;
  deleteMedicineExpense: (id: string) => void;

  laborCosts: LaborCost[];
  addLaborCost: (cost: Omit<LaborCost, 'id'>) => void;
  deleteLaborCost: (id: string) => void;

  trackedAnimals: TrackedAnimal[];
  addTrackedAnimal: (animal: Omit<TrackedAnimal, 'id'>) => void;
  deleteTrackedAnimal: (id: string) => void;

  flockSize: number;
  totalExpenses: number;
  totalSales: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const FARM_DATA_KEY = 'farm-sync-data';

export function FarmProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [purchases, setPurchases] = useState<LivestockPurchase[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [feedCosts, setFeedCosts] = useState<FeedCost[]>([]);
  const [medicineExpenses, setMedicineExpenses] = useState<MedicineExpense[]>([]);
  const [laborCosts, setLaborCosts] = useState<LaborCost[]>([]);
  const [trackedAnimals, setTrackedAnimals] = useState<TrackedAnimal[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(FARM_DATA_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        setPurchases(data.purchases || []);
        setSales(data.sales || []);
        setFeedCosts(data.feedCosts || []);
        setMedicineExpenses(data.medicineExpenses || []);
        setLaborCosts(data.laborCosts || []);
        setTrackedAnimals(data.trackedAnimals || []);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToStore = JSON.stringify({
        purchases,
        sales,
        feedCosts,
        medicineExpenses,
        laborCosts,
        trackedAnimals
      });
      localStorage.setItem(FARM_DATA_KEY, dataToStore);
    }
  }, [purchases, sales, feedCosts, medicineExpenses, laborCosts, trackedAnimals, isLoaded]);

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
  
  const addFeedCost = useCallback((cost: Omit<FeedCost, 'id'>) => {
    const newCost = { ...cost, id: crypto.randomUUID() };
    setFeedCosts(prev => [...prev, newCost]);
  }, []);

  const deleteFeedCost = useCallback((id: string) => {
    setFeedCosts(prev => prev.filter(c => c.id !== id));
  }, []);
  
  const addMedicineExpense = useCallback((expense: Omit<MedicineExpense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setMedicineExpenses(prev => [...prev, newExpense]);
  }, []);

  const deleteMedicineExpense = useCallback((id: string) => {
    setMedicineExpenses(prev => prev.filter(e => e.id !== id));
  }, []);
  
  const addLaborCost = useCallback((cost: Omit<LaborCost, 'id'>) => {
    const newCost = { ...cost, id: crypto.randomUUID() };
    setLaborCosts(prev => [...prev, newCost]);
  }, []);

  const deleteLaborCost = useCallback((id: string) => {
    setLaborCosts(prev => prev.filter(c => c.id !== id));
  }, []);
  
  const addTrackedAnimal = useCallback((animal: Omit<TrackedAnimal, 'id'>) => {
    const newAnimal = { ...animal, id: crypto.randomUUID() };
    setTrackedAnimals(prev => [...prev, newAnimal]);
  }, []);

  const deleteTrackedAnimal = useCallback((id: string) => {
    setTrackedAnimals(prev => prev.filter(a => a.id !== id));
  }, []);


  const flockSize = useMemo(() => {
    const purchased = purchases.reduce((sum, p) => sum + p.animalCount, 0);
    const sold = sales.reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold;
  }, [purchases, sales]);
  
  const totalExpenses = useMemo(() => {
    const purchaseExpense = purchases.reduce((sum, p) => sum + p.purchasePrice, 0);
    const feedExpense = feedCosts.reduce((sum, f) => sum + f.cost, 0);
    const medicineExpense = medicineExpenses.reduce((sum, m) => sum + m.totalAmountSpent, 0);
    const laborExpense = laborCosts.reduce((sum, l) => sum + l.totalLaborCosts, 0);
    return purchaseExpense + feedExpense + medicineExpense + laborExpense;
  }, [purchases, feedCosts, medicineExpenses, laborCosts]);

  const totalSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.totalAmountReceived, 0);
  }, [sales]);


  const value = {
    purchases,
    addPurchase,
    deletePurchase,
    sales,
    addSale,
    deleteSale,
    feedCosts,
    addFeedCost,
    deleteFeedCost,
    medicineExpenses,
    addMedicineExpense,
    deleteMedicineExpense,
    laborCosts,
    addLaborCost,
    deleteLaborCost,
    trackedAnimals,
    addTrackedAnimal,
    deleteTrackedAnimal,
    flockSize,
    totalExpenses,
    totalSales,
  };

  return (
    <FarmContext.Provider value={value}>
      {isLoaded ? children : null}
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
