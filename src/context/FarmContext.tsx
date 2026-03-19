
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { 
  FarmExpense, TrackedSheep, 
  UserProfile, BankLoan, CreditCard, PrivateDebt, MonthlyIncome, MonthlyExpense, PublicSale
} from '@/lib/types';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, query, collectionGroup, orderBy } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  farmExpenses: FarmExpense[] | null;
  addFarmExpense: (expense: Omit<FarmExpense, 'id' | '_path'>) => void;
  deleteFarmExpense: (id: string, path?: string) => void;
  updateFarmExpense: (id: string, data: Omit<FarmExpense, 'id' | '_path'>, path?: string) => void;
  
  trackedSheep: TrackedSheep[] | null;
  addTrackedSheep: (sheep: Omit<TrackedSheep, 'id' | '_path'>) => void;
  deleteTrackedSheep: (id: string, path?: string) => void;
  updateTrackedSheep: (id: string, data: Omit<TrackedSheep, 'id' | '_path'>, path?: string) => void;

  // Transaction Specialized Helpers
  feedCosts: any[] | null;
  addFeedCost: (f: any) => void;
  deleteFeedCost: (id: string, path?: string) => void;
  totalFeedCost: number;

  laborCosts: any[] | null;
  addLaborCost: (l: any) => void;
  deleteLaborCost: (id: string, path?: string) => void;
  updateLaborCost: (id: string, l: any, path?: string) => void;
  totalLaborCost: number;

  purchases: any[] | null;
  addPurchase: (p: any) => void;
  deletePurchase: (id: string, path?: string) => void;
  updatePurchase: (id: string, p: any, path?: string) => void;
  totalPurchaseCost: number;

  sales: any[] | null;
  addSale: (s: any) => void;
  deleteSale: (id: string, path?: string) => void;
  totalSales: number;

  healthTasks: any[] | null;
  addHealthTask: (h: any) => void;
  deleteHealthTask: (id: string, path?: string) => void;
  medicineExpenses: any[] | null;
  addMedicineExpense: (m: any) => void;
  deleteMedicineExpense: (id: string, path?: string) => void;
  totalMedicineCost: number;

  deadAnimals: any[] | null;
  addDeadAnimal: (d: any) => void;
  deleteDeadAnimal: (id: string, path?: string) => void;
  totalDead: number;

  // Private Financials
  bankLoans: BankLoan[] | null;
  addBankLoan: (loan: Omit<BankLoan, 'id' | '_path'>) => void;
  updateBankLoan: (id: string, data: any, path?: string) => void;
  deleteBankLoan: (id: string, path?: string) => void;

  creditCards: CreditCard[] | null;
  addCreditCard: (card: Omit<CreditCard, 'id' | '_path'>) => void;
  updateCreditCard: (id: string, data: any, path?: string) => void;
  deleteCreditCard: (id: string, path?: string) => void;

  privateDebts: PrivateDebt[] | null;
  addPrivateDebt: (debt: Omit<PrivateDebt, 'id' | '_path'>) => void;
  updatePrivateDebt: (id: string, data: any, path?: string) => void;
  deletePrivateDebt: (id: string, path?: string) => void;

  monthlyIncomes: MonthlyIncome[] | null;
  addMonthlyIncome: (income: Omit<MonthlyIncome, 'id' | '_path'>) => void;
  deleteMonthlyIncome: (id: string, path?: string) => void;

  monthlyExpenses: MonthlyExpense[] | null;
  addMonthlyExpense: (expense: Omit<MonthlyExpense, 'id' | '_path'>) => void;
  deleteMonthlyExpense: (id: string, path?: string) => void;

  communitySales: PublicSale[] | null;
  postToMarketplace: (sale: any) => void;
  updateMarketplaceSale: (id: string, data: any, path?: string) => void;
  deleteMarketplaceSale: (id: string, path?: string) => void;

  isLoading: boolean;
  isLoadingProfile: boolean;
  ledgerError: any | null;
  userRole: string | null;
  totalSheep: number;
  totalExpenses: number;
  totalLoanBalance: number;
  totalCreditCardDebt: number;
  totalPrivateDebt: number;
  totalMonthlyEmi: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

function generateId() {
  return typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const isVerified = useMemo(() => !isUserLoading && !isProfileLoading && (userProfile?.role === 'collaborator' || userProfile?.role === 'admin'), [userProfile, isUserLoading, isProfileLoading]);
  const isAdmin = useMemo(() => !isUserLoading && !isProfileLoading && userProfile?.role === 'admin', [userProfile, isUserLoading, isProfileLoading]);

  // Master Ledger - Unified transactions
  const eRef = useMemo(() => {
    if (!firestore || !isVerified) return null;
    return query(collectionGroup(firestore, 'farmExpenses'), orderBy('date', 'desc'));
  }, [firestore, isVerified]);

  const tRef = useMemo(() => {
    if (!firestore || !isVerified) return null;
    return query(collectionGroup(firestore, 'trackedSheep'), orderBy('tagId', 'asc'));
  }, [firestore, isVerified]);
  
  const blRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'bankLoans') : null, [firestore, user, isAdmin]);
  const ccRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'creditCards') : null, [firestore, user, isAdmin]);
  const pdRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'privateDebts') : null, [firestore, user, isAdmin]);
  const miRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyIncomes') : null, [firestore, user, isAdmin]);
  const meRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyExpenses') : null, [firestore, user, isAdmin]);
  const mkRef = useMemo(() => (firestore && user) ? collection(firestore, 'communitySales') : null, [firestore, user]);

  const { data: qExpenses, isLoading: lExpenses, error: eExpenses } = useCollection<FarmExpense>(eRef);
  const { data: qTracked, isLoading: lTracked } = useCollection<TrackedSheep>(tRef);
  const { data: qLoans, isLoading: lLoans } = useCollection<BankLoan>(blRef);
  const { data: qCards, isLoading: lCards } = useCollection<CreditCard>(ccRef);
  const { data: qDebts, isLoading: lDebts } = useCollection<PrivateDebt>(pdRef);
  const { data: qIncomes, isLoading: lIncomes } = useCollection<MonthlyIncome>(miRef);
  const { data: qMExpenses, isLoading: lMExpenses } = useCollection<MonthlyExpense>(meRef);
  const { data: qMarket, isLoading: lMarket } = useCollection<PublicSale>(mkRef);

  useEffect(() => { setMounted(true); }, []);

  const upsert = useCallback((col: string, id: string | undefined, data: any, path?: string) => {
    if (!user || !firestore) return;
    const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, col, id || generateId());
    setDocumentNonBlocking(docRef, { 
      ...data, 
      id: id || docRef.id, 
      updatedAt: serverTimestamp(), 
      createdBy: user.uid,
      creatorEmail: user.email,
      creatorName: user.displayName || 'Shepherd'
    }, { merge: true });
  }, [user, firestore]);

  const remove = useCallback((col: string, id: string, path?: string) => {
    if (!user || !firestore) return;
    const docRef = path ? doc(firestore, path) : doc(firestore, 'users', user.uid, col, id);
    deleteDocumentNonBlocking(docRef);
  }, [user, firestore]);

  // Derived Module Arrays
  const feedCosts = useMemo(() => (qExpenses || []).filter(e => e.category === 'Feed'), [qExpenses]);
  const laborCosts = useMemo(() => (qExpenses || []).filter(e => e.category === 'Labour'), [qExpenses]);
  const medicineExpenses = useMemo(() => (qExpenses || []).filter(e => e.category === 'Health' && e.subcategory !== 'Mortality'), [qExpenses]);
  const healthTasks = useMemo(() => (qExpenses || []).filter(e => e.category === 'Health'), [qExpenses]);
  const purchases = useMemo(() => (qExpenses || []).filter(e => e.category === 'Purchase'), [qExpenses]);
  const sales = useMemo(() => (qExpenses || []).filter(e => e.category === 'Sale'), [qExpenses]);
  const deadAnimals = useMemo(() => (qExpenses || []).filter(e => e.category === 'Health' && e.subcategory === 'Mortality'), [qExpenses]);

  // Derived Totals
  const totalExp = useMemo(() => (qExpenses || []).filter(e => e.category !== 'Sale').reduce((sum, e) => sum + (e.totalAmount || 0), 0), [qExpenses]);
  const totalRev = useMemo(() => (qExpenses || []).filter(e => e.category === 'Sale').reduce((sum, e) => sum + (e.totalAmount || 0), 0), [qExpenses]);
  const totalD = useMemo(() => deadAnimals.reduce((sum, e) => sum + (e.quantity || 0), 0), [deadAnimals]);
  const totalFeed = useMemo(() => feedCosts.reduce((s, e) => s + (e.totalAmount || 0), 0), [feedCosts]);
  const totalLabor = useMemo(() => laborCosts.reduce((s, e) => s + (e.totalAmount || 0), 0), [laborCosts]);
  const totalMed = useMemo(() => healthTasks.reduce((s, e) => s + (e.totalAmount || 0), 0), [healthTasks]);
  const totalP = useMemo(() => purchases.reduce((s, e) => s + (e.totalAmount || 0), 0), [purchases]);

  const value = useMemo(() => ({
    farmExpenses: qExpenses,
    addFarmExpense: (e: any) => upsert('farmExpenses', undefined, e),
    updateFarmExpense: (id: string, e: any, path?: string) => upsert('farmExpenses', id, e, path),
    deleteFarmExpense: (id: string, path?: string) => remove('farmExpenses', id, path),
    
    trackedSheep: qTracked,
    addTrackedSheep: (s: any) => upsert('trackedSheep', undefined, s),
    updateTrackedSheep: (id: string, s: any, path?: string) => upsert('trackedSheep', id, s, path),
    deleteTrackedSheep: (id: string, path?: string) => remove('trackedSheep', id, path),

    // Compatibility Helpers for Specialized Pages
    feedCosts, addFeedCost: (f: any) => upsert('farmExpenses', undefined, { ...f, category: 'Feed', totalAmount: f.cost }), deleteFeedCost: (id: string, path?: string) => remove('farmExpenses', id, path), totalFeedCost: totalFeed,
    laborCosts, addLaborCost: (l: any) => upsert('farmExpenses', undefined, { ...l, category: 'Labour', totalAmount: l.totalLaborCosts }), deleteLaborCost: (id: string, path?: string) => remove('farmExpenses', id, path), updateLaborCost: (id: string, l: any, path?: string) => upsert('farmExpenses', id, { ...l, totalAmount: l.totalLaborCosts }, path), totalLaborCost: totalLabor,
    purchases, addPurchase: (p: any) => upsert('farmExpenses', undefined, { ...p, category: 'Purchase', subcategory: 'Animal Purchase', totalAmount: p.purchasePrice, date: p.purchaseDate }), deletePurchase: (id: string, path?: string) => remove('farmExpenses', id, path), updatePurchase: (id: string, p: any, path?: string) => upsert('farmExpenses', id, { ...p, totalAmount: p.purchasePrice, date: p.purchaseDate }, path), totalPurchaseCost: totalP,
    sales, addSale: (s: any) => upsert('farmExpenses', undefined, { ...s, category: 'Sale', subcategory: 'Animal Sale', totalAmount: s.salePrice, date: s.saleDate }), deleteSale: (id: string, path?: string) => remove('farmExpenses', id, path), totalSales: totalRev,
    healthTasks, addHealthTask: (h: any) => upsert('farmExpenses', undefined, { ...h, category: 'Health', totalAmount: h.cost || 0 }), deleteHealthTask: (id: string, path?: string) => remove('farmExpenses', id, path),
    medicineExpenses, addMedicineExpense: (m: any) => upsert('farmExpenses', undefined, { ...m, category: 'Health', subcategory: 'Medicine', totalAmount: m.totalAmountSpent }), deleteMedicineExpense: (id: string, path?: string) => remove('farmExpenses', id, path), totalMedicineCost: totalMed,
    deadAnimals, addDeadAnimal: (d: any) => upsert('farmExpenses', undefined, { ...d, category: 'Health', subcategory: 'Mortality', totalAmount: 0, date: d.dateOfDeath }), deleteDeadAnimal: (id: string, path?: string) => remove('farmExpenses', id, path), totalDead: totalD,

    bankLoans: qLoans, addBankLoan: (l: any) => upsert('bankLoans', undefined, l), updateBankLoan: (id: string, l: any, path?: string) => upsert('bankLoans', id, l, path), deleteBankLoan: (id: string, path?: string) => remove('bankLoans', id, path),
    creditCards: qCards, addCreditCard: (c: any) => upsert('creditCards', undefined, c), updateCreditCard: (id: string, c: any, path?: string) => upsert('creditCards', id, c, path), deleteCreditCard: (id: string, path?: string) => remove('creditCards', id, path),
    privateDebts: qDebts, addPrivateDebt: (d: any) => upsert('privateDebts', undefined, d), updatePrivateDebt: (id: string, d: any, path?: string) => upsert('privateDebts', id, d, path), deletePrivateDebt: (id: string, path?: string) => remove('privateDebts', id, path),
    monthlyIncomes: qIncomes, addMonthlyIncome: (i: any) => upsert('monthlyIncomes', undefined, i), deleteMonthlyIncome: (id: string, path?: string) => remove('monthlyIncomes', id, path),
    monthlyExpenses: qMExpenses, addMonthlyExpense: (e: any) => upsert('monthlyExpenses', undefined, e), deleteMonthlyExpense: (id: string, path?: string) => remove('monthlyExpenses', id, path),
    communitySales: qMarket, postToMarketplace: (s: any) => upsert('communitySales', undefined, s, 'communitySales'), updateMarketplaceSale: (id: string, s: any, path?: string) => upsert('communitySales', id, s, path), deleteMarketplaceSale: (id: string, path?: string) => remove('communitySales', id, path),

    isLoading: !mounted || isUserLoading || isProfileLoading || lExpenses || lTracked || lMarket,
    isLoadingProfile: isProfileLoading,
    ledgerError: eExpenses,
    userRole: userProfile?.role || null,
    totalSheep: (qTracked || []).length,
    totalExpenses: totalExp,
    totalLoanBalance: (qLoans || []).reduce((s, l) => s + (l.balanceLoan || 0), 0),
    totalCreditCardDebt: (qCards || []).reduce((s, c) => s + (c.outstandingAmount || 0), 0),
    totalPrivateDebt: (qDebts || []).reduce((s, d) => s + (d.amount || 0), 0),
    totalMonthlyEmi: (qLoans || []).reduce((s, l) => s + (l.monthlyEmi || 0), 0),
  }), [qExpenses, eExpenses, qTracked, qLoans, qCards, qDebts, qIncomes, qMExpenses, qMarket, isUserLoading, isProfileLoading, lExpenses, lTracked, lLoans, lCards, lDebts, lIncomes, lMExpenses, lMarket, userProfile, totalExp, totalRev, totalD, totalFeed, totalLabor, totalMed, totalP, upsert, remove, mounted, feedCosts, laborCosts, medicineExpenses, healthTasks, purchases, sales, deadAnimals]);

  if (!mounted) return null;
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}
