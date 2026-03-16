'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Trash2, 
  Pencil, 
  Save, 
  X, 
  Info, 
  Calendar as CalendarIcon, 
  ReceiptIndianRupee, 
  Wand2, 
  Calculator, 
  ArrowRightLeft,
  ShieldCheck,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Maximize2,
  CalendarDays,
  Target,
  Clock
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { differenceInMonths, startOfMonth, isValid, parseISO, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const { 
    bankLoans, addBankLoan, updateBankLoan, deleteBankLoan,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    privateDebts, addPrivateDebt, updatePrivateDebt, deletePrivateDebt,
    totalLoanBalance, totalCreditCardDebt, totalPrivateDebt, totalMonthlyEmi
  } = useFarm();

  const [activeTab, setActiveTab] = useState('loans');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  // Form states
  const [bankName, setBankName] = useState('');
  const [totalLoan, setTotalLoan] = useState('');
  const [balanceLoan, setBalanceLoan] = useState('');
  const [totalTenure, setTotalTenure] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [pendingTenure, setPendingTenure] = useState('');
  const [interest, setInterest] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [startDate, setStartDate] = useState('');
  
  // Credit Card Form States
  const [cardDueDate, setCardDueDate] = useState('');
  const [cardTotalLimit, setCardTotalLimit] = useState('');
  const [cardOutstanding, setCardOutstanding] = useState('');
  const [cardMinPayment, setCardMinPayment] = useState('');

  // Private Debt Form States
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [debtDate, setDebtDate] = useState('');
  const [privateInterestRate, setPrivateInterestRate] = useState('');
  const [monthlyInterest, setMonthlyInterest] = useState('');
  const [yearlyInterest, setYearlyInterest] = useState('');

  // UI States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [isZoomViewOpen, setIsZoomViewOpen] = useState(false);

  // LOGICAL AUTOMATION: Bank Loan Amortization
  useEffect(() => {
    if (startDate && totalLoan && totalTenure && monthlyEmi) {
      const total = parseFloat(totalLoan);
      const tenure = parseFloat(totalTenure);
      const emi = parseFloat(monthlyEmi);
      const annualRate = parseFloat(interest) || 0;
      
      if (!isNaN(total) && !isNaN(tenure) && !isNaN(emi)) {
        const start = parseISO(startDate);
        if (!isValid(start)) return;

        const now = new Date();
        const payDay = parseInt(paymentDate) || 1;
        
        let monthsPassed = Math.max(0, differenceInMonths(now, start));
        if (now.getDate() >= payDay) {
          monthsPassed += 1;
        }
        
        const calculatedPending = Math.max(0, tenure - monthsPassed);
        const r = annualRate / 12 / 100;
        let currentBalance = total;
        
        if (r > 0) {
          const factor = Math.pow(1 + r, monthsPassed);
          currentBalance = (total * factor) - (emi * (factor - 1) / r);
        } else {
          currentBalance = total - (monthsPassed * emi);
        }
        
        const calculatedBalance = Math.max(0, Math.round(currentBalance));
        
        setPendingTenure(calculatedPending.toString());
        setBalanceLoan(calculatedBalance.toString());
      }
    }
  }, [startDate, totalLoan, totalTenure, monthlyEmi, interest, paymentDate]);

  // LOGICAL AUTOMATION: Private Debt Interest
  useEffect(() => {
    if (amount && privateInterestRate) {
      const pAmount = parseFloat(amount);
      const pRate = parseFloat(privateInterestRate);
      if (!isNaN(pAmount) && !isNaN(pRate)) {
        const calculatedMonthly = (pAmount * pRate) / 100;
        setMonthlyInterest(Math.round(calculatedMonthly).toString());
      }
    }
  }, [amount, privateInterestRate]);

  useEffect(() => {
    if (monthlyInterest && !isNaN(parseFloat(monthlyInterest))) {
      const calculatedYearly = parseFloat(monthlyInterest) * 12;
      setYearlyInterest(calculatedYearly.toString());
    }
  }, [monthlyInterest]);

  // LOGICAL AUTOMATION: Credit Card Min Pay
  useEffect(() => {
    if (cardOutstanding && !isNaN(parseFloat(cardOutstanding))) {
      const suggestedMin = Math.ceil(parseFloat(cardOutstanding) * 0.05);
      setCardMinPayment(suggestedMin.toString());
    }
  }, [cardOutstanding]);

  // SORTING
  const sortedLoans = useMemo(() => {
    if (!bankLoans) return [];
    return [...bankLoans].sort((a, b) => {
      const dayA = parseInt(a.paymentDate || '0');
      const dayB = parseInt(b.paymentDate || '0');
      return dayA - dayB;
    });
  }, [bankLoans]);

  const resetForms = () => {
    setBankName(''); setTotalLoan(''); setBalanceLoan(''); setTotalTenure('');
    setMonthlyEmi(''); setPendingTenure(''); setInterest(''); setPaymentDate('');
    setStartDate(''); setPersonName(''); setAmount(''); setDebtDate('');
    setPrivateInterestRate(''); setMonthlyInterest(''); setYearlyInterest('');
    setCardDueDate(''); setCardTotalLimit(''); setCardOutstanding(''); setCardMinPayment('');
  };

  const handleAdd = () => {
    if (activeTab === 'loans') {
      if (!bankName || !totalLoan || !balanceLoan) return;
      addBankLoan({ 
        bankName, totalLoan: parseFloat(totalLoan), balanceLoan: parseFloat(balanceLoan),
        totalTenure: parseFloat(totalTenure || '0'), monthlyEmi: parseFloat(monthlyEmi || '0'),
        pendingTenure: parseFloat(pendingTenure || '0'), interest: parseFloat(interest || '0'),
        paymentDate, startDate
      });
      toast({ title: "Account Logged", description: "Bank loan audit recorded." });
    } else if (activeTab === 'cards') {
      if (!bankName || !cardOutstanding) return;
      addCreditCard({ 
        bankName, dueDate: cardDueDate, totalLimit: parseFloat(cardTotalLimit || '0'),
        outstandingAmount: parseFloat(cardOutstanding), minimumPayment: parseFloat(cardMinPayment || '0')
      });
      toast({ title: "Account Logged", description: "Credit card audit recorded." });
    } else if (activeTab === 'private') {
      if (!personName || !amount) return;
      addPrivateDebt({ 
        personName, amount: parseFloat(amount), date: debtDate,
        interestRate: parseFloat(privateInterestRate || '0'),
        monthlyInterest: parseFloat(monthlyInterest || '0'),
        yearlyInterest: parseFloat(yearlyInterest || '0')
      });
      toast({ title: "Account Logged", description: "Private debt audit recorded." });
    }
    resetForms();
    setIsEntryDialogOpen(false);
  };

  const handleEditClick = (item: any, type: string) => {
    setEditingItem({ ...item, _type: type });
    if (type === 'loan') {
      setBankName(item.bankName); setTotalLoan(item.totalLoan.toString());
      setBalanceLoan(item.balanceLoan.toString()); setTotalTenure(item.totalTenure.toString());
      setMonthlyEmi(item.monthlyEmi.toString()); setPendingTenure(item.pendingTenure.toString());
      setInterest(item.interest.toString()); setPaymentDate(item.paymentDate || ''); setStartDate(item.startDate || '');
    } else if (type === 'card') {
      setBankName(item.bankName); setCardDueDate(item.dueDate || '');
      setCardTotalLimit(item.totalLimit.toString()); setCardOutstanding(item.outstandingAmount.toString());
      setCardMinPayment(item.minimumPayment.toString());
    } else if (type === 'private') {
      setPersonName(item.personName); setAmount(item.amount.toString());
      setDebtDate(item.date || ''); setPrivateInterestRate(item.interestRate?.toString() || '');
      setMonthlyInterest(item.monthlyInterest?.toString() || ''); setYearlyInterest(item.yearlyInterest?.toString() || '');
    }
    setIsEditDialogOpen(true);
  };

  const handleZoomClick = (item: any, type: string) => {
    setViewingItem({ ...item, _type: type });
    setIsZoomViewOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const path = editingItem._path;
    if (editingItem._type === 'loan') {
      updateBankLoan(editingItem.id, {
        bankName, totalLoan: parseFloat(totalLoan), balanceLoan: parseFloat(balanceLoan),
        totalTenure: parseFloat(totalTenure), monthlyEmi: parseFloat(monthlyEmi),
        pendingTenure: parseFloat(pendingTenure), interest: parseFloat(interest),
        paymentDate, startDate
      }, path);
    } else if (editingItem._type === 'card') {
      updateCreditCard(editingItem.id, {
        bankName, dueDate: cardDueDate, totalLimit: parseFloat(cardTotalLimit),
        outstandingAmount: parseFloat(cardOutstanding), minimumPayment: parseFloat(cardMinPayment)
      }, path);
    } else if (editingItem._type === 'private') {
      updatePrivateDebt(editingItem.id, {
        personName, amount: parseFloat(amount), date: debtDate,
        interestRate: parseFloat(privateInterestRate), monthlyInterest: parseFloat(monthlyInterest),
        yearlyInterest: parseFloat(yearlyInterest)
      }, path);
    }
    toast({ title: "Audit Updated", description: "Ledger record has been synchronized." });
    setIsEditDialogOpen(false); setEditingItem(null); resetForms();
  };

  const SummaryCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: number, icon: any, color: string, trend?: string }) => (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group transition-all hover:-translate-y-1">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
            {trend && <span className="text-[10px] font-black text-rose-500 flex items-center gap-0.5"><TrendingDown className="h-3 w-3" />{trend}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader
          title="Liability Portfolio"
          description="High-precision audit of institutional and private debt."
          className="mb-0"
        />
        
        <div className="flex items-center gap-4">
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForms(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl">
                <PlusCircle className="h-5 w-5 text-accent" />
                Ledger Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-xl font-black tracking-tight uppercase">Liability Entry</DialogTitle>
                </div>
                <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Update your active liability profile</DialogDescription>
              </DialogHeader>
              
              <div className="p-8 space-y-8">
                {activeTab === 'loans' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Account Details</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="h-14 rounded-2xl bg-neutral-50 border-none font-bold text-base px-6" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} placeholder="Total Loan Amount" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                        <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Int %" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Repayment Schedule</Label>
                      <div className="relative">
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6 pr-12" />
                        <Wand2 className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-20" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" value={totalTenure} onChange={(e) => setTotalTenure(e.target.value)} placeholder="Total Months" className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                        <Input type="number" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="EMI Day (1-31)" className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                      </div>
                      <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} placeholder="Monthly EMI Amount" className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-lg px-6" />
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex justify-between items-baseline">
                      <span className="text-2xl font-black tracking-tighter text-primary">₹{parseInt(balanceLoan || '0').toLocaleString()}</span>
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{pendingTenure || '0'} MOS REMAINING</span>
                    </div>
                  </div>
                )}

                {activeTab === 'cards' && (
                  <div className="space-y-6">
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Card Issuer (e.g. ICICI)" className="h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase opacity-40 ml-2">Total Limit</Label>
                        <Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} placeholder="₹0" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase opacity-40 ml-2">Due Date</Label>
                        <Input type="date" value={cardDueDate} onChange={(e) => setCardDueDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase opacity-40 ml-2">Outstanding Balance</Label>
                      <Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} placeholder="₹0" className="h-14 rounded-2xl bg-neutral-50 border-none font-black text-xl text-rose-600 px-6" />
                    </div>
                    <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-800/60">Suggested Min Pay (5%)</span>
                      <span className="font-black text-orange-800">₹{parseInt(cardMinPayment || '0').toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'private' && (
                  <div className="space-y-6">
                    <Input type="date" value={debtDate} onChange={(e) => setDebtDate(e.target.value)} className="h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6" />
                    <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Person Name" className="h-14 rounded-2xl bg-neutral-50 border-none font-bold px-6" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Debt Amount" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                      <Input type="number" value={privateInterestRate} onChange={(e) => setPrivateInterestRate(e.target.value)} placeholder="Rate %" step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                    </div>
                    <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-40 text-rose-900 leading-none mb-1">Monthly Interest</p>
                        <p className="text-xl font-black text-rose-900">₹{parseInt(monthlyInterest || '0').toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase opacity-40 text-rose-900 leading-none mb-1">Yearly Cost</p>
                        <p className="text-xl font-black text-rose-900">₹{parseInt(yearlyInterest || '0').toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleAdd} className="w-full h-16 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95">
                  <ShieldCheck className="mr-3 h-6 w-6 text-accent" />
                  Synchronize Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Liability</p>
              <p className="text-xl font-black tracking-tight">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard title="Monthly EMI Sum" value={totalMonthlyEmi} icon={ReceiptIndianRupee} color="bg-emerald-600" />
        <SummaryCard title="Bank Exposure" value={totalLoanBalance} icon={Landmark} color="bg-blue-600" trend="L-TERM" />
        <SummaryCard title="Card Utilization" value={totalCreditCardDebt} icon={CreditCard} color="bg-indigo-600" trend="REVOLV" />
        <SummaryCard title="Private Debt" value={totalPrivateDebt} icon={Banknote} color="bg-rose-600" trend="UNSEC" />
      </div>

      <div className="w-full">
        <Tabs defaultValue="loans" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 p-1.5 bg-white/50 backdrop-blur rounded-2xl grid grid-cols-3 h-14 max-w-2xl mx-auto shadow-sm border border-white/20">
            <TabsTrigger value="loans" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Institutional</TabsTrigger>
            <TabsTrigger value="cards" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Credit Lines</TabsTrigger>
            <TabsTrigger value="private" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Personal Debt</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-blue-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Landmark className="h-6 w-6" />
                      <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Amortized Ledger</CardTitle>
                    </div>
                    <CardDescription className="text-blue-100/60 text-xs font-black uppercase tracking-[0.2em]">Real-time principal reduction tracking</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalLoanBalance.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase pl-10 py-6">#</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Financial Institution</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Lifecycle Progress</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Principal Bal</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">EMI Split (Next)</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLoans.map((loan, idx) => {
                      const progress = loan.totalLoan > 0 ? ((loan.totalLoan - loan.balanceLoan) / loan.totalLoan) * 100 : 0;
                      const monthlyIntAmount = loan.balanceLoan * (loan.interest / 12 / 100);
                      const monthlyPrincipal = Math.max(0, (loan.monthlyEmi || 0) - monthlyIntAmount);
                      const currentMonthNum = Math.max(1, (loan.totalTenure - (loan.pendingTenure || 0)));
                      
                      return (
                        <TableRow 
                          key={loan.id} 
                          className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-neutral-100 active:scale-[0.995]"
                          onClick={() => handleZoomClick(loan, 'loan')}
                        >
                          <TableCell className="pl-10 py-8 text-[10px] font-black text-muted-foreground/40">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-[16px] font-black whitespace-nowrap">{loan.bankName}</span>
                              <span className="text-[9px] font-black text-blue-600 tracking-wider flex items-center gap-1 uppercase mt-1">
                                <ShieldCheck className="h-2 w-2" /> Month {Math.round(currentMonthNum)} of {loan.totalTenure}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="space-y-2 py-2">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1">
                                <span className="text-emerald-600">{progress.toFixed(0)}% Discharged</span>
                                <span className="text-orange-600">{Math.round(loan.pendingTenure)} Mos Left</span>
                              </div>
                              <Progress value={progress} className="h-1.5 bg-neutral-100" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-[16px] font-black tracking-tight text-neutral-900">₹{loan.balanceLoan.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Of ₹{loan.totalLoan.toLocaleString()}</p>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-emerald-600">P: ₹{Math.round(monthlyPrincipal).toLocaleString()}</span>
                              <span className="text-[10px] font-black text-rose-500">I: ₹{Math.round(monthlyIntAmount).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="pr-10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-600" onClick={() => handleEditClick(loan, 'loan')}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600" onClick={() => deleteBankLoan(loan.id, loan._path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!sortedLoans.length && <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic opacity-40 uppercase font-black text-[10px] tracking-widest">NO ACTIVE INSTITUTIONAL DEBT</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-indigo-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6" />
                      <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Revolving Lines</CardTitle>
                    </div>
                    <CardDescription className="text-indigo-100/60 text-xs font-black uppercase tracking-[0.2em]">Active Credit Card Utilization Audit</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalCreditCardDebt.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Issuer</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-center">Utilization</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Due Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Limit</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Outstanding</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditCards?.map((card) => {
                      const usage = card.totalLimit > 0 ? (card.outstandingAmount / card.totalLimit) * 100 : 0;
                      return (
                        <TableRow 
                          key={card.id} 
                          className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-neutral-100 active:scale-[0.995]"
                          onClick={() => handleZoomClick(card, 'card')}
                        >
                          <TableCell className="pl-10 py-8 text-[16px] font-black whitespace-nowrap">{card.bankName}</TableCell>
                          <TableCell className="min-w-[160px]">
                             <div className="space-y-1.5 px-4">
                                <div className="flex justify-between text-[8px] font-black uppercase">
                                  <span className={usage > 80 ? "text-rose-600" : "text-muted-foreground"}>{usage.toFixed(0)}% USED</span>
                                </div>
                                <Progress value={usage} className={cn("h-1.5", usage > 80 ? "bg-red-100" : "bg-neutral-100")} />
                             </div>
                          </TableCell>
                          <TableCell className="text-[10px] font-black text-muted-foreground uppercase">{card.dueDate || 'N/A'}</TableCell>
                          <TableCell className="text-right text-[10px] font-bold text-muted-foreground">₹{(card.totalLimit || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-[16px] font-black text-rose-600">₹{card.outstandingAmount.toLocaleString()}</TableCell>
                          <TableCell className="pr-10 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => handleEditClick(card, 'card')}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600" onClick={() => deleteCreditCard(card.id, card._path)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!creditCards?.length && <TableRow><TableCell colSpan={6} className="text-center py-20 opacity-40 italic uppercase font-black text-[10px] tracking-widest">NO REVOLVING DEBT LOGGED</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-rose-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-6 w-6" />
                      <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Unsecured Debt</CardTitle>
                    </div>
                    <CardDescription className="text-rose-100/60 text-xs font-black uppercase tracking-[0.2em]">Personal & Non-Bank Interest Tracking</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalPrivateDebt.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Established</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Lender</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-center">Rate (%)</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Monthly Int.</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Total Amount</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {privateDebts?.map((debt) => (
                      <TableRow 
                        key={debt.id} 
                        className="group hover:bg-neutral-50 transition-all cursor-zoom-in border-neutral-100 active:scale-[0.995]"
                        onClick={() => handleZoomClick(debt, 'private')}
                      >
                        <TableCell className="pl-10 py-8 text-[10px] font-black text-muted-foreground uppercase">{debt.date || 'N/A'}</TableCell>
                        <TableCell className="text-[16px] font-black">{debt.personName}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase">
                            {debt.interestRate}% P.M.
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-[14px] font-black text-rose-600">₹{(debt.monthlyInterest || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[16px] font-black">₹{debt.amount.toLocaleString()}</TableCell>
                        <TableCell className="pr-10 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-neutral-100" onClick={() => handleEditClick(debt, 'private')}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600" onClick={() => deletePrivateDebt(debt.id, debt._path)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!privateDebts?.length && <TableRow><TableCell colSpan={6} className="text-center py-20 opacity-40 italic uppercase font-black text-[10px] tracking-widest">NO UNSECURED PRIVATE DEBT</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isZoomViewOpen} onOpenChange={setIsZoomViewOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-neutral-50">
          {viewingItem && (
            <div className="flex flex-col h-full">
              <DialogHeader className={cn(
                "p-12 text-white relative",
                viewingItem._type === 'loan' ? "bg-blue-600" : 
                viewingItem._type === 'card' ? "bg-indigo-600" : "bg-rose-600"
              )}>
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Maximize2 className="h-48 w-48 rotate-12" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em]">Audit Grade Insight</Badge>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">ID: {viewingItem.id.slice(0, 8)}</span>
                  </div>
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">{viewingItem.bankName || viewingItem.personName}</h2>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] mt-2">Verified Operational Liability</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Monthly Lifecycle</p>
                        <h3 className="text-xl font-black tracking-tight text-neutral-900">31-Day Temporal Node</h3>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <div className="relative pt-4 pb-8">
                      <div className="flex justify-between items-end h-16 gap-1">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1;
                          const isToday = new Date().getDate() === day;
                          const isPayDay = parseInt(viewingItem.paymentDate || viewingItem.dueDate?.split('-')[2] || '0') === day;
                          
                          return (
                            <div key={day} className="flex flex-col items-center flex-1 gap-2">
                              {isPayDay && <Target className="h-3 w-3 text-rose-500 animate-pulse mb-1" />}
                              <div className={cn(
                                "w-full rounded-full transition-all duration-500",
                                isToday ? "h-12 bg-primary shadow-lg shadow-primary/20" : 
                                isPayDay ? "h-10 bg-rose-500" : "h-4 bg-slate-100"
                              )} />
                              <span className={cn(
                                "text-[7px] font-black",
                                isToday ? "text-primary" : 
                                isPayDay ? "text-rose-500" : "text-slate-300"
                              )}>{day}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-8 flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-rose-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Due Date (31-1 Cycle)</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-none shadow-xl rounded-[2.5rem] bg-neutral-900 text-white p-8 flex flex-col justify-between">
                    <Target className="h-8 w-8 text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Principal Bal</p>
                      <p className="text-3xl font-black tracking-tighter leading-none mb-4">₹{(viewingItem.balanceLoan || viewingItem.outstandingAmount || viewingItem.amount).toLocaleString()}</p>
                      <Progress 
                        value={viewingItem.totalLoan ? ((viewingItem.totalLoan - viewingItem.balanceLoan) / viewingItem.totalLoan) * 100 : 50} 
                        className="h-1 bg-white/10" 
                      />
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Int Rate", val: `${viewingItem.interest || viewingItem.interestRate || '0'}%`, icon: TrendingDown },
                    { label: "Tenure", val: `${viewingItem.totalTenure || 'N/A'} Mos`, icon: CalendarDays },
                    { label: "Monthly EMI", val: `₹${(viewingItem.monthlyEmi || viewingItem.minimumPayment || viewingItem.monthlyInterest || '0').toLocaleString()}`, icon: ReceiptIndianRupee },
                    { label: "Est. Start", val: viewingItem.startDate || viewingItem.date || 'N/A', icon: Target },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{stat.label}</p>
                        <p className="text-sm font-black text-slate-900">{stat.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-12 pt-0 mt-auto flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsZoomViewOpen(false)} className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest">Close Audit</Button>
                <Button onClick={() => { setIsZoomViewOpen(false); handleEditClick(viewingItem, viewingItem._type); }} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest gap-2">
                  <Pencil className="h-4 w-4" /> Adjust Parameters
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">Update Audit Record</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Adjust financial liability parameters</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            {editingItem?._type === 'loan' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">EMI Day</Label>
                    <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Amount</Label>
                    <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Interest Rate (%)</Label>
                    <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Monthly EMI</Label>
                    <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-rose-600">Current Balance</Label>
                    <Input type="number" value={balanceLoan} onChange={(e) => setBalanceLoan(e.target.value)} className="h-12 rounded-xl bg-rose-50 border-none font-black text-rose-600" />
                  </div>
                </div>
              </div>
            )}

            {editingItem?._type === 'card' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Issuer</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Due Date</Label>
                    <Input type="date" value={cardDueDate} onChange={(e) => setCardDueDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Limit</Label>
                    <Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Outstanding Amount</Label>
                  <Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} className="h-14 rounded-2xl bg-rose-50 border-none font-black text-xl text-rose-600 px-6" />
                </div>
              </div>
            )}

            {editingItem?._type === 'private' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Date</Label>
                    <Input type="date" value={debtDate} onChange={(e) => setDebtDate(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Int Rate %</Label>
                    <Input type="number" value={privateInterestRate} onChange={(e) => setPrivateInterestRate(e.target.value)} step="0.1" className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Lender Name</Label>
                  <Input value={personName} onChange={(e) => setPersonName(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Total Amount</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl bg-neutral-50 border-none font-black" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-neutral-50 gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold border-neutral-200">Cancel</Button>
            <Button onClick={handleSaveEdit} className="h-12 px-10 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="mr-2 h-4 w-4 text-accent" /> Save Audit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
