'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, collectionGroup, query } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  purchases: LivestockPurchase[] | null;
  addPurchase: (purchase: Omit<LivestockPurchase, 'id'>) => void;
  deletePurchase: (id: string) => void;
  updatePurchase: (id: string, data: Omit<LivestockPurchase, 'id'>) => void;
  
  sales: AnimalSale[] | null;
  addSale: (sale: Omit<AnimalSale, 'id'>) => void;
  deleteSale: (id: string) => void;
  updateSale: (id: string, data: Omit<AnimalSale, 'id'>) => void;
  
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
  updateTrackedSheep: (id: string, data: Omit<TrackedSheep, 'id'>) => void;

  deadAnimals: DeadAnimal[] | null;
  addDeadAnimal: (animal: Omit<DeadAnimal, 'id'>) => void;
  deleteDeadAnimal: (id: string) => void;
  updateDeadAnimal: (id: string, data: Omit<DeadAnimal, 'id'>) => void;

  farmExpenses: FarmExpense[] | null;
  addFarmExpense: (expense: Omit<FarmExpense, 'id'>) => void;
  deleteFarmExpense: (id: string) => void;
  updateFarmExpense: (id: string, data: Omit<FarmExpense, 'id'>) => void;
  
  healthTasks: HealthTask[] | null;
  addHealthTask: (task: Omit<HealthTask, 'id'>) => void;
  deleteHealthTask: (id: string) => void;
  updateHealthTask: (id: string, data: Omit<HealthTask, 'id'>) => void;

  // Marketplace
  communitySales: PublicSale[] | null;
  postToMarketplace: (sale: Omit<PublicSale, 'id' | 'sellerId' | 'sellerEmail' | 'sellerName'>) => void;
  deleteMarketplaceSale: (id: string) => void;

  isLoading: boolean;

  totalSheep: number;
  totalTracked: number;
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

function generateId() {
  return crypto.randomUUID();
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  // --- STABLE COLLECTION GROUP QUERIES ---
  // Using explicit query() wrappers and stabilizing deps to prevent assertion errors (ID: ca9)
  
  const purchasesRef = useMemoFirebase(() => query(collectionGroup(firestore, 'livestockPurchases')), [firestore]);
  const { data: rawPurchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => query(collectionGroup(firestore, 'animalSales')), [firestore]);
  const { data: rawSales, isLoading: isLoadingSales } = useCollection<AnimalSale>(salesRef);
  
  const feedCostsRef = useMemoFirebase(() => query(collectionGroup(firestore, 'feedExpenses')), [firestore]);
  const { data: rawFeedCosts, isLoading: isLoadingFeedCosts } = useCollection<FeedCost>(feedCostsRef);

  const medicineExpensesRef = useMemoFirebase(() => query(collectionGroup(firestore, 'medicineExpenses')), [firestore]);
  const { data: rawMedicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineExpensesRef);

  const laborCostsRef = useMemoFirebase(() => query(collectionGroup(firestore, 'laborExpenses')), [firestore]);
  const { data: rawLaborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborCostsRef);
  
  const deadAnimalsRef = useMemoFirebase(() => query(collectionGroup(firestore, 'deadAnimals')), [firestore]);
  const { data: rawDeadAnimals, isLoading: isLoadingDeadAnimals } = useCollection<DeadAnimal>(deadAnimalsRef);

  const trackedSheepRef = useMemoFirebase(() => query(collectionGroup(firestore, 'trackedSheep')), [firestore]);
  const { data: rawTrackedSheep, isLoading: isLoadingTrackedSheep } = useCollection<TrackedSheep>(trackedSheepRef);

  const farmExpensesRef = useMemoFirebase(() => query(collectionGroup(firestore, 'farmExpenses')), [firestore]);
  const { data: rawFarmExpenses, isLoading: isLoadingFarmExpenses } = useCollection<FarmExpense>(farmExpensesRef);
  
  const healthTasksRef = useMemoFirebase(() => query(collectionGroup(firestore, 'healthTasks')), [firestore]);
  const { data: rawHealthTasks, isLoading: isLoadingHealthTasks } = useCollection<HealthTask>(healthTasksRef);

  const marketplaceRef = useMemoFirebase(() => query(collectionGroup(firestore, 'communitySales')), [firestore]);
  const { data: rawCommunitySales, isLoading: isLoadingMarketplace } = useCollection<PublicSale>(marketplaceRef);

  // --- MEMORY-BASED SORTING ---
  const purchases = useMemo(() => rawPurchases ? [...rawPurchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()) : null, [rawPurchases]);
  const sales = useMemo(() => rawSales ? [...rawSales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()) : null, [rawSales]);
  const feedCosts = useMemo(() => rawFeedCosts ? [...rawFeedCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [rawFeedCosts]);
  const medicineExpenses = useMemo(() => rawMedicineExpenses ? [...rawMedicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [rawMedicineExpenses]);
  const laborCosts = useMemo(() => rawLaborCosts ? [...rawLaborCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [rawLaborCosts]);
  const deadAnimals = useMemo(() => rawDeadAnimals ? [...rawDeadAnimals].sort((a, b) => new Date(b.dateOfDeath).getTime() - new Date(a.dateOfDeath).getTime()) : null, [rawDeadAnimals]);
  const trackedSheep = useMemo(() => rawTrackedSheep ? [...rawTrackedSheep].sort((a, b) => (a.tagId || '').localeCompare(b.tagId || '')) : null, [rawTrackedSheep]);
  const farmExpenses = useMemo(() => rawFarmExpenses ? [...rawFarmExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()) : null, [rawFarmExpenses]);
  const healthTasks = useMemo(() => rawHealthTasks ? [...rawHealthTasks].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()) : null, [rawHealthTasks]);
  const communitySales = useMemo(() => rawCommunitySales ? [...rawCommunitySales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()) : null, [rawCommunitySales]);

  // --- MUTATION HELPERS ---
  const upsert = useCallback((colName: string, id: string | undefined, data: any) => {
    if (!user) return;
    const finalId = id || generateId();
    const docRef = doc(firestore, 'users', user.uid, colName, finalId);
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: finalId,
      createdBy: user.uid,
      creatorEmail: user.email,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const remove = useCallback((colName: string, id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, colName, id));
  }, [user, firestore]);

  const addPurchase = useCallback((p: any) => upsert('livestockPurchases', undefined, p), [upsert]);
  const updatePurchase = useCallback((id: string, p: any) => upsert('livestockPurchases', id, p), [upsert]);
  const deletePurchase = useCallback((id: string) => remove('livestockPurchases', id), [remove]);

  const addSale = useCallback((s: any) => upsert('animalSales', undefined, s), [upsert]);
  const updateSale = useCallback((id: string, s: any) => upsert('animalSales', id, s), [upsert]);
  const deleteSale = useCallback((id: string) => remove('animalSales', id), [remove]);

  const addFeedCost = useCallback((c: any) => upsert('feedExpenses', undefined, c), [upsert]);
  const updateFeedCost = useCallback((id: string, c: any) => upsert('feedExpenses', id, c), [upsert]);
  const deleteFeedCost = useCallback((id: string) => remove('feedExpenses', id), [remove]);

  const addMedicineExpense = useCallback((e: any) => upsert('medicineExpenses', undefined, e), [upsert]);
  const updateMedicineExpense = useCallback((id: string, e: any) => upsert('medicineExpenses', id, e), [upsert]);
  const deleteMedicineExpense = useCallback((id: string) => remove('medicineExpenses', id), [remove]);

  const addLaborCost = useCallback((c: any) => upsert('laborExpenses', undefined, c), [upsert]);
  const updateLaborCost = useCallback((id: string, c: any) => upsert('laborExpenses', id, c), [upsert]);
  const deleteLaborCost = useCallback((id: string) => remove('laborExpenses', id), [remove]);

  const addTrackedSheep = useCallback((s: any) => upsert('trackedSheep', undefined, { ...s, createdAt: serverTimestamp() }), [upsert]);
  const updateTrackedSheep = useCallback((id: string, s: any) => upsert('trackedSheep', id, s), [upsert]);
  const deleteTrackedSheep = useCallback((id: string) => remove('trackedSheep', id), [remove]);

  const addDeadAnimal = useCallback((a: any) => upsert('deadAnimals', undefined, a), [upsert]);
  const updateDeadAnimal = useCallback((id: string, a: any) => upsert('deadAnimals', id, a), [upsert]);
  const deleteDeadAnimal = useCallback((id: string) => remove('deadAnimals', id), [remove]);

  const addFarmExpense = useCallback((e: any) => upsert('farmExpenses', undefined, e), [upsert]);
  const updateFarmExpense = useCallback((id: string, e: any) => upsert('farmExpenses', id, e), [upsert]);
  const deleteFarmExpense = useCallback((id: string) => remove('farmExpenses', id), [remove]);

  const addHealthTask = useCallback((t: any) => upsert('healthTasks', undefined, t), [upsert]);
  const updateHealthTask = useCallback((id: string, t: any) => upsert('healthTasks', id, t), [upsert]);
  const deleteHealthTask = useCallback((id: string) => remove('healthTasks', id), [remove]);

  const postToMarketplace = useCallback((sale: any) => {
    if (!user) return;
    const docRef = doc(firestore, 'communitySales', generateId());
    setDocumentNonBlocking(docRef, {
      ...sale,
      id: docRef.id,
      sellerId: user.uid,
      sellerEmail: user.email,
      sellerName: user.displayName || 'Farmer',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [user, firestore]);

  const deleteMarketplaceSale = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'communitySales', id));
  }, [firestore]);

  const isLoading = isLoadingPurchases || isLoadingSales || isLoadingFeedCosts || isLoadingMedicine || isLoadingHealthTasks || isLoadingLabor || isLoadingDeadAnimals || isLoadingTrackedSheep || isLoadingFarmExpenses || isLoadingMarketplace;

  // --- STATS CALCULATION ---
  const totalDeadCount = useMemo(() => (deadAnimals || []).reduce((sum, a) => sum + (a.sheepCount || 0), 0), [deadAnimals]);
  const totalTrackedCount = useMemo(() => (trackedSheep || []).length, [trackedSheep]);
  const totalSheepCount = useMemo(() => {
    const purchased = (purchases || []).reduce((sum, p) => sum + (p.animalCount || 0), 0);
    const sold = (sales || []).reduce((sum, s) => sum + (s.animalCount || 0), 0);
    return Math.max(0, purchased - sold - totalDeadCount);
  }, [purchases, sales, totalDeadCount]);

  const totalFeedCostVal = useMemo(() => (feedCosts || []).reduce((sum, f) => sum + (f.cost || 0), 0), [feedCosts]);
  const totalLaborCostVal = useMemo(() => (laborCosts || []).reduce((sum, l) => sum + (l.totalLaborCosts || 0), 0), [laborCosts]);
  const totalMedicineCostVal = useMemo(() => {
    const legacy = (medicineExpenses || []).reduce((sum, m) => sum + (m.totalAmountSpent || 0), 0);
    const tasks = (healthTasks || []).reduce((sum, t) => sum + (t.cost || 0), 0);
    return legacy + tasks;
  }, [medicineExpenses, healthTasks]);
  const totalFarmExpensesVal = useMemo(() => (farmExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0), [farmExpenses]);

  const totalExpensesVal = useMemo(() => {
    const purchaseExpense = (purchases || []).reduce((sum, p) => sum + (p.purchasePrice || 0) + (p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCostVal + totalMedicineCostVal + totalLaborCostVal + totalFarmExpensesVal;
  }, [purchases, totalFeedCostVal, totalMedicineCostVal, totalLaborCostVal, totalFarmExpensesVal]);

  const totalSalesRevenueVal = useMemo(() => (sales || []).reduce((sum, s) => sum + (s.salePrice || 0), 0), [sales]);
  const totalReceivablesVal = useMemo(() => (sales || []).reduce((sum, s) => sum + (s.outstandingDuesFromBuyer || 0), 0), [sales]);
  const totalPayablesVal = useMemo(() => (purchases || []).reduce((sum, p) => sum + (p.dueAmount || 0), 0), [purchases]);

  const value = {
    purchases, addPurchase, deletePurchase, updatePurchase,
    sales, addSale, deleteSale, updateSale,
    feedCosts, addFeedCost, deleteFeedCost, updateFeedCost,
    medicineExpenses, addMedicineExpense, deleteMedicineExpense, updateMedicineExpense,
    laborCosts, addLaborCost, deleteLaborCost, updateLaborCost,
    trackedSheep, addTrackedSheep, deleteTrackedSheep, updateTrackedSheep,
    deadAnimals, addDeadAnimal, deleteDeadAnimal, updateDeadAnimal,
    farmExpenses, addFarmExpense, deleteFarmExpense, updateFarmExpense,
    healthTasks, addHealthTask, deleteHealthTask, updateHealthTask,
    communitySales, postToMarketplace, deleteMarketplaceSale,
    isLoading, 
    totalSheep: totalSheepCount, 
    totalTracked: totalTrackedCount, 
    totalExpenses: totalExpensesVal, 
    totalSales: totalSalesRevenueVal, 
    totalDead: totalDeadCount, 
    totalFeedCost: totalFeedCostVal, 
    totalLaborCost: totalLaborCostVal, 
    totalMedicineCost: totalMedicineCostVal, 
    totalFarmExpenses: totalFarmExpensesVal, 
    totalReceivables: totalReceivablesVal, 
    totalPayables: totalPayablesVal,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}
