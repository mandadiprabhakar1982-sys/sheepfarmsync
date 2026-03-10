'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { 
  LivestockPurchase, AnimalSale, FeedCost, MedicineExpense, LaborCost, 
  TrackedSheep, DeadAnimal, FarmExpense, HealthTask, PublicSale, UserProfile, 
  BankLoan, CreditCard, PrivateDebt, MonthlyIncome, MonthlyExpense 
} from '@/lib/types';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, query, collectionGroup } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  purchases: LivestockPurchase[] | null;
  addPurchase: (purchase: Omit<LivestockPurchase, 'id' | '_path'>) => void;
  deletePurchase: (id: string, path?: string) => void;
  updatePurchase: (id: string, data: Omit<LivestockPurchase, 'id' | '_path'>, path?: string) => void;
  
  sales: AnimalSale[] | null;
  addSale: (sale: Omit<AnimalSale, 'id' | '_path'>) => void;
  deleteSale: (id: string, path?: string) => void;
  updateSale: (id: string, data: Omit<AnimalSale, 'id' | '_path'>, path?: string) => void;
  
  feedCosts: FeedCost[] | null;
  addFeedCost: (cost: Omit<FeedCost, 'id' | '_path'>) => void;
  deleteFeedCost: (id: string, path?: string) => void;
  updateFeedCost: (id: string, data: Omit<FeedCost, 'id' | '_path'>, path?: string) => void;

  medicineExpenses: MedicineExpense[] | null;
  addMedicineExpense: (expense: Omit<MedicineExpense, 'id' | '_path'>) => void;
  deleteMedicineExpense: (id: string, path?: string) => void;
  updateMedicineExpense: (id: string, data: Omit<MedicineExpense, 'id' | '_path'>, path?: string) => void;

  laborCosts: LaborCost[] | null;
  addLaborCost: (cost: Omit<LaborCost, 'id' | '_path'>) => void;
  deleteLaborCost: (id: string, path?: string) => void;
  updateLaborCost: (id: string, data: Omit<LaborCost, 'id' | '_path'>, path?: string) => void;

  trackedSheep: TrackedSheep[] | null;
  addTrackedSheep: (sheep: Omit<TrackedSheep, 'id' | '_path'>) => void;
  deleteTrackedSheep: (id: string, path?: string) => void;
  updateTrackedSheep: (id: string, data: Omit<TrackedSheep, 'id' | '_path'>, path?: string) => void;

  deadAnimals: DeadAnimal[] | null;
  addDeadAnimal: (animal: Omit<DeadAnimal, 'id' | '_path'>) => void;
  deleteDeadAnimal: (id: string, path?: string) => void;
  updateDeadAnimal: (id: string, data: Omit<DeadAnimal, 'id' | '_path'>, path?: string) => void;

  farmExpenses: FarmExpense[] | null;
  addFarmExpense: (expense: Omit<FarmExpense, 'id' | '_path'>) => void;
  deleteFarmExpense: (id: string, path?: string) => void;
  updateFarmExpense: (id: string, data: Omit<FarmExpense, 'id' | '_path'>, path?: string) => void;
  
  healthTasks: HealthTask[] | null;
  addHealthTask: (task: Omit<HealthTask, 'id' | '_path'>) => void;
  deleteHealthTask: (id: string, path?: string) => void;
  updateHealthTask: (id: string, data: Omit<HealthTask, 'id' | '_path'>, path?: string) => void;

  bankLoans: BankLoan[] | null;
  addBankLoan: (loan: Omit<BankLoan, 'id' | '_path'>) => void;
  deleteBankLoan: (id: string, path?: string) => void;
  updateBankLoan: (id: string, data: Omit<BankLoan, 'id' | '_path'>, path?: string) => void;

  creditCards: CreditCard[] | null;
  addCreditCard: (card: Omit<CreditCard, 'id' | '_path'>) => void;
  deleteCreditCard: (id: string, path?: string) => void;
  updateCreditCard: (id: string, data: Omit<CreditCard, 'id' | '_path'>, path?: string) => void;

  privateDebts: PrivateDebt[] | null;
  addPrivateDebt: (debt: Omit<PrivateDebt, 'id' | '_path'>) => void;
  deletePrivateDebt: (id: string, path?: string) => void;
  updatePrivateDebt: (id: string, data: Omit<PrivateDebt, 'id' | '_path'>, path?: string) => void;

  monthlyIncomes: MonthlyIncome[] | null;
  addMonthlyIncome: (income: Omit<MonthlyIncome, 'id' | '_path'>) => void;
  deleteMonthlyIncome: (id: string, path?: string) => void;
  updateMonthlyIncome: (id: string, data: Omit<MonthlyIncome, 'id' | '_path'>, path?: string) => void;

  monthlyExpenses: MonthlyExpense[] | null;
  addMonthlyExpense: (expense: Omit<MonthlyExpense, 'id' | '_path'>) => void;
  deleteMonthlyExpense: (id: string, path?: string) => void;
  updateMonthlyExpense: (id: string, data: Omit<MonthlyExpense, 'id' | '_path'>, path?: string) => void;

  communitySales: PublicSale[] | null;
  postToMarketplace: (sale: Omit<PublicSale, 'id' | 'sellerId' | 'sellerEmail' | 'sellerName' | '_path'>) => void;
  deleteMarketplaceSale: (id: string, path?: string) => void;
  updateMarketplaceSale: (id: string, data: Partial<Omit<PublicSale, 'id' | 'sellerId' | '_path'>>, path?: string) => void;
  
  isLoading: boolean;
  isLoadingProfile: boolean;
  userRole: string | null;

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
  
  avgWeight: number;
  totalDailyFeed: number;

  totalLoanBalance: number;
  totalCreditCardDebt: number;
  totalPrivateDebt: number;
  totalMonthlyEmi: number;

  totalMonthlyIncome: number;
  totalMonthlyExpense: number;
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
  const { data: userProfile, isLoading: isProfileDocLoading } = useDoc<UserProfile>(userProfileRef);
  
  const isLoadingProfile = isProfileDocLoading || (user && !userProfile);
  
  const isVerified = useMemo(() => !isLoadingProfile && (userProfile?.role === 'collaborator' || userProfile?.role === 'admin'), [userProfile, isLoadingProfile]);
  const isAdmin = useMemo(() => !isLoadingProfile && userProfile?.role === 'admin', [userProfile, isLoadingProfile]);

  // Shared Operational Data
  const pRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'livestockPurchases')) : null, [firestore, isVerified]);
  const sRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'animalSales')) : null, [firestore, isVerified]);
  const fRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'feedExpenses')) : null, [firestore, isVerified]);
  const mRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'medicineExpenses')) : null, [firestore, isVerified]);
  const lRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'laborExpenses')) : null, [firestore, isVerified]);
  const dRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'deadAnimals')) : null, [firestore, isVerified]);
  const tRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'trackedSheep')) : null, [firestore, isVerified]);
  const eRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'farmExpenses')) : null, [firestore, isVerified]);
  const hRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'healthTasks')) : null, [firestore, isVerified]);
  
  // Private Financial Data
  const blRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'bankLoans') : null, [firestore, user, isAdmin]);
  const ccRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'creditCards') : null, [firestore, user, isAdmin]);
  const pdRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'privateDebts') : null, [firestore, user, isAdmin]);
  const miRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyIncomes') : null, [firestore, user, isAdmin]);
  const meRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyExpenses') : null, [firestore, user, isAdmin]);
  
  const mkRef = useMemo(() => (firestore && user) ? collection(firestore, 'communitySales') : null, [firestore, user]);

  const { data: qPurchases, isLoading: lPurchases } = useCollection<LivestockPurchase>(pRef);
  const { data: qSales, isLoading: lSales } = useCollection<AnimalSale>(sRef);
  const { data: qFeed, isLoading: lFeed } = useCollection<FeedCost>(fRef);
  const { data: qMedicine, isLoading: lMedicine } = useCollection<MedicineExpense>(mRef);
  const { data: qLabor, isLoading: lLabor } = useCollection<LaborCost>(lRef);
  const { data: qDead, isLoading: lDead } = useCollection<DeadAnimal>(dRef);
  const { data: qTracked, isLoading: lTracked } = useCollection<TrackedSheep>(tRef);
  const { data: qExpenses, isLoading: lExpenses } = useCollection<FarmExpense>(eRef);
  const { data: qHealth, isLoading: lHealth } = useCollection<HealthTask>(hRef);
  const { data: qLoans, isLoading: lLoans } = useCollection<BankLoan>(blRef);
  const { data: qCards, isLoading: lCards } = useCollection<CreditCard>(ccRef);
  const { data: qDebts, isLoading: lDebts } = useCollection<PrivateDebt>(pdRef);
  const { data: qIncomes, isLoading: lIncomes } = useCollection<MonthlyIncome>(miRef);
  const { data: qMExpenses, isLoading: lMExpenses } = useCollection<MonthlyExpense>(meRef);
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
  const trackedSheep = useMemo(() => qTracked ? [...qTracked].sort((a, b) => (a.tagId || '').localeCompare(b.tagId || '', undefined, { numeric: true, sensitivity: 'base' })) : null, [qTracked]);
  const farmExpenses = useMemo(() => sort(qExpenses, 'expenseDate'), [qExpenses, sort]);
  const healthTasks = useMemo(() => sort(qHealth, 'nextDueDate'), [qHealth, sort]);
  const bankLoans = useMemo(() => qLoans, [qLoans]);
  const creditCards = useMemo(() => qCards, [qCards]);
  const privateDebts = useMemo(() => qDebts, [qDebts]);
  const monthlyIncomes = useMemo(() => sort(qIncomes, 'date'), [qIncomes, sort]);
  const monthlyExpenses = useMemo(() => sort(qMExpenses, 'date'), [qMExpenses, sort]);

  const upsert = useCallback((col: string, id: string | undefined, data: any, path?: string) => {
    if (!user || !firestore) return;
    const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, col, id || generateId());
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: id || docRef.id, 
      createdBy: user.uid,
      creatorEmail: user.email || 'No Email',
      creatorName: user.displayName || 'Shepherd',
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }, [user, firestore]);

  const remove = useCallback((col: string, id: string, path?: string) => {
    if (!user || !firestore) return;
    const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, col, id);
    deleteDocumentNonBlocking(docRef);
  }, [user, firestore]);

  const postToMarketplace = useCallback((sale: any) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'communitySales', generateId());
    setDocumentNonBlocking(docRef, { ...sale, id: docRef.id, sellerId: user.uid, sellerEmail: user.email || 'No Email', sellerName: user.displayName || user.email?.split('@')[0] || 'Shepherd', updatedAt: serverTimestamp() }, { merge: true });
  }, [user, firestore]);

  const updateMarketplaceSale = useCallback((id: string, data: any, path?: string) => {
    if (!user || !firestore) return;
    const docRef = path ? doc(firestore, path) : doc(firestore, 'communitySales', id);
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
    
    const blBal = (qLoans || []).reduce((s, l) => s + Number(l.balanceLoan || 0), 0);
    const ccBal = (qCards || []).reduce((s, c) => s + Number(c.outstandingAmount || 0), 0);
    const pdBal = (qDebts || []).reduce((s, d) => s + Number(d.amount || 0), 0);
    const mEmiTotal = (qLoans || []).reduce((s, l) => s + Number(l.monthlyEmi || 0), 0);

    const mIncome = (qIncomes || []).reduce((s, i) => s + Number(i.amount || 0), 0);
    const mExpense = (qMExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);

    const trackedCount = (qTracked || []).length;
    const totalTrackedWeight = (qTracked || []).reduce((acc, s) => acc + Number(s.currentWeight || 0), 0);
    const avgWt = trackedCount > 0 ? totalTrackedWeight / trackedCount : 0;
    const dailyFeedTotal = (qTracked || []).reduce((acc, s) => acc + (Number(s.currentWeight || 0) * 0.04), 0);

    return { 
      totalSheep: Math.max(0, pCount - sCount - deadCount),
      totalTracked: trackedCount,
      totalExpenses: pTotal + fCost + mCost + lCost + eCost,
      totalSales: rev,
      totalDead: deadCount,
      totalFeedCost: fCost,
      totalLaborCost: lCost,
      totalMedicineCost: mCost,
      totalFarmExpenses: eCost,
      totalReceivables: rev > 0 ? rec : 0, 
      totalPayables: pay,
      avgWeight: avgWt,
      totalDailyFeed: dailyFeedTotal,
      totalLoanBalance: blBal,
      totalCreditCardDebt: ccBal,
      totalPrivateDebt: pdBal,
      totalMonthlyEmi: mEmiTotal,
      totalMonthlyIncome: mIncome,
      totalMonthlyExpense: mExpense
    };
  }, [qDead, qPurchases, qSales, qFeed, qLabor, qMedicine, qHealth, qExpenses, qTracked, qLoans, qCards, qDebts, qIncomes, qMExpenses]);

  const value = useMemo(() => ({
    purchases, addPurchase: (p: any) => upsert('livestockPurchases', undefined, p), updatePurchase: (id: string, p: any, path?: string) => upsert('livestockPurchases', id, p, path), deletePurchase: (id: string, path?: string) => remove('livestockPurchases', id, path),
    sales, addSale: (s: any) => upsert('animalSales', undefined, s), updateSale: (id: string, s: any, path?: string) => upsert('animalSales', id, s, path), deleteSale: (id: string, path?: string) => remove('animalSales', id, path),
    feedCosts, addFeedCost: (c: any) => upsert('feedExpenses', undefined, c), updateFeedCost: (id: string, c: any, path?: string) => upsert('feedExpenses', id, c, path), deleteFeedCost: (id: string, path?: string) => remove('feedExpenses', id, path),
    medicineExpenses, addMedicineExpense: (e: any) => upsert('medicineExpenses', undefined, e), updateMedicineExpense: (id: string, e: any, path?: string) => upsert('medicineExpenses', id, e, path), deleteMedicineExpense: (id: string, path?: string) => remove('medicineExpenses', id, path),
    laborCosts, addLaborCost: (c: any) => upsert('laborExpenses', undefined, c), updateLaborCost: (id: string, c: any, path?: string) => upsert('laborExpenses', id, c, path), deleteLaborCost: (id: string, path?: string) => remove('laborExpenses', id, path),
    trackedSheep, addTrackedSheep: (s: any) => upsert('trackedSheep', undefined, { ...s, createdAt: serverTimestamp() }), updateTrackedSheep: (id: string, s: any, path?: string) => upsert('trackedSheep', id, s, path), deleteTrackedSheep: (id: string, path?: string) => remove('trackedSheep', id, path),
    deadAnimals, addDeadAnimal: (a: any) => upsert('deadAnimals', undefined, a), updateDeadAnimal: (id: string, a: any, path?: string) => upsert('deadAnimals', id, a, path), deleteDeadAnimal: (id: string, path?: string) => remove('deadAnimals', id, path),
    farmExpenses, addFarmExpense: (e: any) => upsert('farmExpenses', undefined, e), updateFarmExpense: (id: string, e: any, path?: string) => upsert('farmExpenses', id, e, path), deleteFarmExpense: (id: string, path?: string) => remove('farmExpenses', id, path),
    healthTasks, addHealthTask: (t: any) => upsert('healthTasks', undefined, t), updateHealthTask: (id: string, t: any, path?: string) => upsert('healthTasks', id, t, path), deleteHealthTask: (id: string, path?: string) => remove('healthTasks', id, path),
    bankLoans, addBankLoan: (l: any) => upsert('bankLoans', undefined, l), updateBankLoan: (id: string, l: any, path?: string) => upsert('bankLoans', id, l, path), deleteBankLoan: (id: string, path?: string) => remove('bankLoans', id, path),
    creditCards, addCreditCard: (c: any) => upsert('creditCards', undefined, c), updateCreditCard: (id: string, c: any, path?: string) => upsert('creditCards', id, c, path), deleteCreditCard: (id: string, path?: string) => remove('creditCards', id, path),
    privateDebts, addPrivateDebt: (d: any) => upsert('privateDebts', undefined, d), updatePrivateDebt: (id: string, d: any, path?: string) => upsert('privateDebts', id, d, path), deletePrivateDebt: (id: string, path?: string) => remove('privateDebts', id, path),
    monthlyIncomes, addMonthlyIncome: (i: any) => upsert('monthlyIncomes', undefined, i), updateMonthlyIncome: (id: string, i: any, path?: string) => { if (!user || !firestore) return; const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, 'monthlyIncomes', id); updateDocumentNonBlocking(docRef, { ...i, updatedAt: serverTimestamp() }); }, deleteMonthlyIncome: (id: string, path?: string) => remove('monthlyIncomes', id, path),
    monthlyExpenses, addMonthlyExpense: (e: any) => upsert('monthlyExpenses', undefined, e), updateMonthlyExpense: (id: string, e: any, path?: string) => { if (!user || !firestore) return; const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, 'monthlyExpenses', id); updateDocumentNonBlocking(docRef, { ...e, updatedAt: serverTimestamp() }); }, deleteMonthlyExpense: (id: string, path?: string) => remove('monthlyExpenses', id, path),
    communitySales: qMarket, postToMarketplace, updateMarketplaceSale, deleteMarketplaceSale: (id: string, path?: string) => deleteDocumentNonBlocking(doc(firestore!, path || `communitySales/${id}`)),
    isLoading: isLoadingProfile || (user && !isVerified) || lPurchases || lSales || lFeed || lMedicine || lLabor || lDead || lTracked || lExpenses || lHealth || lLoans || lCards || lDebts || lIncomes || lMExpenses || lMarket,
    isLoadingProfile,
    userRole: userProfile?.role || null,
    ...stats
  }), [
    purchases, sales, feedCosts, medicineExpenses, laborCosts, trackedSheep, deadAnimals, farmExpenses, healthTasks, bankLoans, creditCards, privateDebts, monthlyIncomes, monthlyExpenses, qMarket, stats,
    isLoadingProfile, user, isVerified, lPurchases, lSales, lFeed, lMedicine, lLabor, lDead, lTracked, lExpenses, lHealth, lLoans, lCards, lDebts, lIncomes, lMExpenses, lMarket,
    userProfile, upsert, remove, postToMarketplace, updateMarketplaceSale, firestore, isAdmin
  ]);

  if (!mounted) return null;

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) throw new Error('useFarm must be used within a FarmProvider');
  return context;
}
