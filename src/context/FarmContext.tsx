'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale, UserProfile } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
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
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  const isCollaboratorVerified = userProfile?.role === 'collaborator';

  // SHARED COMMUNITY DATA QUERIES (Collection Group)
  const purchasesRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'livestockPurchases')) : null, [firestore, isCollaboratorVerified]);
  const { data: allPurchases, isLoading: isLoadingPurchases } = useCollection<LivestockPurchase>(purchasesRef);

  const salesRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'animalSales')) : null, [firestore, isCollaboratorVerified]);
  const { data: allSales, isLoading: isLoadingSales } = useCollection<AnimalSale>(salesRef);

  const feedRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'feedExpenses')) : null, [firestore, isCollaboratorVerified]);
  const { data: allFeedCosts, isLoading: isLoadingFeed } = useCollection<FeedCost>(feedRef);

  const medicineRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'medicineExpenses')) : null, [firestore, isCollaboratorVerified]);
  const { data: allMedicineExpenses, isLoading: isLoadingMedicine } = useCollection<MedicineExpense>(medicineRef);

  const laborRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'laborExpenses')) : null, [firestore, isCollaboratorVerified]);
  const { data: allLaborCosts, isLoading: isLoadingLabor } = useCollection<LaborCost>(laborRef);

  const deadAnimalsRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'deadAnimals')) : null, [firestore, isCollaboratorVerified]);
  const { data: allDeadAnimals, isLoading: isLoadingDead } = useCollection<DeadAnimal>(deadAnimalsRef);

  const trackedSheepRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'trackedSheep')) : null, [firestore, isCollaboratorVerified]);
  const { data: allTrackedSheep, isLoading: isLoadingTracked } = useCollection<TrackedSheep>(trackedSheepRef);

  const farmExpensesRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'farmExpenses')) : null, [firestore, isCollaboratorVerified]);
  const { data: allFarmExpenses, isLoading: isLoadingFarmExpenses } = useCollection<FarmExpense>(farmExpensesRef);
  
  const healthTasksRef = useMemoFirebase(() => (firestore && isCollaboratorVerified) ? query(collectionGroup(firestore, 'healthTasks')) : null, [firestore, isCollaboratorVerified]);
  const { data: allHealthTasks, isLoading: isLoadingHealth } = useCollection<HealthTask>(healthTasksRef);

  const marketplaceRef = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'communitySales')) : null, [firestore]);
  const { data: communitySales, isLoading: isLoadingMarketplace } = useCollection<PublicSale>(marketplaceRef);

  const purchases = useMemo(() => allPurchases ? [...allPurchases].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()) : null, [allPurchases]);
  const sales = useMemo(() => allSales ? [...allSales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()) : null, [allSales]);
  const feedCosts = useMemo(() => allFeedCosts ? [...allFeedCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [allFeedCosts]);
  const medicineExpenses = useMemo(() => allMedicineExpenses ? [...allMedicineExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [allMedicineExpenses]);
  const laborCosts = useMemo(() => allLaborCosts ? [...allLaborCosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : null, [allLaborCosts]);
  const deadAnimals = useMemo(() => allDeadAnimals ? [...allDeadAnimals].sort((a, b) => new Date(b.dateOfDeath).getTime() - new Date(a.dateOfDeath).getTime()) : null, [allDeadAnimals]);
  const trackedSheep = useMemo(() => allTrackedSheep ? [...allTrackedSheep].sort((a, b) => (a.tagId || '').localeCompare(b.tagId || '')) : null, [allTrackedSheep]);
  const farmExpenses = useMemo(() => allFarmExpenses ? [...allFarmExpenses].sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()) : null, [allFarmExpenses]);
  const healthTasks = useMemo(() => allHealthTasks ? [...allHealthTasks].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()) : null, [allHealthTasks]);

  const upsert = useCallback((colName: string, id: string | undefined, data: any) => {
    if (!user || !firestore) return;
    const finalId = id || generateId();
    const docRef = doc(firestore, 'users', user.uid, colName, finalId);
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: finalId,
      createdBy: user.uid,
      creatorEmail: user.email || 'anonymous@farm.com',
      creatorName: user.displayName || 'Verified Shepherd',
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

  const isLoading = isLoadingProfile || isLoadingPurchases || isLoadingSales || isLoadingFeed || isLoadingMedicine || isLoadingLabor || isLoadingDead || isLoadingTracked || isLoadingFarmExpenses || isLoadingHealth || isLoadingMarketplace;

  const totalDeadCount = useMemo(() => (allDeadAnimals || []).reduce((sum, a) => sum + Number(a.sheepCount || 0), 0), [allDeadAnimals]);
  const totalTrackedCount = useMemo(() => (allTrackedSheep || []).length, [allTrackedSheep]);
  const totalSheepCount = useMemo(() => {
    const purchased = (allPurchases || []).reduce((sum, p) => sum + Number(p.animalCount || 0), 0);
    const sold = (allSales || []).reduce((sum, s) => sum + Number(s.animalCount || 0), 0);
    return Math.max(0, purchased - sold - totalDeadCount);
  }, [allPurchases, allSales, totalDeadCount]);

  const totalFeedCostVal = useMemo(() => (allFeedCosts || []).reduce((sum, f) => sum + Number(f.cost || 0), 0), [allFeedCosts]);
  const totalLaborCostVal = useMemo(() => (allLaborCosts || []).reduce((sum, l) => sum + Number(l.totalLaborCosts || 0), 0), [allLaborCosts]);
  const totalMedicineCostVal = useMemo(() => {
    const legacy = (allMedicineExpenses || []).reduce((sum, m) => sum + Number(m.totalAmountSpent || 0), 0);
    const tasks = (allHealthTasks || []).reduce((sum, t) => sum + Number(t.cost || 0), 0);
    return legacy + tasks;
  }, [allMedicineExpenses, allHealthTasks]);
  const totalFarmExpensesVal = useMemo(() => (allFarmExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0), [allFarmExpenses]);

  const totalExpensesVal = useMemo(() => {
    const purchaseExpense = (allPurchases || []).reduce((sum, p) => sum + Number(p.purchasePrice || 0) + Number(p.transportCost || 0), 0);
    return purchaseExpense + totalFeedCostVal + totalMedicineCostVal + totalLaborCostVal + totalFarmExpensesVal;
  }, [allPurchases, totalFeedCostVal, totalMedicineCostVal, totalLaborCostVal, totalFarmExpensesVal]);

  const totalSalesRevenueVal = useMemo(() => (allSales || []).reduce((sum, s) => sum + Number(s.salePrice || 0), 0), [allSales]);
  const totalReceivablesVal = useMemo(() => (allSales || []).reduce((sum, s) => sum + Number(s.outstandingDuesFromBuyer || 0), 0), [allSales]);
  const totalPayablesVal = useMemo(() => (allPurchases || []).reduce((sum, p) => sum + Number(p.dueAmount || 0), 0), [allPurchases]);

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
