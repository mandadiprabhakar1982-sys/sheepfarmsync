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
  Pencil, 
  ReceiptIndianRupee, 
  ShieldCheck,
  Plus,
  Loader2,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { differenceInMonths, isValid, parseISO, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HorizontalDatePicker } from '@/components/horizontal-date-picker';

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const { 
    bankLoans, addBankLoan, updateBankLoan, deleteBankLoan,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    privateDebts, addPrivateDebt, updatePrivateDebt, deletePrivateDebt,
    totalLoanBalance, totalCreditCardDebt, totalPrivateDebt, totalMonthlyEmi,
    isLoading
  } = useFarm();

  const [activeTab, setActiveTab] = useState('loans');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  const [bankName, setBankName] = useState('');
  const [totalLoan, setTotalLoan] = useState('');
  const [balanceLoan, setBalanceLoan] = useState('');
  const [totalTenure, setTotalTenure] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [pendingTenure, setPendingTenure] = useState('');
  const [interest, setInterest] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  
  const [cardDueDate, setCardDueDate] = useState<Date | undefined>(new Date());
  const [cardTotalLimit, setCardTotalLimit] = useState('');
  const [cardOutstanding, setCardOutstanding] = useState('');
  const [cardMinPayment, setCardMinPayment] = useState('');

  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [debtDate, setDebtDate] = useState<Date | undefined>(new Date());
  const [privateInterestRate, setPrivateInterestRate] = useState('');
  const [monthlyInterest, setMonthlyInterest] = useState('');
  const [yearlyInterest, setYearlyInterest] = useState('');

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isCardDatePickerOpen, setIsCardDatePickerOpen] = useState(false);
  const [isDebtDatePickerOpen, setIsDebtDatePickerOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (startDate && totalLoan && totalTenure && monthlyEmi) {
      const total = parseFloat(totalLoan);
      const tenure = parseFloat(totalTenure);
      const emi = parseFloat(monthlyEmi);
      const annualRate = parseFloat(interest) || 0;
      
      if (!isNaN(total) && !isNaN(tenure) && !isNaN(emi)) {
        const start = startDate;
        const now = new Date();
        const payDay = parseInt(paymentDate) || 1;
        let monthsPassed = Math.max(0, differenceInMonths(now, start));
        if (now.getDate() >= payDay) monthsPassed += 1;
        const calculatedPending = Math.max(0, tenure - monthsPassed);
        const r = annualRate / 12 / 100;
        let currentBalance = total;
        if (r > 0) {
          const factor = Math.pow(1 + r, monthsPassed);
          currentBalance = (total * factor) - (emi * (factor - 1) / r);
        } else {
          currentBalance = total - (monthsPassed * emi);
        }
        setPendingTenure(calculatedPending.toString());
        setBalanceLoan(Math.max(0, Math.round(currentBalance)).toString());
      }
    }
  }, [startDate, totalLoan, totalTenure, monthlyEmi, interest, paymentDate]);

  const sortedLoans = useMemo(() => {
    if (!bankLoans) return [];
    return [...bankLoans].sort((a, b) => parseInt(a.paymentDate || '0') - parseInt(b.paymentDate || '0'));
  }, [bankLoans]);

  const resetForms = () => {
    setBankName(''); setTotalLoan(''); setBalanceLoan(''); setTotalTenure('');
    setMonthlyEmi(''); setPendingTenure(''); setInterest(''); setPaymentDate('');
    setStartDate(new Date()); setPersonName(''); setAmount(''); setDebtDate(new Date());
    setPrivateInterestRate(''); setMonthlyInterest(''); setYearlyInterest('');
    setCardDueDate(new Date()); setCardTotalLimit(''); setCardOutstanding(''); setCardMinPayment('');
  };

  const handleAdd = () => {
    if (activeTab === 'loans') {
      if (!bankName || !totalLoan || !balanceLoan || !startDate) return;
      addBankLoan({ bankName, totalLoan: parseFloat(totalLoan), balanceLoan: parseFloat(balanceLoan), totalTenure: parseFloat(totalTenure || '0'), monthlyEmi: parseFloat(monthlyEmi || '0'), pendingTenure: parseFloat(pendingTenure || '0'), interest: parseFloat(interest || '0'), paymentDate, startDate: format(startDate, 'yyyy-MM-dd') });
    } else if (activeTab === 'cards') {
      if (!bankName || !cardOutstanding || !cardDueDate) return;
      addCreditCard({ bankName, dueDate: format(cardDueDate, 'yyyy-MM-dd'), totalLimit: parseFloat(cardTotalLimit || '0'), outstandingAmount: parseFloat(cardOutstanding), minimumPayment: parseFloat(cardMinPayment || '0') });
    } else if (activeTab === 'private') {
      if (!personName || !amount || !debtDate) return;
      addPrivateDebt({ personName, amount: parseFloat(amount), date: format(debtDate, 'yyyy-MM-dd'), interestRate: parseFloat(privateInterestRate || '0'), monthlyInterest: parseFloat(monthlyInterest || '0'), yearlyInterest: parseFloat(yearlyInterest || '0') });
    }
    toast({ title: "Account Synchronized", description: "Updated liabilities portfolio." });
    resetForms(); setIsEntryDialogOpen(false);
  };

  const handleEditClick = (item: any, type: string) => {
    setEditingItem({ ...item, _type: type });
    if (type === 'loan') {
      setBankName(item.bankName); setTotalLoan(item.totalLoan.toString());
      setBalanceLoan(item.balanceLoan.toString()); setTotalTenure(item.totalTenure.toString());
      setMonthlyEmi(item.monthlyEmi.toString()); setPendingTenure(item.pendingTenure.toString());
      setInterest(item.interest.toString()); setPaymentDate(item.paymentDate || ''); setStartDate(item.startDate ? parseISO(item.startDate) : new Date());
    } else if (type === 'card') {
      setBankName(item.bankName); setCardDueDate(item.dueDate ? parseISO(item.dueDate) : new Date());
      setCardTotalLimit(item.totalLimit.toString()); setCardOutstanding(item.outstandingAmount.toString());
      setCardMinPayment(item.minimumPayment.toString());
    } else if (type === 'private') {
      setPersonName(item.personName); setAmount(item.amount.toString());
      setDebtDate(item.date ? parseISO(item.date) : new Date()); setPrivateInterestRate(item.interestRate?.toString() || '');
      setMonthlyInterest(item.monthlyInterest?.toString() || ''); setYearlyInterest(item.yearlyInterest?.toString() || '');
    }
    setIsEditDialogOpen(true);
  };

  const getProgressClass = (val: number) => {
    if (val < 33) return "bg-rose-500";
    if (val < 66) return "bg-amber-500";
    return "bg-[#14d5c7]";
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader title="Debt & Loans" description="Precision Audit of Liabilities" className="mb-0" />
        <div className="flex items-center gap-4">
          <Button onClick={() => { resetForms(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-[#0FA5A0] hover:bg-[#176E6C] text-white gap-2 shadow-xl border-none"><PlusCircle className="h-5 w-5 text-white" /> Add Account</Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl"><ShieldCheck className="h-5 w-5 text-emerald-400" /><div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Debt</p><p className="text-xl font-black tracking-tight">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="premium-card p-8 flex items-center gap-6"><div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><ReceiptIndianRupee className="h-7 w-7" /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Monthly EMI</p><p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalMonthlyEmi.toLocaleString()}</p></div></Card>
        <Card className="premium-card p-8 flex items-center gap-6"><div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><Landmark className="h-7 w-7" /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Bank Loans</p><p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalLoanBalance.toLocaleString()}</p></div></Card>
        <Card className="premium-card p-8 flex items-center gap-6"><div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><CreditCard className="h-7 w-7" /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Card Debt</p><p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalCreditCardDebt.toLocaleString()}</p></div></Card>
        <Card className="premium-card p-8 flex items-center gap-6"><div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><Banknote className="h-7 w-7" /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Private Debt</p><p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalPrivateDebt.toLocaleString()}</p></div></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-10 p-1.5 bg-[#D7F2F1] rounded-2xl grid grid-cols-3 h-14 max-w-2xl mx-auto shadow-inner"><TabsTrigger value="loans" className="tab-trigger-tactical">Bank Loans</TabsTrigger><TabsTrigger value="cards" className="tab-trigger-tactical">Credit Cards</TabsTrigger><TabsTrigger value="private" className="tab-trigger-tactical">Private Debt</TabsTrigger></TabsList>
        <TabsContent value="loans" className="m-0">
          <Card className="premium-card overflow-hidden bg-white"><CardHeader className="bg-[#0FA5A0] text-white p-10 py-12"><div className="flex justify-between items-end"><div className="space-y-1"><div className="flex items-center gap-3"><Landmark className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Bank Loan Audit</CardTitle></div><CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em]">Real-time principal reduction tracking</CardDescription></div><p className="text-4xl font-black tracking-tighter">₹{totalLoanBalance.toLocaleString()}</p></div></CardHeader><div className="overflow-x-auto"><Table><TableHeader className="bg-[#0FA5A0] sticky top-0 z-10"><TableRow className="border-none hover:bg-transparent"><TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-white">Bank Name</TableHead><TableHead className="text-[10px] font-black uppercase text-white">Repayment Progress</TableHead><TableHead className="text-[10px] font-black uppercase text-right text-white">Principal Balance</TableHead><TableHead className="text-[10px] font-black uppercase text-right text-white">Next EMI</TableHead><TableHead className="w-[100px] text-white"></TableHead></TableRow></TableHeader><TableBody>{sortedLoans.map((loan) => { const progress = loan.totalLoan > 0 ? ((loan.totalLoan - loan.balanceLoan) / loan.totalLoan) * 100 : 0; return (<TableRow key={loan.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100"><TableCell className="pl-10 py-8"><span className="text-[16px] font-black text-[#2F4F4F]">{loan.bankName}</span></TableCell><TableCell className="min-w-[180px]"><div className="space-y-2 py-2"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest"><span className="text-[#2F4F4F]">{progress.toFixed(0)}% Repaid</span><span className="text-rose-600">{Math.round(loan.pendingTenure)} Mos Left</span></div><Progress value={progress} className="h-1.5 bg-neutral-100" indicatorClassName={getProgressClass(progress)} /></div></TableCell><TableCell className="text-right"><p className="text-[16px] font-black text-[#2F4F4F]">₹{loan.balanceLoan.toLocaleString()}</p><p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Of ₹{loan.totalLoan.toLocaleString()}</p></TableCell><TableCell className="text-right text-[16px] font-black text-[#2F4F4F]">₹{loan.monthlyEmi.toLocaleString()}</TableCell><TableCell className="pr-10 text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(loan, 'loan')} className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100"><Pencil className="h-4 w-4 text-[#0FA5A0]" /></Button></TableCell></TableRow>); })}</TableBody></Table></div></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0"><div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black uppercase text-white">Debt Entry</DialogTitle></div><DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new liability into portfolio</DialogDescription><DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose></DialogHeader>
          <div className="dialog-body space-y-6">
            <div className="min-h-[500px] space-y-6">
              {activeTab === 'loans' && (<div className="space-y-6">
                <div className="space-y-2"><Label className="form-label-tactical">Bank Identity</Label><Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="form-input-tactical" /></div>
                <div className="grid grid-cols-2 gap-4 mt-4"><div className="space-y-2"><Label className="form-label-tactical">Total Loan (₹)</Label><Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} className="form-input-tactical" /></div><div className="space-y-2"><Label className="form-label-tactical">Interest Rate %</Label><Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} className="form-input-tactical" /></div></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="form-label-tactical">Start Date</Label>
                    <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                          {startDate ? format(startDate, "MMM dd, yyyy") : "Pick date"}
                          <CalendarIcon className="h-4 w-4 opacity-20" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[90vw] sm:w-[450px] p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-visible"
                        align="start"
                        side="bottom"
                        sideOffset={8}
                      >
                        <HorizontalDatePicker 
                          selectedDate={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setIsStartDatePickerOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2"><Label className="form-label-tactical">Monthly EMI (₹)</Label><Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} className="form-input-tactical" /></div>
                </div>
              </div>)}
              {activeTab === 'cards' && (<div className="space-y-6">
                <div className="space-y-2"><Label className="form-label-tactical">Bank Identity</Label><Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="form-input-tactical" /></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="form-label-tactical">Next Due Date</Label>
                    <Popover open={isCardDatePickerOpen} onOpenChange={setIsCardDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                          {cardDueDate ? format(cardDueDate, "MMM dd, yyyy") : "Pick date"}
                          <CalendarIcon className="h-4 w-4 opacity-20" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[90vw] sm:w-[450px] p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-visible"
                        align="start"
                        side="bottom"
                        sideOffset={8}
                      >
                        <HorizontalDatePicker 
                          selectedDate={cardDueDate}
                          onSelect={(date) => {
                            setCardDueDate(date);
                            setIsCardDatePickerOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2"><Label className="form-label-tactical">Total Limit (₹)</Label><Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} className="form-input-tactical" /></div>
                </div>
                <div className="space-y-2"><Label className="form-label-tactical">Outstanding (₹)</Label><Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} className="form-input-tactical text-rose-600" /></div>
              </div>)}
              {activeTab === 'private' && (<div className="space-y-6">
                <div className="space-y-2"><Label className="form-label-tactical">Person Name</Label><Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Name" className="form-input-tactical" /></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2"><Label className="form-label-tactical">Amount (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input-tactical" /></div>
                  <div className="space-y-2">
                    <Label className="form-label-tactical">Debt Date</Label>
                    <Popover open={isDebtDatePickerOpen} onOpenChange={setIsDebtDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="form-input-tactical w-full text-left justify-between">
                          {debtDate ? format(debtDate, "MMM dd, yyyy") : "Pick date"}
                          <CalendarIcon className="h-4 w-4 opacity-20" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[90vw] sm:w-[450px] p-3 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] overflow-visible"
                        align="start"
                        side="bottom"
                        sideOffset={8}
                      >
                        <HorizontalDatePicker 
                          selectedDate={debtDate}
                          onSelect={(date) => {
                            setDebtDate(date);
                            setIsDebtDatePickerOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>)}
            </div>
          </div>
          <div className="p-6 shrink-0 border-t"><Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl border-none">Record Account</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
