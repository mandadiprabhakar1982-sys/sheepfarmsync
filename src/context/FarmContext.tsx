'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  purchases: LivestockPurchase[] | null;
  addPurchase: (purchase: Omit<LivestockPurchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  updatePurchase: (id: string, data: Omit<LivestockPurchase, 'id'>) => void;
  
  sales: AnimalSale[] | null;
  addSale: (sale: Omit<AnimalSale, 'id'>) => void;
  deleteSale: (id: string) => void;
  
  feedCosts: FeedCost[] | null;
  addFeedCost: (cost: Omit<FeedCost, 'id'>) => void;
  deleteFeedCost: (id: string) => void;
  updateFeedCost: (id: string, data: Omit<FeedCost, 'id'>) => void;

  medicineExpenses: MedicineExpense[] | null;
  addMedicineExpense: (expense: Omit<MedicineExpense, 'id'>) => void;
  deleteMedicineExpense: (id: string) => void;
  updateMedicineExpense: (id: string, data: Omit<MedicineExpense, 'id'>) => void;

  laborCosts: LaborCost[] | null;
  addLaborCost: (cost: Omit<LaborCost, 'id'>) => void;
  deleteLaborCost: (id: string) => void;
  updateLaborCost: (id: string, data: Omit<LaborCost, 'id'>) => void;

  trackedSheep: TrackedSheep[] | null;
  addTrackedSheep: (sheep: Omit<TrackedSheep, 'id'>) => void;
  deleteTrackedSheep: (id: string) => void;

  deadAnimals: DeadAnimal[] | null;
  addDeadAnimal: (animal: Omit<DeadAnimal, 'id'>) => void;
  deleteDeadAnimal: (id: string) => void;
  updateDeadAnimal: (id: string, data: Omit<DeadAnimal, 'id'>) => void;

  farmExpenses: FarmExpense[] | null;
  addFarmExpense: (expense: Omit<FarmExpense, 'id'>) => void;
  deleteFarmExpense: (id: string) => void;
  
  isLoading: boolean;

  totalSheep: number;
  totalExpenses: number;
  totalSales: number;
  totalDead: number;
  totalFeedCost: number;
  totalLaborCost: number;
  totalMedicineCost: number;
  totalFarmExpenses: number;
  totalReceivables: number;
  totalPayables: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const purchasesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'livestockPurchases') : null, [firestore, user]);
  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'animalSales') : null, [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<AnimalSale>(salesRef);
  
  const feedCostsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'feedExpenses') : null, [firestore, user]);
  const { data: feedCosts, isLoading: isLoadingFeedCosts } = useCollection<FeedCost>(feedCostsRef);

  const medicineExpensesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'medicineExpenses') : null, [firestore, user]);
  const { data: medicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineExpensesRef);

  const laborCostsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'laborExpenses') : null, [firestore, user]);
  const { data: laborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborCostsRef);
  
  const deadAnimalsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'deadAnimals') : null, [firestore, user]);
  const { data: deadAnimals, isLoading: isLoadingDeadAnimals } = useCollection<DeadAnimal>(deadAnimalsRef);

  const trackedSheepRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'trackedSheep') : null, [firestore, user]);
  const { data: trackedSheep, isLoading: isLoadingTrackedSheep } = useCollection<TrackedSheep>(trackedSheepRef);

  const farmExpensesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'farmExpenses') : null, [firestore, user]);
  const { data: farmExpenses, isLoading: isLoadingFarmExpenses } = useCollection<FarmExpense>(farmExpensesRef);

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

  const updatePurchase = useCallback((id: string, data: Omit<LivestockPurchase, 'id'>) => {
    if (!purchasesRef) return;
    const docRef = doc(purchasesRef, id);
    updateDocumentNonBlocking(docRef, data);
  }, [purchasesRef]);

  const addSale = useCallback((sale: Omit<AnimalSale, 'id'>) => {
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

  const updateFeedCost = useCallback((id: string, data: Omit<FeedCost, 'id'>) => {
    if (!feedCostsRef) return;
    const docRef = doc(feedCostsRef, id);
    updateDocumentNonBlocking(docRef, data);
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

  const updateMedicineExpense = useCallback((id: string, data: Omit<MedicineExpense, 'id'>) => {
    if (!medicineExpensesRef) return;
    const docRef = doc(medicineExpensesRef, id);
    updateDocumentNonBlocking(docRef, data);
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

  const updateLaborCost = useCallback((id: string, data: Omit<LaborCost, 'id'>) => {
    if (!laborCostsRef) return;
    const docRef = doc(laborCostsRef, id);
    updateDocumentNonBlocking(docRef, data);
  }, [laborCostsRef]);
  
  const addTrackedSheep = useCallback((sheep: Omit<TrackedSheep, 'id'>) => {
    if (!trackedSheepRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(trackedSheepRef, newId);
    setDocumentNonBlocking(docRef, { ...sheep, id: newId }, {});
  }, [trackedSheepRef]);

  const deleteTrackedSheep = useCallback((id: string) => {
    if (!trackedSheepRef) return;
    deleteDocumentNonBlocking(doc(trackedSheepRef, id));
  }, [trackedSheepRef]);
  
  const addDeadAnimal = useCallback((animal: Omit<DeadAnimal, 'id'>) => {
    if (!deadAnimalsRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(deadAnimalsRef, newId);
    setDocumentNonBlocking(docRef, { ...animal, id: newId }, {});
  }, [deadAnimalsRef]);

  const deleteDeadAnimal = useCallback((id: string) => {
    if (!deadAnimalsRef) return;
    deleteDocumentNonBlocking(doc(deadAnimalsRef, id));
  }, [deadAnimalsRef]);

  const updateDeadAnimal = useCallback((id: string, data: Omit<DeadAnimal, 'id'>) => {
    if (!deadAnimalsRef) return;
    const docRef = doc(deadAnimalsRef, id);
    updateDocumentNonBlocking(docRef, data);
  }, [deadAnimalsRef]);

  const addFarmExpense = useCallback((expense: Omit<FarmExpense, 'id'>) => {
    if (!farmExpensesRef) return;
    const newId = crypto.randomUUID();
    const docRef = doc(farmExpensesRef, newId);
    setDocumentNonBlocking(docRef, { ...expense, id: newId }, {});
  }, [farmExpensesRef]);

  const deleteFarmExpense = useCallback((id: string) => {
    if (!farmExpensesRef) return;
    deleteDocumentNonBlocking(doc(farmExpensesRef, id));
  }, [farmExpensesRef]);


  const isLoading = isLoadingPurchases || isLoadingSales || isLoadingFeedCosts || isLoadingMedicine || isLoadingLabor || isLoadingDeadAnimals || isLoadingTrackedSheep || isLoadingFarmExpenses;

  const totalDead = useMemo(() => {
    return (deadAnimals || []).reduce((sum, a) => sum + (a.sheepCount ?? 1), 0);
  }, [deadAnimals]);

  const totalSheep = useMemo(() => {
    const purchased = (purchases || []).reduce((sum, p) => sum + p.animalCount, 0);
    const sold = (sales || []).reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold - totalDead;
  }, [purchases, sales, totalDead]);

  
  const totalFeedCost = useMemo(() => {
    return (feedCosts || []).reduce((sum, f) => sum + f.cost, 0);
  }, [feedCosts]);

  const totalLaborCost = useMemo(() => {
      return (laborCosts || []).reduce((sum, l) => sum + l.totalLaborCosts, 0);
  }, [laborCosts]);
  
  const totalMedicineCost = useMemo(() => {
    return (medicineExpenses || []).reduce((sum, m) => sum + m.totalAmountSpent, 0);
  }, [medicineExpenses]);

  const totalFarmExpenses = useMemo(() => {
    return (farmExpenses || []).reduce((sum, e) => sum + e.amount, 0);
  }, [farmExpenses]);

  const totalExpenses = useMemo(() => {
    const purchaseExpense = (purchases || []).reduce((sum, p) => sum + p.purchasePrice + (p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCost + totalMedicineCost + totalLaborCost + totalFarmExpenses;
  }, [purchases, totalFeedCost, totalMedicineCost, totalLaborCost, totalFarmExpenses]);

  const totalSales = useMemo(() => {
    return (sales || []).reduce((sum, s) => sum + s.amountReceived, 0);
  }, [sales]);

  const totalReceivables = useMemo(() => {
    return (sales || []).reduce((sum, s) => sum + s.outstandingDuesFromBuyer, 0);
  }, [sales]);

  const totalPayables = useMemo(() => {
    return (purchases || []).reduce((sum, p) => sum + p.dueAmount, 0);
  }, [purchases]);


  const value = {
    purchases,
    addPurchase,
    deletePurchase,
    updatePurchase,
    sales,
    addSale,
    deleteSale,
    feedCosts,
    addFeedCost,
    deleteFeedCost,
    updateFeedCost,
    medicineExpenses,
    addMedicineExpense,
    deleteMedicineExpense,
    updateMedicineExpense,
    laborCosts,
    addLaborCost,
    deleteLaborCost,
    updateLaborCost,
    trackedSheep,
    addTrackedSheep,
    deleteTrackedSheep,
    deadAnimals,
    addDeadAnimal,
    deleteDeadAnimal,
    updateDeadAnimal,
    farmExpenses,
    addFarmExpense,
    deleteFarmExpense,
    isLoading,
    totalSheep,
    totalExpenses,
    totalSales,
    totalDead,
    totalFeedCost,
    totalLaborCost,
    totalMedicineCost,
    totalFarmExpenses,
    totalReceivables,
    totalPayables,
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
