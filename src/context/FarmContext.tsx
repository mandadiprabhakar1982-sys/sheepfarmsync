'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';
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

  // --- PRIVATE DATA LISTENERS (Filtered by ownerId to comply with Security Rules) ---
  
  const purchasesRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'livestockPurchases'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: purchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'animalSales'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: sales, isLoading: isLoadingSales } = useCollection<AnimalSale>(salesRef);
  
  const feedCostsRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'feedExpenses'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: feedCosts, isLoading: isLoadingFeedCosts } = useCollection<FeedCost>(feedCostsRef);

  const medicineExpensesRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'medicineExpenses'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: medicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineExpensesRef);

  const laborCostsRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'laborExpenses'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: laborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborCostsRef);
  
  const deadAnimalsRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'deadAnimals'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: deadAnimals, isLoading: isLoadingDeadAnimals } = useCollection<DeadAnimal>(deadAnimalsRef);

  const trackedSheepRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'trackedSheep'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: trackedSheep, isLoading: isLoadingTrackedSheep } = useCollection<TrackedSheep>(trackedSheepRef);

  const farmExpensesRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'farmExpenses'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: farmExpenses, isLoading: isLoadingFarmExpenses } = useCollection<FarmExpense>(farmExpensesRef);
  
  const healthTasksRef = useMemoFirebase(() => 
    user ? query(collection(firestore, 'healthTasks'), where('ownerId', '==', user.uid)) : null, 
  [firestore, user]);
  const { data: healthTasks, isLoading: isLoadingHealthTasks } = useCollection<HealthTask>(healthTasksRef);

  // --- PUBLIC COMMUNITY DATA ---
  const marketplaceRef = useMemoFirebase(() => 
    user ? collection(firestore, 'communitySales') : null, 
  [firestore, user]);
  const { data: communitySales, isLoading: isLoadingMarketplace } = useCollection<PublicSale>(marketplaceRef);

  // --- CRUD HELPERS ---
  const upsert = useCallback((colName: string, id: string | undefined, data: any) => {
    if (!user) return;
    const finalId = id || generateId();
    const docRef = doc(firestore, colName, finalId);
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: finalId,
      ownerId: user.uid, 
      ownerEmail: user.email,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const addPurchase = useCallback((p: any) => upsert('livestockPurchases', undefined, p), [upsert]);
  const updatePurchase = useCallback((id: string, p: any) => upsert('livestockPurchases', id, p), [upsert]);
  const deletePurchase = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'livestockPurchases', id));
  }, [firestore]);

  const addSale = useCallback((s: any) => upsert('animalSales', undefined, s), [upsert]);
  const updateSale = useCallback((id: string, s: any) => upsert('animalSales', id, s), [upsert]);
  const deleteSale = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'animalSales', id));
  }, [firestore]);

  const addFeedCost = useCallback((c: any) => upsert('feedExpenses', undefined, c), [upsert]);
  const updateFeedCost = useCallback((id: string, c: any) => upsert('feedExpenses', id, c), [upsert]);
  const deleteFeedCost = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'feedExpenses', id));
  }, [firestore]);

  const addMedicineExpense = useCallback((e: any) => upsert('medicineExpenses', undefined, e), [upsert]);
  const updateMedicineExpense = useCallback((id: string, e: any) => upsert('medicineExpenses', id, e), [upsert]);
  const deleteMedicineExpense = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'medicineExpenses', id));
  }, [firestore]);

  const addLaborCost = useCallback((c: any) => upsert('laborExpenses', undefined, c), [upsert]);
  const updateLaborCost = useCallback((id: string, c: any) => upsert('laborExpenses', id, c), [upsert]);
  const deleteLaborCost = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'laborExpenses', id));
  }, [firestore]);

  const addTrackedSheep = useCallback((s: any) => upsert('trackedSheep', undefined, { ...s, createdAt: serverTimestamp() }), [upsert]);
  const updateTrackedSheep = useCallback((id: string, s: any) => upsert('trackedSheep', id, s), [upsert]);
  const deleteTrackedSheep = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'trackedSheep', id));
  }, [firestore]);

  const addDeadAnimal = useCallback((a: any) => upsert('deadAnimals', undefined, a), [upsert]);
  const updateDeadAnimal = useCallback((id: string, a: any) => upsert('deadAnimals', id, a), [upsert]);
  const deleteDeadAnimal = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'deadAnimals', id));
  }, [firestore]);

  const addFarmExpense = useCallback((e: any) => upsert('farmExpenses', undefined, e), [upsert]);
  const updateFarmExpense = useCallback((id: string, e: any) => upsert('farmExpenses', id, e), [upsert]);
  const deleteFarmExpense = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'farmExpenses', id));
  }, [firestore]);

  const addHealthTask = useCallback((t: any) => upsert('healthTasks', undefined, t), [upsert]);
  const updateHealthTask = useCallback((id: string, t: any) => upsert('healthTasks', id, t), [upsert]);
  const deleteHealthTask = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'healthTasks', id));
  }, [firestore]);

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
      createdAt: serverTimestamp()
    }, { merge: true });
  }, [user, firestore]);

  const deleteMarketplaceSale = useCallback((id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'communitySales', id));
  }, [firestore]);

  const isLoading = isLoadingPurchases || isLoadingSales || isLoadingFeedCosts || isLoadingMedicine || isLoadingHealthTasks || isLoadingLabor || isLoadingDeadAnimals || isLoadingTrackedSheep || isLoadingFarmExpenses || isLoadingMarketplace;

  // --- STATS CALCULATION ---
  const totalDead = useMemo(() => (deadAnimals || []).reduce((sum, a) => sum + (a.sheepCount ?? 1), 0), [deadAnimals]);
  const totalTracked = useMemo(() => (trackedSheep || []).length, [trackedSheep]);
  const totalSheep = useMemo(() => {
    const purchased = (purchases || []).reduce((sum, p) => sum + p.animalCount, 0);
    const sold = (sales || []).reduce((sum, s) => sum + s.animalCount, 0);
    return purchased - sold - totalDead;
  }, [purchases, sales, totalDead]);

  const totalFeedCost = useMemo(() => (feedCosts || []).reduce((sum, f) => sum + (f.cost || 0), 0), [feedCosts]);
  const totalLaborCost = useMemo(() => (laborCosts || []).reduce((sum, l) => sum + (l.totalLaborCosts || 0), 0), [laborCosts]);
  const totalMedicineCost = useMemo(() => {
    const legacy = (medicineExpenses || []).reduce((sum, m) => sum + (m.totalAmountSpent || 0), 0);
    const tasks = (healthTasks || []).reduce((sum, t) => sum + (t.cost || 0), 0);
    return legacy + tasks;
  }, [medicineExpenses, healthTasks]);
  const totalFarmExpenses = useMemo(() => (farmExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0), [farmExpenses]);

  const totalExpenses = useMemo(() => {
    const purchaseExpense = (purchases || []).reduce((sum, p) => sum + (p.purchasePrice || 0) + (p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCost + totalMedicineCost + totalLaborCost + totalFarmExpenses;
  }, [purchases, totalFeedCost, totalMedicineCost, totalLaborCost, totalFarmExpenses]);

  const totalSalesCount = useMemo(() => (sales || []).reduce((sum, s) => sum + (s.amountReceived || 0), 0), [sales]);
  const totalReceivables = useMemo(() => (sales || []).reduce((sum, s) => sum + (s.outstandingDuesFromBuyer || 0), 0), [sales]);
  const totalPayables = useMemo(() => (purchases || []).reduce((sum, p) => sum + (p.dueAmount || 0), 0), [purchases]);

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
    isLoading, totalSheep, totalTracked, totalExpenses, totalSales: totalSalesCount, totalDead, totalFeedCost, totalLaborCost, totalMedicineCost, totalFarmExpenses, totalReceivables, totalPayables,
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}