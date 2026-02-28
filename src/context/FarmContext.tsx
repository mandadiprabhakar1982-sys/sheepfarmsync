'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale, UserProfile } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, collectionGroup, query } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  // PRIVATE DATA (For Dashboard)
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

  // COMMUNITY DATA (For Benchmarking & Marketplace)
  communitySales: PublicSale[] | null;
  postToMarketplace: (sale: Omit<PublicSale, 'id' | 'sellerId' | 'sellerEmail' | 'sellerName'>) => void;
  deleteMarketplaceSale: (id: string) => void;
  
  communityPurchases: LivestockPurchase[] | null; // For AI Analysis

  isLoading: boolean;

  // AGGREGATED METRICS (Calculated from Private Data)
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
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. IDENTITY GATE
  const userProfileRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  const isCollaboratorVerified = userProfile?.role === 'collaborator';

  // 2. PRIVATE DATA QUERIES (Owned by Current User)
  const myPurchasesRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'livestockPurchases') : null, [firestore, user]);
  const { data: myPurchases, isLoading: isLoadingMyPurchases } = useCollection<LivestockPurchase>(myPurchasesRef);

  const mySalesRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'animalSales') : null, [firestore, user]);
  const { data: mySales, isLoading: isLoadingMySales } = useCollection<AnimalSale>(mySalesRef);

  const myFeedRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'feedExpenses') : null, [firestore, user]);
  const { data: myFeedCosts, isLoading: isLoadingMyFeed } = useCollection<FeedCost>(myFeedRef);

  const myMedicineRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'medicineExpenses') : null, [firestore, user]);
  const { data: myMedicineExpenses, isLoading: isLoadingMyMedicine } = useCollection<MedicineExpense>(myMedicineRef);

  const myLaborRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'laborExpenses') : null, [firestore, user]);
  const { data: myLaborCosts, isLoading: isLoadingMyLabor } = useCollection<LaborCost>(myLaborRef);

  const myDeadAnimalsRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'deadAnimals') : null, [firestore, user]);
  const { data: myDeadAnimals, isLoading: isLoadingMyDead } = useCollection<DeadAnimal>(myDeadAnimalsRef);

  const myTrackedSheepRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'trackedSheep') : null, [firestore, user]);
  const { data: myTrackedSheep, isLoading: isLoadingMyTracked } = useCollection<TrackedSheep>(myTrackedSheepRef);

  const myFarmExpensesRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'farmExpenses') : null, [firestore, user]);
  const { data: myFarmExpenses, isLoading: isLoadingMyFarmExpenses } = useCollection<FarmExpense>(myFarmExpensesRef);
  
  const myHealthTasksRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'healthTasks') : null, [firestore, user]);
  const { data: myHealthTasks, isLoading: isLoadingMyHealth } = useCollection<HealthTask>(myHealthTasksRef);

  // 3. COMMUNITY DATA QUERIES (Shared Benchmarks)
  const commPurchasesRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'livestockPurchases')) : null, [firestore, isCollaboratorVerified]);
  const { data: commPurchases, isLoading: isLoadingCommPurchases } = useCollection<LivestockPurchase>(commPurchasesRef);

  const marketplaceRef = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'communitySales')) : null, [firestore]);
  const { data: communitySales, isLoading: isLoadingMarketplace } = useCollection<PublicSale>(marketplaceRef);

  // MEMOIZED DERIVED DATA
  const purchases = useMemo(() => myPurchases ? [...myPurchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()) : null, [myPurchases]);
  const sales = useMemo(() => mySales ? [...mySales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()) : null, [mySales]);
  const feedCosts = useMemo(() => myFeedCosts ? [...myFeedCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [myFeedCosts]);
  const medicineExpenses = useMemo(() => myMedicineExpenses ? [...myMedicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [myMedicineExpenses]);
  const laborCosts = useMemo(() => myLaborCosts ? [...myLaborCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [myLaborCosts]);
  const deadAnimals = useMemo(() => myDeadAnimals ? [...myDeadAnimals].sort((a, b) => new Date(b.dateOfDeath).getTime() - new Date(a.dateOfDeath).getTime()) : null, [myDeadAnimals]);
  const trackedSheep = useMemo(() => myTrackedSheep ? [...myTrackedSheep].sort((a, b) => (a.tagId || '').localeCompare(b.tagId || '')) : null, [myTrackedSheep]);
  const farmExpenses = useMemo(() => myFarmExpenses ? [...myFarmExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()) : null, [myFarmExpenses]);
  const healthTasks = useMemo(() => myHealthTasks ? [...myHealthTasks].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()) : null, [myHealthTasks]);

  // CRUD HELPERS
  const upsert = useCallback((colName: string, id: string | undefined, data: any) => {
    if (!user || !firestore) return;
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
    if (!user || !firestore) return;
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
    if (!user || !firestore) return;
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
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'communitySales', id));
  }, [firestore]);

  // COMBINED LOADING STATE
  const isLoading = isLoadingProfile || isLoadingMyPurchases || isLoadingMySales || isLoadingMyFeed || isLoadingMyMedicine || isLoadingMyLabor || isLoadingMyDead || isLoadingMyTracked || isLoadingMyFarmExpenses || isLoadingMyHealth || isLoadingMarketplace;

  // AGGREGATIONS (Based on My Private Data)
  const totalDeadCount = useMemo(() => (myDeadAnimals || []).reduce((sum, a) => sum + Number(a.sheepCount || 0), 0), [myDeadAnimals]);
  const totalTrackedCount = useMemo(() => (myTrackedSheep || []).length, [myTrackedSheep]);
  const totalSheepCount = useMemo(() => {
    const purchased = (myPurchases || []).reduce((sum, p) => sum + Number(p.animalCount || 0), 0);
    const sold = (mySales || []).reduce((sum, s) => sum + Number(s.animalCount || 0), 0);
    return Math.max(0, purchased - sold - totalDeadCount);
  }, [myPurchases, mySales, totalDeadCount]);

  const totalFeedCostVal = useMemo(() => (myFeedCosts || []).reduce((sum, f) => sum + Number(f.cost || 0), 0), [myFeedCosts]);
  const totalLaborCostVal = useMemo(() => (myLaborCosts || []).reduce((sum, l) => sum + Number(l.totalLaborCosts || 0), 0), [myLaborCosts]);
  const totalMedicineCostVal = useMemo(() => {
    const legacy = (myMedicineExpenses || []).reduce((sum, m) => sum + Number(m.totalAmountSpent || 0), 0);
    const tasks = (myHealthTasks || []).reduce((sum, t) => sum + Number(t.cost || 0), 0);
    return legacy + tasks;
  }, [myMedicineExpenses, myHealthTasks]);
  const totalFarmExpensesVal = useMemo(() => (myFarmExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0), [myFarmExpenses]);

  const totalExpensesVal = useMemo(() => {
    const purchaseExpense = (myPurchases || []).reduce((sum, p) => sum + Number(p.purchasePrice || 0) + Number(p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCostVal + totalMedicineCostVal + totalLaborCostVal + totalFarmExpensesVal;
  }, [myPurchases, totalFeedCostVal, totalMedicineCostVal, totalLaborCostVal, totalFarmExpensesVal]);

  const totalSalesRevenueVal = useMemo(() => (mySales || []).reduce((sum, s) => sum + Number(s.salePrice || 0), 0), [mySales]);
  const totalReceivablesVal = useMemo(() => (mySales || []).reduce((sum, s) => sum + Number(s.outstandingDuesFromBuyer || 0), 0), [mySales]);
  const totalPayablesVal = useMemo(() => (myPurchases || []).reduce((sum, p) => sum + Number(p.dueAmount || 0), 0), [myPurchases]);

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
    communityPurchases: commPurchases,
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
