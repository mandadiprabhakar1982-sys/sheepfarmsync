
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale, UserProfile } from '@/lib/types';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, collectionGroup, query } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
  updateMarketplaceSale: (id: string, data: Partial<Omit<PublicSale, 'id' | 'sellerId'>>) => void;
  
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
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  
  const isVerified = useMemo(() => userProfile?.role === 'collaborator' || userProfile?.role === 'admin', [userProfile]);

  const pRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'livestockPurchases')) : null, [firestore, isVerified]);
  const sRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'animalSales')) : null, [firestore, isVerified]);
  const fRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'feedExpenses')) : null, [firestore, isVerified]);
  const mRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'medicineExpenses')) : null, [firestore, isVerified]);
  const lRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'laborExpenses')) : null, [firestore, isVerified]);
  const dRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'deadAnimals')) : null, [firestore, isVerified]);
  const tRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'trackedSheep')) : null, [firestore, isVerified]);
  const eRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'farmExpenses')) : null, [firestore, isVerified]);
  const hRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'healthTasks')) : null, [firestore, isVerified]);
  const mkRef = useMemo(() => firestore ? query(collection(firestore, 'communitySales')) : null, [firestore]);

  const { data: qPurchases, isLoading: lPurchases } = useCollection<LivestockPurchase>(pRef);
  const { data: qSales, isLoading: lSales } = useCollection<AnimalSale>(sRef);
  const { data: qFeed, isLoading: lFeed } = useCollection<FeedCost>(fRef);
  const { data: qMedicine, isLoading: lMedicine } = useCollection<MedicineExpense>(mRef);
  const { data: qLabor, isLoading: lLabor } = useCollection<LaborCost>(lRef);
  const { data: qDead, isLoading: lDead } = useCollection<DeadAnimal>(dRef);
  const { data: qTracked, isLoading: lTracked } = useCollection<TrackedSheep>(tRef);
  const { data: qExpenses, isLoading: lExpenses } = useCollection<FarmExpense>(eRef);
  const { data: qHealth, isLoading: lHealth } = useCollection<HealthTask>(hRef);
  const { data: qMarket, isLoading: lMarket } = useCollection<PublicSale>(mkRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sort = useCallback((list: any[] | null, k: string) => list ? [...list].sort((a, b) => new Date(b[k]).getTime() - new Date(a[k]).getTime()) : null, []);

  const purchases = useMemo(() => sort(qPurchases, 'purchaseDate'), [qPurchases, sort]);
  const sales = useMemo(() => sort(qSales, 'saleDate'), [qSales, sort]);
  const feedCosts = useMemo(() => sort(qFeed, 'date'), [qFeed, sort]);
  const medicineExpenses = useMemo(() => sort(qMedicine, 'date'), [qMedicine, sort]);
  const laborCosts = useMemo(() => sort(qLabor, 'date'), [qLabor, sort]);
  const deadAnimals = useMemo(() => sort(qDead, 'dateOfDeath'), [qDead, sort]);
  const trackedSheep = useMemo(() => qTracked ? [...qTracked].sort((a, b) => (a.tagId || '').localeCompare(b.tagId || '')) : null, [qTracked]);
  const farmExpenses = useMemo(() => sort(qExpenses, 'expenseDate'), [qExpenses, sort]);
  const healthTasks = useMemo(() => sort(qHealth, 'nextDueDate'), [qHealth, sort]);

  const upsert = useCallback((col: string, id: string | undefined, data: any) => {
    if (!user || !firestore) return;
    const finalId = id || generateId();
    const docRef = doc(firestore, 'users', user.uid, col, finalId);
    
    // Explicitly ensure creator metadata is captured from current user state
    const creatorMetadata = {
      createdBy: user.uid,
      creatorEmail: user.email || 'No Email',
      creatorName: user.displayName || user.email?.split('@')[0] || 'Shepherd',
    };

    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: finalId, 
      ...creatorMetadata,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const remove = useCallback((col: string, id: string) => {
    if (!user || !firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, col, id));
  }, [user, firestore]);

  const postToMarketplace = useCallback((sale: any) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'communitySales', generateId());
    setDocumentNonBlocking(docRef, { 
      ...sale, 
      id: docRef.id, 
      sellerId: user.uid, 
      sellerEmail: user.email || 'No Email', 
      sellerName: user.displayName || user.email?.split('@')[0] || 'Shepherd', 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const updateMarketplaceSale = useCallback((id: string, data: any) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'communitySales', id);
    updateDocumentNonBlocking(docRef, { ...data, updatedAt: serverTimestamp() });
  }, [user, firestore]);

  const stats = useMemo(() => {
    const deadCount = (qDead || []).reduce((s, a) => s + Number(a.sheepCount || 0), 0);
    const pCount = (qPurchases || []).reduce((s, p) => s + Number(p.animalCount || 0), 0);
    const sCount = (qSales || []).reduce((s, x) => s + Number(x.animalCount || 0), 0);
    const fCost = (qFeed || []).reduce((s, f) => s + Number(f.cost || 0), 0);
    const lCost = (qLabor || []).reduce((s, l) => s + Number(l.totalLaborCosts || 0), 0);
    const mCost = (qMedicine || []).reduce((s, m) => s + Number(m.totalAmountSpent || 0), 0) + (qHealth || []).reduce((s, h) => s + Number(h.cost || 0), 0);
    const eCost = (qExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    const pTotal = (qPurchases || []).reduce((s, p) => s + Number(p.purchasePrice || 0) + Number(p.transportCost || 0), 0);
    const rev = (qSales || []).reduce((s, x) => s + Number(x.salePrice || 0), 0);
    const rec = (qSales || []).reduce((s, x) => s + Number(x.outstandingDuesFromBuyer || 0), 0);
    const pay = (qPurchases || []).reduce((s, p) => s + Number(p.dueAmount || 0), 0);

    return { 
      totalSheep: Math.max(0, pCount - sCount - deadCount),
      totalTracked: (qTracked || []).length,
      totalExpenses: pTotal + fCost + mCost + lCost + eCost,
      totalSales: rev,
      totalDead: deadCount,
      totalFeedCost: fCost,
      totalLaborCost: lCost,
      totalMedicineCost: mCost,
      totalFarmExpenses: eCost,
      totalReceivables: rec,
      totalPayables: pay
    };
  }, [qDead, qPurchases, qSales, qFeed, qLabor, qMedicine, qHealth, qExpenses, qTracked]);

  const value = useMemo(() => ({
    purchases, addPurchase: (p: any) => upsert('livestockPurchases', undefined, p), updatePurchase: (id: string, p: any) => upsert('livestockPurchases', id, p), deletePurchase: (id: string) => remove('livestockPurchases', id),
    sales, addSale: (s: any) => upsert('animalSales', undefined, s), updateSale: (id: string, s: any) => upsert('animalSales', id, s), deleteSale: (id: string) => remove('animalSales', id),
    feedCosts, addFeedCost: (c: any) => upsert('feedExpenses', undefined, c), updateFeedCost: (id: string, c: any) => upsert('feedExpenses', id, c), deleteFeedCost: (id: string) => remove('feedExpenses', id),
    medicineExpenses, addMedicineExpense: (e: any) => upsert('medicineExpenses', undefined, e), updateMedicineExpense: (id: string, e: any) => upsert('medicineExpenses', id, e), deleteMedicineExpense: (id: string) => remove('medicineExpenses', id),
    laborCosts, addLaborCost: (c: any) => upsert('laborExpenses', undefined, c), updateLaborCost: (id: string, c: any) => upsert('laborExpenses', id, c), deleteLaborCost: (id: string) => remove('laborExpenses', id),
    trackedSheep, addTrackedSheep: (s: any) => upsert('trackedSheep', undefined, { ...s, createdAt: serverTimestamp() }), updateTrackedSheep: (id: string, s: any) => upsert('trackedSheep', id, s), deleteTrackedSheep: (id: string) => remove('trackedSheep', id),
    deadAnimals, addDeadAnimal: (a: any) => upsert('deadAnimals', undefined, a), updateDeadAnimal: (id: string, a: any) => upsert('deadAnimals', id, a), deleteDeadAnimal: (id: string) => remove('deadAnimals', id),
    farmExpenses, addFarmExpense: (e: any) => upsert('farmExpenses', undefined, e), updateFarmExpense: (id: string, e: any) => upsert('farmExpenses', id, e), deleteFarmExpense: (id: string) => remove('farmExpenses', id),
    healthTasks, addHealthTask: (t: any) => upsert('healthTasks', undefined, t), updateHealthTask: (id: string, t: any) => upsert('healthTasks', id, t), deleteHealthTask: (id: string) => remove('healthTasks', id),
    communitySales: qMarket, postToMarketplace, updateMarketplaceSale, deleteMarketplaceSale: (id: string) => deleteDocumentNonBlocking(doc(firestore!, 'communitySales', id)),
    isLoading: isLoadingProfile || (user && !isVerified) || lPurchases || lSales || lFeed || lMedicine || lLabor || lDead || lTracked || lExpenses || lHealth || lMarket,
    ...stats
  }), [
    purchases, sales, feedCosts, medicineExpenses, laborCosts, trackedSheep, deadAnimals, farmExpenses, healthTasks, qMarket, stats,
    isLoadingProfile, user, isVerified, lPurchases, lSales, lFeed, lMedicine, lLabor, lDead, lTracked, lExpenses, lHealth, lMarket,
    upsert, remove, postToMarketplace, updateMarketplaceSale, firestore
  ]);

  if (!mounted) return null;

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}
