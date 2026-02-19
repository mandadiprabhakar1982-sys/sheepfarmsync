'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, SalesTransaction, FeedCost, MedicineExpense, LaborCost, TrackedSheep } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  purchases: LivestockPurchase[] | null;
  addPurchase: (purchase: Omit<LivestockPurchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  
  sales: SalesTransaction[] | null;
  addSale: (sale: Omit<SalesTransaction, 'id'>) => void;
  deleteSale: (id: string) => void;
  
  feedCosts: FeedCost[] | null;
  addFeedCost: (cost: Omit<FeedCost, 'id'>) => void;
  deleteFeedCost: (id: string) => void;

  medicineExpenses: MedicineExpense[] | null;
  addMedicineExpense: (expense: Omit<MedicineExpense, 'id'>) => void;
  deleteMedicineExpense: (id: string) => void;

  laborCosts: LaborCost[] | null;
  addLaborCost: (cost: Omit<LaborCost, 'id'>) => void;
  deleteLaborCost: (id: string) => void;

  trackedSheep: TrackedSheep[] | null;
  addTrackedSheep: (sheep: Omit<TrackedSheep, 'id'>) => void;
  deleteTrackedSheep: (id: string) => void;
  
  isLoading: boolean;

  totalSheep: number;
  totalExpenses: number;
  totalSales: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const purchasesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'livestockPurchases') : null, [firestore, user]);
  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'animalSales') : null, [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<SalesTransaction>(salesRef);
  
  const feedCostsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'feedExpenses') : null, [firestore, user]);
  const { data: feedCosts, isLoading: isLoadingFeedCosts } = useCollection<FeedCost>(feedCostsRef);

  const medicineExpensesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'medicineExpenses') : null, [firestore, user]);
  const { data: medicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineExpensesRef);

  const laborCostsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'laborExpenses') : null, [firestore, user]);
  const { data: laborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborCostsRef);
  
  // Note: trackedSheep is not a collection in firestore.rules
  const [trackedSheep, setTrackedSheep] = useState<TrackedSheep[]>([]);

  const addPurchase = useCallback((purchase: Omit<LivestockPurchase, 'id'>) => {
    if (!purchasesRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(purchasesRef, newId);
    setDocumentNonBlocking(docRef, { ...purchase, id: newId }, {});
  }, [purchasesRef]);
  
  const deletePurchase = useCallback((id: string) => {
    if (!purchasesRef) return;
    deleteDocumentNonBlocking(doc(purchasesRef, id));
  }, [purchasesRef]);

  const addSale = useCallback((sale: Omit<SalesTransaction, 'id'>) => {
    if (!salesRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(salesRef, newId);
    setDocumentNonBlocking(docRef, { ...sale, id: newId }, {});
  }, [salesRef]);
  
  const deleteSale = useCallback((id: string) => {
     if (!salesRef) return;
    deleteDocumentNonBlocking(doc(salesRef, id));
  }, [salesRef]);
  
  const addFeedCost = useCallback((cost: Omit<FeedCost, 'id'>) => {
     if (!feedCostsRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(feedCostsRef, newId);
    setDocumentNonBlocking(docRef, { ...cost, id: newId }, {});
  }, [feedCostsRef]);

  const deleteFeedCost = useCallback((id: string) => {
    if (!feedCostsRef) return;
    deleteDocumentNonBlocking(doc(feedCostsRef, id));
  }, [feedCostsRef]);
  
  const addMedicineExpense = useCallback((expense: Omit<MedicineExpense, 'id'>) => {
    if (!medicineExpensesRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(medicineExpensesRef, newId);
    setDocumentNonBlocking(docRef, { ...expense, id: newId }, {});
  }, [medicineExpensesRef]);

  const deleteMedicineExpense = useCallback((id: string) => {
    if (!medicineExpensesRef) return;
    deleteDocumentNonBlocking(doc(medicineExpensesRef, id));
  }, [medicineExpensesRef]);
  
  const addLaborCost = useCallback((cost: Omit<LaborCost, 'id'>) => {
    if (!laborCostsRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(laborCostsRef, newId);
    setDocumentNonBlocking(docRef, { ...cost, id: newId }, {});
  }, [laborCostsRef]);

  const deleteLaborCost = useCallback((id: string) => {
    if (!laborCostsRef) return;
    deleteDocumentNonBlocking(doc(laborCostsRef, id));
  }, [laborCostsRef]);
  
  const addTrackedSheep = useCallback((sheep: Omit<TrackedSheep, 'id'>) => {
    const newSheep = { ...sheep, id: crypto.randomUUID() };
    setTrackedSheep(prev => [...prev, newSheep]);
  }, []);

  const deleteTrackedSheep = useCallback((id: string) => {
    setTrackedSheep(prev => prev.filter(a => a.id !== id));
  }, []);

  const isLoading = isLoadingPurchases || isLoadingSales || isLoadingFeedCosts || isLoadingMedicine || isLoadingLabor;

  const totalSheep = useMemo(() => {
    const purchased = (purchases || []).reduce((sum, p) => sum + p.animalCount, 0);
    const sold = (sales || []).reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold;
  }, [purchases, sales]);
  
  const totalExpenses = useMemo(() => {
    const purchaseExpense = (purchases || []).reduce((sum, p) => sum + p.purchasePrice, 0);
    const feedExpense = (feedCosts || []).reduce((sum, f) => sum + f.cost, 0);
    const medicineExpense = (medicineExpenses || []).reduce((sum, m) => sum + m.totalAmountSpent, 0);
    const laborExpense = (laborCosts || []).reduce((sum, l) => sum + l.totalLaborCosts, 0);
    return purchaseExpense + feedExpense + medicineExpense + laborExpense;
  }, [purchases, feedCosts, medicineExpenses, laborCosts]);

  const totalSales = useMemo(() => {
    return (sales || []).reduce((sum, s) => sum + s.totalAmountReceived, 0);
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
    trackedSheep,
    addTrackedSheep,
    deleteTrackedSheep,
    isLoading,
    totalSheep,
    totalExpenses,
    totalSales,
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
