'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, doc, serverTimestamp } from 'firebase/firestore';
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

  // COLLABORATIVE QUERIES - These use collectionGroup to fetch data from all users
  const purchasesRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'livestockPurchases') : null, [firestore, user]);
  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'animalSales') : null, [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<AnimalSale>(salesRef);
  
  const feedCostsRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'feedExpenses') : null, [firestore, user]);
  const { data: feedCosts, isLoading: isLoadingFeedCosts } = useCollection<FeedCost>(feedCostsRef);

  const medicineExpensesRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'medicineExpenses') : null, [firestore, user]);
  const { data: medicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineExpensesRef);

  const laborCostsRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'laborExpenses') : null, [firestore, user]);
  const { data: laborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborCostsRef);
  
  const deadAnimalsRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'deadAnimals') : null, [firestore, user]);
  const { data: deadAnimals, isLoading: isLoadingDeadAnimals } = useCollection<DeadAnimal>(deadAnimalsRef);

  const trackedSheepRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'trackedSheep') : null, [firestore, user]);
  const { data: trackedSheep, isLoading: isLoadingTrackedSheep } = useCollection<TrackedSheep>(trackedSheepRef);

  const farmExpensesRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'farmExpenses') : null, [firestore, user]);
  const { data: farmExpenses, isLoading: isLoadingFarmExpenses } = useCollection<FarmExpense>(farmExpensesRef);
  
  const healthTasksRef = useMemoFirebase(() => user ? collectionGroup(firestore, 'healthTasks') : null, [firestore, user]);
  const { data: healthTasks, isLoading: isLoadingHealthTasks } = useCollection<HealthTask>(healthTasksRef);

  // Community Marketplace - Root level shared collection
  const marketplaceRef = useMemoFirebase(() => user ? collection(firestore, 'communitySales') : null, [firestore, user]);
  const { data: communitySales, isLoading: isLoadingMarketplace } = useCollection<PublicSale>(marketplaceRef);

  // Helper for adding/updating data - entries are still stored under the user's path for organization
  const upsert = useCallback((colName: string, id: string | undefined, data: any) => {
    if (!user) return;
    const finalId = id || generateId();
    const docRef = doc(firestore, 'users', user.uid, colName, finalId);
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: finalId,
      ownerUid: user.uid,
      ownerEmail: user.email,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const addPurchase = useCallback((p: any) => upsert('livestockPurchases', undefined, p), [upsert]);
  const updatePurchase = useCallback((id: string, p: any) => {
    // For collaboration, we need to know the original path. 
    // If id is provided, we assume update. For simplicity in this demo,
    // we use the current user's path, but in a real app, you'd store the full path.
    upsert('livestockPurchases', id, p);
  }, [upsert]);
  
  const deletePurchase = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'livestockPurchases', id));
  }, [user, firestore]);

  const addSale = useCallback((s: any) => upsert('animalSales', undefined, s), [upsert]);
  const updateSale = useCallback((id: string, s: any) => upsert('animalSales', id, s), [upsert]);
  const deleteSale = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'animalSales', id));
  }, [user, firestore]);

  const addFeedCost = useCallback((c: any) => upsert('feedExpenses', undefined, c), [upsert]);
  const updateFeedCost = useCallback((id: string, c: any) => upsert('feedExpenses', id, c), [upsert]);
  const deleteFeedCost = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'feedExpenses', id));
  }, [user, firestore]);

  const addMedicineExpense = useCallback((e: any) => upsert('medicineExpenses', undefined, e), [upsert]);
  const updateMedicineExpense = useCallback((id: string, e: any) => upsert('medicineExpenses', id, e), [upsert]);
  const deleteMedicineExpense = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'medicineExpenses', id));
  }, [user, firestore]);

  const addLaborCost = useCallback((c: any) => upsert('laborExpenses', undefined, c), [upsert]);
  const updateLaborCost = useCallback((id: string, c: any) => upsert('laborExpenses', id, c), [upsert]);
  const deleteLaborCost = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'laborExpenses', id));
  }, [user, firestore]);

  const addTrackedSheep = useCallback((s: any) => upsert('trackedSheep', undefined, { ...s, createdAt: serverTimestamp() }), [upsert]);
  const updateTrackedSheep = useCallback((id: string, s: any) => upsert('trackedSheep', id, s), [upsert]);
  const deleteTrackedSheep = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'trackedSheep', id));
  }, [user, firestore]);

  const addDeadAnimal = useCallback((a: any) => upsert('deadAnimals', undefined, a), [upsert]);
  const updateDeadAnimal = useCallback((id: string, a: any) => upsert('deadAnimals', id, a), [upsert]);
  const deleteDeadAnimal = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'deadAnimals', id));
  }, [user, firestore]);

  const addFarmExpense = useCallback((e: any) => upsert('farmExpenses', undefined, e), [upsert]);
  const updateFarmExpense = useCallback((id: string, e: any) => upsert('farmExpenses', id, e), [upsert]);
  const deleteFarmExpense = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'farmExpenses', id));
  }, [user, firestore]);

  const addHealthTask = useCallback((t: any) => upsert('healthTasks', undefined, t), [upsert]);
  const updateHealthTask = useCallback((id: string, t: any) => upsert('healthTasks', id, t), [upsert]);
  const deleteHealthTask = useCallback((id: string) => {
    if (user) deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'healthTasks', id));
  }, [user, firestore]);

  const postToMarketplace = useCallback((sale: any) => {
    if (!user) return;
    const finalId = generateId();
    const docRef = doc(firestore, 'communitySales', finalId);
    setDocumentNonBlocking(docRef, {
      ...sale,
      id: finalId,
      sellerId: user.uid,
      sellerEmail: user.email,
      sellerName: user.displayName || 'Farmer',
    }, { merge: true });
  }, [user, firestore]);

  const deleteMarketplaceSale = useCallback((id: string) => {
    const docRef = doc(firestore, 'communitySales', id);
    deleteDocumentNonBlocking(docRef);
  }, [firestore]);

  const isLoading = isLoadingPurchases || isLoadingSales || isLoadingFeedCosts || isLoadingMedicine || isLoadingLabor || isLoadingDeadAnimals || isLoadingTrackedSheep || isLoadingFarmExpenses || isLoadingHealthTasks || isLoadingMarketplace;

  const totalDead = useMemo(() => (deadAnimals || []).reduce((sum, a) => sum + (a.sheepCount ?? 1), 0), [deadAnimals]);
  const totalTracked = useMemo(() => (trackedSheep || []).length, [trackedSheep]);
  const totalSheep = useMemo(() => {
    const purchased = (purchases || []).reduce((sum, p) => sum + p.animalCount, 0);
    const sold = (sales || []).reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold - totalDead;
  }, [purchases, sales, totalDead]);

  const totalFeedCost = useMemo(() => (feedCosts || []).reduce((sum, f) => sum + f.cost, 0), [feedCosts]);
  const totalLaborCost = useMemo(() => (laborCosts || []).reduce((sum, l) => sum + l.totalLaborCosts, 0), [laborCosts]);
  
  const totalMedicineCost = useMemo(() => {
    const legacyExpenses = (medicineExpenses || []).reduce((sum, m) => sum + m.totalAmountSpent, 0);
    const healthTaskExpenses = (healthTasks || []).reduce((sum, t) => sum + (t.cost || 0), 0);
    return legacyExpenses + healthTaskExpenses;
  }, [medicineExpenses, healthTasks]);

  const totalFarmExpenses = useMemo(() => (farmExpenses || []).reduce((sum, e) => sum + e.amount, 0), [farmExpenses]);

  const totalExpenses = useMemo(() => {
    const purchaseExpense = (purchases || []).reduce((sum, p) => sum + p.purchasePrice + (p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCost + totalMedicineCost + totalLaborCost + totalFarmExpenses;
  }, [purchases, totalFeedCost, totalMedicineCost, totalLaborCost, totalFarmExpenses]);

  const totalSales = useMemo(() => (sales || []).reduce((sum, s) => sum + s.amountReceived, 0), [sales]);
  const totalReceivables = useMemo(() => (sales || []).reduce((sum, s) => sum + s.outstandingDuesFromBuyer, 0), [sales]);
  const totalPayables = useMemo(() => (purchases || []).reduce((sum, p) => sum + p.dueAmount, 0), [purchases]);

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
    isLoading, totalSheep, totalTracked, totalExpenses, totalSales, totalDead, totalFeedCost, totalLaborCost, totalMedicineCost, totalFarmExpenses, totalReceivables, totalPayables,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}