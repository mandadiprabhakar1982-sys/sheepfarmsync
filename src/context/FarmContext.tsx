'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { 
  LivestockPurchase, AnimalSale, FarmExpense, TrackedSheep, DeadAnimal, 
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

  bankLoans: BankLoan[] | null;
  addBankLoan: (loan: Omit<BankLoan, 'id' | '_path'>) => void;
  deleteBankLoan: (id: string, path?: string) => void;

  creditCards: CreditCard[] | null;
  addCreditCard: (card: Omit<CreditCard, 'id' | '_path'>) => void;
  deleteCreditCard: (id: string, path?: string) => void;

  privateDebts: PrivateDebt[] | null;
  addPrivateDebt: (debt: Omit<PrivateDebt, 'id' | '_path'>) => void;
  deletePrivateDebt: (id: string, path?: string) => void;

  monthlyIncomes: MonthlyIncome[] | null;
  addMonthlyIncome: (income: Omit<MonthlyIncome, 'id' | '_path'>) => void;
  deleteMonthlyIncome: (id: string, path?: string) => void;

  monthlyExpenses: MonthlyExpense[] | null;
  addMonthlyExpense: (expense: Omit<MonthlyExpense, 'id' | '_path'>) => void;
  deleteMonthlyExpense: (id: string, path?: string) => void;

  communitySales: PublicSale[] | null;
  postToMarketplace: (sale: any) => void;
  deleteMarketplaceSale: (id: string, path?: string) => void;

  isLoading: boolean;
  ledgerError: any | null;
  userRole: string | null;
  totalSheep: number;
  totalExpenses: number;
  totalSales: number;
  totalDead: number;
  totalLoanBalance: number;
  totalCreditCardDebt: number;
  totalPrivateDebt: number;
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
  
  // Private Financials
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

  const totalExp = useMemo(() => (qExpenses || []).filter(e => e.category !== 'Sale').reduce((sum, e) => sum + (e.totalAmount || 0), 0), [qExpenses]);
  const totalRev = useMemo(() => (qExpenses || []).filter(e => e.category === 'Sale').reduce((sum, e) => sum + (e.totalAmount || 0), 0), [qExpenses]);

  const value = useMemo(() => ({
    farmExpenses: qExpenses,
    addFarmExpense: (e: any) => upsert('farmExpenses', undefined, e),
    updateFarmExpense: (id: string, e: any, path?: string) => upsert('farmExpenses', id, e, path),
    deleteFarmExpense: (id: string, path?: string) => remove('farmExpenses', id, path),
    
    trackedSheep: qTracked,
    addTrackedSheep: (s: any) => upsert('trackedSheep', undefined, s),
    updateTrackedSheep: (id: string, s: any, path?: string) => upsert('trackedSheep', id, s, path),
    deleteTrackedSheep: (id: string, path?: string) => remove('trackedSheep', id, path),

    bankLoans: qLoans, addBankLoan: (l: any) => upsert('bankLoans', undefined, l), deleteBankLoan: (id: string, path?: string) => remove('bankLoans', id, path),
    creditCards: qCards, addCreditCard: (c: any) => upsert('creditCards', undefined, c), deleteCreditCard: (id: string, path?: string) => remove('creditCards', id, path),
    privateDebts: qDebts, addPrivateDebt: (d: any) => upsert('privateDebts', undefined, d), deletePrivateDebt: (id: string, path?: string) => remove('privateDebts', id, path),
    monthlyIncomes: qIncomes, addMonthlyIncome: (i: any) => upsert('monthlyIncomes', undefined, i), deleteMonthlyIncome: (id: string, path?: string) => remove('monthlyIncomes', id, path),
    monthlyExpenses: qMExpenses, addMonthlyExpense: (e: any) => upsert('monthlyExpenses', undefined, e), deleteMonthlyExpense: (id: string, path?: string) => remove('monthlyExpenses', id, path),
    communitySales: qMarket, postToMarketplace: (s: any) => upsert('communitySales', undefined, s, 'communitySales'), deleteMarketplaceSale: (id: string, path?: string) => remove('communitySales', id, path),

    isLoading: !mounted || isUserLoading || isProfileLoading || lExpenses || lTracked || lLoans || lCards || lDebts || lIncomes || lMExpenses || lMarket,
    ledgerError: eExpenses,
    userRole: userProfile?.role || null,
    totalSheep: (qTracked || []).length,
    totalExpenses: totalExp,
    totalSales: totalRev,
    totalDead: (qExpenses || []).filter(e => e.category === 'Health' && e.subcategory === 'Mortality').length, 
    totalLoanBalance: (qLoans || []).reduce((s, l) => s + (l.balanceLoan || 0), 0),
    totalCreditCardDebt: (qCards || []).reduce((s, c) => s + (c.outstandingAmount || 0), 0),
    totalPrivateDebt: (qDebts || []).reduce((s, d) => s + (d.amount || 0), 0),
  }), [qExpenses, eExpenses, qTracked, qLoans, qCards, qDebts, qIncomes, qMExpenses, qMarket, isUserLoading, isProfileLoading, lExpenses, lTracked, lLoans, lCards, lDebts, lIncomes, lMExpenses, lMarket, userProfile, totalExp, totalRev, upsert, remove, mounted]);

  if (!mounted) return null;
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}
