
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { 
  FarmExpense, TrackedSheep, 
  UserProfile, BankLoan, CreditCard, PrivateDebt, MonthlyIncome, MonthlyExpense, PublicSale
} from '@/lib/types';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, query, collectionGroup, orderBy } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface FarmContextType {
  farmExpenses: FarmExpense[] | null;
  addFarmExpense: (expense: any) => void;
  deleteFarmExpense: (id: string, path?: string) => void;
  updateFarmExpense: (id: string, data: any, path?: string) => void;
  
  // Specialized Data Streams (Derived from Master Ledger + Legacy)
  feedCosts: FarmExpense[];
  laborCosts: FarmExpense[];
  medicineExpenses: FarmExpense[];
  purchases: FarmExpense[];
  sales: FarmExpense[];
  deadAnimals: FarmExpense[];

  // Specialized Mutations
  addFeedCost: (data: any) => void;
  deleteFeedCost: (id: string, path?: string) => void;
  addLaborCost: (data: any) => void;
  deleteLaborCost: (id: string, path?: string) => void;
  updateLaborCost: (id: string, data: any, path?: string) => void;
  addPurchase: (data: any) => void;
  deletePurchase: (id: string, path?: string) => void;
  updatePurchase: (id: string, data: any, path?: string) => void;
  addSale: (data: any) => void;
  deleteSale: (id: string, path?: string) => void;
  addHealthTask: (data: any) => void;
  deleteHealthTask: (id: string, path?: string) => void;
  addMedicineExpense: (data: any) => void;
  deleteMedicineExpense: (id: string, path?: string) => void;
  addDeadAnimal: (data: any) => void;
  deleteDeadAnimal: (id: string, path?: string) => void;

  // Asset Tracking
  trackedSheep: TrackedSheep[] | null;
  addTrackedSheep: (sheep: Omit<TrackedSheep, 'id' | '_path'>) => void;
  deleteTrackedSheep: (id: string, path?: string) => void;
  updateTrackedSheep: (id: string, data: Omit<TrackedSheep, 'id' | '_path'>, path?: string) => void;

  // Totals
  totalFeedCost: number;
  totalLaborCost: number;
  totalPurchaseCost: number;
  totalMedicineCost: number;
  totalSales: number;
  totalDead: number;
  totalExpenses: number;

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

  // Master and Legacy Data Streams
  const eRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'farmExpenses'), orderBy('date', 'desc')) : null, [firestore, isVerified]);
  const feedLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'feedExpenses')) : null, [firestore, isVerified]);
  const laborLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'laborExpenses')) : null, [firestore, isVerified]);
  const medLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'medicineExpenses')) : null, [firestore, isVerified]);
  const purchaseLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'livestockPurchases')) : null, [firestore, isVerified]);
  const salesLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'animalSales')) : null, [firestore, isVerified]);
  const healthLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'healthTasks')) : null, [firestore, isVerified]);
  const deathLegacyRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'deadAnimals')) : null, [firestore, isVerified]);

  const tRef = useMemo(() => (firestore && isVerified) ? query(collectionGroup(firestore, 'trackedSheep'), orderBy('tagId', 'asc')) : null, [firestore, isVerified]);
  const blRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'bankLoans') : null, [firestore, user, isAdmin]);
  const ccRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'creditCards') : null, [firestore, user, isAdmin]);
  const pdRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'privateDebts') : null, [firestore, user, isAdmin]);
  const miRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyIncomes') : null, [firestore, user, isAdmin]);
  const meRef = useMemo(() => (firestore && user && isAdmin) ? collection(firestore, 'users', user.uid, 'monthlyExpenses') : null, [firestore, user, isAdmin]);
  const mkRef = useMemo(() => (firestore && user) ? collection(firestore, 'communitySales') : null, [firestore, user]);

  const { data: qExpenses, isLoading: lExpenses, error: eExpenses } = useCollection<FarmExpense>(eRef);
  const { data: qFeedLegacy } = useCollection(feedLegacyRef);
  const { data: qLaborLegacy } = useCollection(laborLegacyRef);
  const { data: qMedLegacy } = useCollection(medLegacyRef);
  const { data: qPurchaseLegacy } = useCollection(purchaseLegacyRef);
  const { data: qSalesLegacy } = useCollection(salesLegacyRef);
  const { data: qHealthLegacy } = useCollection(healthLegacyRef);
  const { data: qDeathLegacy } = useCollection(deathLegacyRef);

  const { data: qTracked, isLoading: lTracked } = useCollection<TrackedSheep>(tRef);
  const { data: qLoans, isLoading: lLoans } = useCollection<BankLoan>(blRef);
  const { data: qCards, isLoading: lCards } = useCollection<CreditCard>(ccRef);
  const { data: qDebts, isLoading: lDebts } = useCollection<PrivateDebt>(pdRef);
  const { data: qIncomes, isLoading: lIncomes } = useCollection<MonthlyIncome>(miRef);
  const { data: qMExpenses, isLoading: lMExpenses } = useCollection<MonthlyExpense>(meRef);
  const { data: qMarket, isLoading: lMarket } = useCollection<PublicSale>(mkRef);

  useEffect(() => { setMounted(true); }, []);

  // SCHEMA NORMALIZATION ENGINE
  const normalizedExpenses = useMemo(() => {
    const list: FarmExpense[] = [];
    
    // 1. Process New Unified Ledger
    (qExpenses || []).forEach(e => list.push(e));

    // 2. Normalize Feed Legacy
    (qFeedLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || e.expenseDate || '2024-01-01',
        category: 'Feed',
        subcategory: e.feedType || 'General',
        description: e.description || `Feed: ${e.feedType || 'Bulk'}`,
        quantity: e.quantity || 1,
        unitCost: e.unitCost || 0,
        totalAmount: e.totalAmount || e.cost || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 3. Normalize Labour Legacy
    (qLaborLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || e.expenseDate || '2024-01-01',
        category: 'Labour',
        subcategory: 'Staff Payment',
        description: e.description || `Labour: ${e.employeeName}`,
        quantity: e.numberOfLaborers || 1,
        unitCost: e.wages || 0,
        totalAmount: e.totalAmount || e.totalLaborCosts || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 4. Normalize Medicine Legacy
    (qMedLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || '2024-01-01',
        category: 'Health',
        subcategory: 'Pharma Bill',
        description: e.description || `Medicine: ${e.shopName}`,
        quantity: 1,
        unitCost: e.costOfMedicines || 0,
        totalAmount: e.totalAmount || e.totalAmountSpent || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 5. Normalize Purchase Legacy
    (qPurchaseLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || e.purchaseDate || '2024-01-01',
        category: 'Purchase',
        subcategory: 'Animal Purchase',
        description: e.description || `Buy: ${e.animalCount} from ${e.farmerName}`,
        quantity: e.animalCount || 1,
        unitCost: (e.purchasePrice || 0) / (e.animalCount || 1),
        totalAmount: e.totalAmount || e.purchasePrice || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 6. Normalize Sales Legacy
    (qSalesLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || e.saleDate || '2024-01-01',
        category: 'Sale',
        subcategory: 'Animal Sale',
        description: e.description || `Sell: ${e.animalCount} to ${e.buyerName}`,
        quantity: e.animalCount || 1,
        unitCost: (e.salePrice || 0) / (e.animalCount || 1),
        totalAmount: e.totalAmount || e.salePrice || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 7. Normalize Health Tasks Legacy
    (qHealthLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || '2024-01-01',
        category: 'Health',
        subcategory: e.healthType || 'Treatment',
        description: e.description || `Treat: ${e.medicineName} (ID: ${e.sheepId})`,
        quantity: 1,
        unitCost: e.cost || 0,
        totalAmount: e.totalAmount || e.cost || 0,
        paymentMode: e.paymentMode || 'Cash'
      });
    });

    // 8. Normalize Death Legacy
    (qDeathLegacy || []).forEach((e: any) => {
      list.push({
        id: e.id, _path: e._path,
        date: e.date || e.dateOfDeath || '2024-01-01',
        category: 'Health',
        subcategory: 'Mortality',
        description: e.description || `Dead: ${e.sheepCount} (Cause: ${e.causeOfDeath})`,
        quantity: e.sheepCount || 1,
        unitCost: 0,
        totalAmount: 0,
        paymentMode: 'Cash'
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [qExpenses, qFeedLegacy, qLaborLegacy, qMedLegacy, qPurchaseLegacy, qSalesLegacy, qHealthLegacy, qDeathLegacy]);

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

  // Derived Data Arrays from Normalized Master Stream
  const feedCosts = useMemo(() => normalizedExpenses.filter(e => e.category === 'Feed'), [normalizedExpenses]);
  const laborCosts = useMemo(() => normalizedExpenses.filter(e => e.category === 'Labour'), [normalizedExpenses]);
  const medicineExpenses = useMemo(() => normalizedExpenses.filter(e => e.category === 'Health' && e.subcategory !== 'Mortality'), [normalizedExpenses]);
  const purchases = useMemo(() => normalizedExpenses.filter(e => e.category === 'Purchase'), [normalizedExpenses]);
  const sales = useMemo(() => normalizedExpenses.filter(e => e.category === 'Sale'), [normalizedExpenses]);
  const deadAnimals = useMemo(() => normalizedExpenses.filter(e => e.category === 'Health' && e.subcategory === 'Mortality'), [normalizedExpenses]);

  const totals = useMemo(() => ({
    feed: feedCosts.reduce((s, e) => s + (e.totalAmount || 0), 0),
    labor: laborCosts.reduce((s, e) => s + (e.totalAmount || 0), 0),
    med: medicineExpenses.reduce((s, e) => s + (e.totalAmount || 0), 0),
    purchase: purchases.reduce((s, e) => s + (e.totalAmount || 0), 0),
    sales: sales.reduce((s, e) => s + (e.totalAmount || 0), 0),
    dead: deadAnimals.reduce((s, e) => s + (e.quantity || 0), 0),
    allExp: normalizedExpenses.filter(e => e.category !== 'Sale').reduce((s, e) => s + (e.totalAmount || 0), 0)
  }), [normalizedExpenses, feedCosts, laborCosts, medicineExpenses, purchases, sales, deadAnimals]);

  const value = useMemo(() => ({
    farmExpenses: normalizedExpenses,
    addFarmExpense: (e: any) => upsert('farmExpenses', undefined, e),
    updateFarmExpense: (id: string, e: any, path?: string) => upsert('farmExpenses', id, e, path),
    deleteFarmExpense: (id: string, path?: string) => {
      // Intelligently delete from correct collection based on path
      if (path) {
        const parts = path.split('/');
        const col = parts[parts.length - 2];
        const id = parts[parts.length - 1];
        remove(col, id, path);
      } else {
        remove('farmExpenses', id);
      }
    },
    
    feedCosts, laborCosts, medicineExpenses, purchases, sales, deadAnimals,

    addFeedCost: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Feed' }),
    deleteFeedCost: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),
    
    addLaborCost: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Labour', subcategory: 'Staff Payment', totalAmount: e.totalLaborCosts, description: `Labour: ${e.employeeName}` }),
    deleteLaborCost: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),
    updateLaborCost: (id: string, e: any, path?: string) => upsert(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, { ...e, totalAmount: e.totalLaborCosts }, path),

    addPurchase: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Purchase', subcategory: 'Animal Purchase', totalAmount: e.purchasePrice, description: `Buy: ${e.animalCount} from ${e.farmerName}`, date: e.purchaseDate }),
    deletePurchase: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),
    updatePurchase: (id: string, e: any, path?: string) => upsert(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, { ...e, totalAmount: e.purchasePrice, date: e.purchaseDate }, path),

    addSale: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Sale', subcategory: 'Animal Sale', totalAmount: e.salePrice, description: `Sell: ${e.animalCount} to ${e.buyerName}`, date: e.saleDate }),
    deleteSale: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),

    addHealthTask: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Health', subcategory: e.healthType, totalAmount: e.cost, description: `Treat: ${e.medicineName} (ID: ${e.sheepId})` }),
    deleteHealthTask: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),

    addMedicineExpense: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Health', subcategory: 'Pharma Bill', totalAmount: e.totalAmountSpent, description: `Bill: ${e.shopName}` }),
    deleteMedicineExpense: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),

    addDeadAnimal: (e: any) => upsert('farmExpenses', undefined, { ...e, category: 'Health', subcategory: 'Mortality', quantity: e.sheepCount, totalAmount: 0, description: `Dead: ${e.sheepCount} (Cause: ${e.causeOfDeath})`, date: e.dateOfDeath }),
    deleteDeadAnimal: (id: string, path?: string) => remove(path?.split('/')?.slice(-2, -1)[0] || 'farmExpenses', id, path),

    trackedSheep: qTracked,
    addTrackedSheep: (s: any) => upsert('trackedSheep', undefined, s),
    updateTrackedSheep: (id: string, s: any, path?: string) => upsert('trackedSheep', id, s, path),
    deleteTrackedSheep: (id: string, path?: string) => remove('trackedSheep', id, path),

    totalFeedCost: totals.feed,
    totalLaborCost: totals.labor,
    totalPurchaseCost: totals.purchase,
    totalMedicineCost: totals.med,
    totalSales: totals.sales,
    totalDead: totals.dead,
    totalExpenses: totals.allExp,

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
    totalLoanBalance: (qLoans || []).reduce((s, l) => s + (l.balanceLoan || 0), 0),
    totalCreditCardDebt: (qCards || []).reduce((s, c) => s + (c.outstandingAmount || 0), 0),
    totalPrivateDebt: (qDebts || []).reduce((s, d) => s + (d.amount || 0), 0),
    totalMonthlyEmi: (qLoans || []).reduce((s, l) => s + (l.monthlyEmi || 0), 0),
  }), [normalizedExpenses, eExpenses, feedCosts, laborCosts, medicineExpenses, purchases, sales, deadAnimals, qTracked, qLoans, qCards, qDebts, qIncomes, qMExpenses, qMarket, isUserLoading, isProfileLoading, lExpenses, lTracked, lLoans, lCards, lDebts, lIncomes, lMExpenses, lMarket, userProfile, totals, upsert, remove, mounted]);

  if (!mounted) return null;
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}
