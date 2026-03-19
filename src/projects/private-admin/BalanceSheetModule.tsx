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
  ShieldCheck,
  Plus,
  Loader2,
  X,
  Calendar as CalendarIcon,
  ReceiptIndianRupee
} from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { differenceInMonths, format } from 'date-fns';
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

export function BalanceSheetModule() {
  const { toast } = useToast();
  const { 
    bankLoans, addBankLoan, 
    creditCards, addCreditCard, 
    privateDebts, addPrivateDebt, 
    totalLoanBalance, totalCreditCardDebt, totalPrivateDebt, totalMonthlyEmi,
    isLoading, userRole
  } = useFarm();

  const isAdmin = userRole === 'admin';

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
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  
  const [cardDueDate, setCardDueDate] = useState<Date | undefined>(new Date());
  const [cardTotalLimit, setCardTotalLimit] = useState('');
  const [cardOutstanding, setCardOutstanding] = useState('');
  const [cardMinPayment, setCardMinPayment] = useState('');

  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [debtDate, setDebtDate] = useState<Date | undefined>(new Date());
  const [monthlyInterest, setMonthlyInterest] = useState('');
  const [yearlyInterest, setYearlyInterest] = useState('');

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isCardDatePickerOpen, setIsCardDatePickerOpen] = useState(false);
  const [isDebtDatePickerOpen, setIsDebtDatePickerOpen] = useState(false);

  // Auto-calculation logic for loans
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

  const resetForms = () => {
    setBankName(''); setTotalLoan(''); setBalanceLoan(''); setTotalTenure('');
    setMonthlyEmi(''); setPendingTenure(''); setInterest(''); setPaymentDate('');
    setStartDate(new Date()); setPersonName(''); setAmount(''); setDebtDate(new Date());
    setMonthlyInterest(''); setYearlyInterest('');
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
      addPrivateDebt({ personName, amount: parseFloat(amount), date: format(debtDate, 'yyyy-MM-dd'), monthlyInterest: parseFloat(monthlyInterest || '0'), yearlyInterest: parseFloat(yearlyInterest || '0') });
    }
    toast({ title: "Account Synchronized", description: "Liability portfolio updated." });
    resetForms(); setIsEntryDialogOpen(false);
  };

  const getProgressClass = (val: number) => {
    if (val < 33) return "bg-rose-500";
    if (val < 66) return "bg-amber-500";
    return "bg-[#14d5c7]";
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <Landmark className="h-16 w-16 text-rose-500 mb-6 opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Private Financial Ledger</h2>
        <p className="text-slate-400 font-bold text-sm mt-2 max-w-sm">This portfolio is restricted to the administrative identity. System stealth protocol active.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#14d5c7]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader title="Debit & Credit" description="Precision Liability Audit" className="mb-0" />
        <div className="flex items-center gap-4">
          <Button onClick={() => { resetForms(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-[#0FA5A0] hover:bg-[#176E6C] text-white gap-2 shadow-xl border-none">
            <PlusCircle className="h-5 w-5 text-white" /> Add Account
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Debt</p>
              <p className="text-xl font-black tracking-tight">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-8 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><ReceiptIndianRupee className="h-7 w-7" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Monthly EMI</p>
            <p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalMonthlyEmi.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-8 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><Landmark className="h-7 w-7" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Bank Loans</p>
            <p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalLoanBalance.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-8 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><CreditCard className="h-7 w-7" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Card Debt</p>
            <p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalCreditCardDebt.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-8 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-[#D7F2F1] text-[#0FA5A0] shadow-sm"><Banknote className="h-7 w-7" /></div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Private Debt</p>
            <p className="text-3xl font-black tracking-tighter text-[#2F4F4F]">₹{totalPrivateDebt.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-10 p-1.5 bg-[#D7F2F1] rounded-2xl grid grid-cols-3 h-14 max-w-2xl mx-auto shadow-inner">
          <TabsTrigger value="loans" className="font-black text-[10px] uppercase tracking-widest">Bank Loans</TabsTrigger>
          <TabsTrigger value="cards" className="font-black text-[10px] uppercase tracking-widest">Credit Cards</TabsTrigger>
          <TabsTrigger value="private" className="font-black text-[10px] uppercase tracking-widest">Private Debt</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="m-0">
          <Card className="overflow-hidden bg-white">
            <CardHeader className="bg-[#0FA5A0] text-white p-10 py-12">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-6 w-6" />
                    <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Bank Loan Registry</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em]">Real-time principal reduction tracking</CardDescription>
                </div>
                <p className="text-4xl font-black tracking-tighter">₹{totalLoanBalance.toLocaleString()}</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0FA5A0] sticky top-0 z-10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-white">Bank Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-white">Repayment Progress</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right text-white">Principal Balance</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right text-white">Monthly EMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankLoans && bankLoans.length > 0 ? bankLoans.map((loan) => { 
                    const progress = loan.totalLoan > 0 ? ((loan.totalLoan - loan.balanceLoan) / loan.totalLoan) * 100 : 0; 
                    return (
                      <TableRow key={loan.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <TableCell className="pl-10 py-8">
                          <span className="text-[16px] font-black text-[#2F4F4F]">{loan.bankName}</span>
                        </TableCell>
                        <TableCell className="min-w-[180px]">
                          <div className="space-y-2 py-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                              <span className="text-[#2F4F4F]">{progress.toFixed(0)}% Repaid</span>
                              <span className="text-rose-600">{Math.round(loan.pendingTenure)} Months Left</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-neutral-100" indicatorClassName={getProgressClass(progress)} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-[16px] font-black text-[#2F4F4F]">₹{loan.balanceLoan.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Of ₹{loan.totalLoan.toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="text-right text-[16px] font-black text-[#2F4F4F]">
                          ₹{loan.monthlyEmi.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ); 
                  }) : (
                    <TableRow><TableCell colSpan={4} className="py-20 text-center opacity-20 font-black uppercase text-xs">No active bank loans</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="m-0">
          <Card className="overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10 py-12">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-[#14d5c7]" />
                    <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Card Portfolio</CardTitle>
                  </div>
                  <CardDescription className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em]">High-interest debt auditing</CardDescription>
                </div>
                <p className="text-4xl font-black tracking-tighter text-[#14d5c7]">₹{totalCreditCardDebt.toLocaleString()}</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-white">Card Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-white">Utilization</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right text-white">Outstanding</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right text-white">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCards && creditCards.length > 0 ? creditCards.map((card) => {
                    const utilization = card.totalLimit > 0 ? (card.outstandingAmount / card.totalLimit) * 100 : 0;
                    return (
                      <TableRow key={card.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <TableCell className="pl-10 py-8"><span className="text-[16px] font-black text-[#2F4F4F]">{card.bankName}</span></TableCell>
                        <TableCell className="min-w-[180px]">
                          <div className="space-y-2 py-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                              <span className="text-[#2F4F4F]">{utilization.toFixed(0)}% Limit Used</span>
                            </div>
                            <Progress value={utilization} className="h-1.5 bg-neutral-100" indicatorClassName={utilization > 80 ? "bg-rose-500" : "bg-emerald-500"} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><span className="text-[16px] font-black text-rose-600">₹{card.outstandingAmount.toLocaleString()}</span></TableCell>
                        <TableCell className="text-right text-[14px] font-bold text-slate-400">{card.dueDate}</TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow><TableCell colSpan={4} className="py-20 text-center opacity-20 font-black uppercase text-xs">No active card debt</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="private" className="m-0">
          <Card className="overflow-hidden bg-white">
            <CardHeader className="bg-emerald-900 text-white p-10 py-12">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-6 w-6" />
                    <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase text-white">Private Ledger</CardTitle>
                  </div>
                  <CardDescription className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em]">Interest-bearing personal debt</CardDescription>
                </div>
                <p className="text-4xl font-black tracking-tighter">₹{totalPrivateDebt.toLocaleString()}</p>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-emerald-900">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase py-6 pl-10 text-white">Counterparty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-white">Enrollment Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-right text-white">Principal Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privateDebts && privateDebts.length > 0 ? privateDebts.map((debt) => (
                    <TableRow key={debt.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100">
                      <TableCell className="pl-10 py-8"><span className="text-[16px] font-black text-[#2F4F4F]">{debt.personName}</span></TableCell>
                      <TableCell className="text-[14px] font-bold text-slate-400">{debt.date || 'Legacy'}</TableCell>
                      <TableCell className="text-right text-[18px] font-black text-[#2F4F4F]">₹{debt.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} className="py-20 text-center opacity-20 font-black uppercase text-xs">No private debts recorded</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-0 overflow-visible border-none shadow-2xl bg-white h-[88dvh] max-h-[88dvh] flex flex-col">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#0FA5A0]/20 text-[#0FA5A0]">
                <Plus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black uppercase text-white">Debt Entry</DialogTitle>
            </div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new liability into portfolio</DialogDescription>
            <DialogClose className="absolute right-6 top-6 text-white/40"><X className="h-5 w-5" /></DialogClose>
          </DialogHeader>
          <div className="p-8 overflow-y-auto no-scrollbar flex-1">
            <div className="min-h-[500px] space-y-6">
              {activeTab === 'loans' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Bank Identity</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Total Loan (₹)</Label>
                      <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Interest Rate %</Label>
                      <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Start Date</Label>
                      <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none font-bold w-full text-left justify-between">
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <HorizontalDatePicker selectedDate={startDate} onSelect={(date) => { setStartDate(date); setIsStartDatePickerOpen(false); }} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Tenure (Months)</Label>
                      <Input type="number" value={totalTenure} onChange={(e) => setTotalTenure(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Monthly EMI (₹)</Label>
                      <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Payment Day</Label>
                      <Input type="number" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="5" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'cards' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Bank Identity</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Next Due Date</Label>
                      <Popover open={isCardDatePickerOpen} onOpenChange={setIsCardDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none font-bold w-full text-left justify-between">
                            {cardDueDate ? format(cardDueDate, "MMM dd, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <HorizontalDatePicker selectedDate={cardDueDate} onSelect={(date) => { setCardDueDate(date); setIsCardDatePickerOpen(false); }} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Total Limit (₹)</Label>
                      <Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Current Outstanding (₹)</Label>
                    <Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-rose-600" />
                  </div>
                </div>
              )}

              {activeTab === 'private' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Counterparty Name</Label>
                    <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Person Name" className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Principal Amount (₹)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Enrollment Date</Label>
                      <Popover open={isDebtDatePickerOpen} onOpenChange={setIsDebtDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-14 rounded-2xl bg-slate-50 border-none font-bold w-full text-left justify-between">
                            {debtDate ? format(debtDate, "MMM dd, yyyy") : "Pick date"}
                            <CalendarIcon className="h-4 w-4 opacity-20" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <HorizontalDatePicker selectedDate={debtDate} onSelect={(date) => { setDebtDate(date); setIsDebtDatePickerOpen(false); }} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 shrink-0 border-t">
            <Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-[#0FA5A0] hover:bg-[#176E6C] text-white font-black uppercase tracking-widest shadow-xl border-none">
              Commit Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
