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

/**
 * @fileOverview Debt & Loans Portfolio
 */
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

  // LOGICAL AUTOMATION
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
      setYearlyInterest((parseFloat(monthlyInterest) * 12).toString());
    }
  }, [monthlyInterest]);

  useEffect(() => {
    if (cardOutstanding && !isNaN(parseFloat(cardOutstanding))) {
      setCardMinPayment(Math.ceil(parseFloat(cardOutstanding) * 0.05).toString());
    }
  }, [cardOutstanding]);

  const sortedLoans = useMemo(() => {
    if (!bankLoans) return [];
    return [...bankLoans].sort((a, b) => parseInt(a.paymentDate || '0') - parseInt(b.paymentDate || '0'));
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
      addBankLoan({ bankName, totalLoan: parseFloat(totalLoan), balanceLoan: parseFloat(balanceLoan), totalTenure: parseFloat(totalTenure || '0'), monthlyEmi: parseFloat(monthlyEmi || '0'), pendingTenure: parseFloat(pendingTenure || '0'), interest: parseFloat(interest || '0'), paymentDate, startDate });
    } else if (activeTab === 'cards') {
      if (!bankName || !cardOutstanding) return;
      addCreditCard({ bankName, dueDate: cardDueDate, totalLimit: parseFloat(cardTotalLimit || '0'), outstandingAmount: parseFloat(cardOutstanding), minimumPayment: parseFloat(cardMinPayment || '0') });
    } else if (activeTab === 'private') {
      if (!personName || !amount) return;
      addPrivateDebt({ personName, amount: parseFloat(amount), date: debtDate, interestRate: parseFloat(privateInterestRate || '0'), monthlyInterest: parseFloat(monthlyInterest || '0'), yearlyInterest: parseFloat(yearlyInterest || '0') });
    }
    toast({ title: "Audit Recorded", description: "Account synchronized with debt portfolio." });
    resetForms(); setIsEntryDialogOpen(false);
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

  const getProgressClass = (val: number) => {
    if (val < 33) return "progress-red";
    if (val < 66) return "progress-yellow";
    return "progress-green";
  };

  const SummaryCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <Card className="premium-card p-8 flex items-center gap-6">
      <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10 max-w-7xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <PageHeader title="Debt & Loans" description="PRECISION AUDIT OF LIABILITIES" className="mb-0" />
        <div className="flex items-center gap-4">
          <Button onClick={() => { resetForms(); setIsEntryDialogOpen(true); }} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-primary hover:bg-secondary-foreground text-white gap-2 shadow-xl border-none">
            <PlusCircle className="h-5 w-5 text-accent" />
            Add Account
          </Button>
          <div className="px-6 py-3 bg-neutral-900 rounded-2xl text-white flex items-center gap-4 shadow-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div><p className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Net Debt</p><p className="text-xl font-black tracking-tight">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard title="Monthly EMI" value={totalMonthlyEmi} icon={ReceiptIndianRupee} color="bg-emerald-600" />
        <SummaryCard title="Bank Loans" value={totalLoanBalance} icon={Landmark} color="bg-blue-600" />
        <SummaryCard title="Card Debt" value={totalCreditCardDebt} icon={CreditCard} color="bg-indigo-600" />
        <SummaryCard title="Private Debt" value={totalPrivateDebt} icon={Banknote} color="bg-rose-600" />
      </div>

      <div className="w-full">
        <Tabs defaultValue="loans" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 p-1.5 bg-[#e7eddc] rounded-2xl grid grid-cols-3 h-14 max-w-2xl mx-auto shadow-inner">
            <TabsTrigger value="loans" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">Bank Loans</TabsTrigger>
            <TabsTrigger value="cards" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">Credit Cards</TabsTrigger>
            <TabsTrigger value="private" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">Private Debt</TabsTrigger>
          </TabsList>

          <TabsContent value="loans">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-blue-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Landmark className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Bank Loan Audit</CardTitle></div>
                    <CardDescription className="text-blue-100/60 text-xs font-black uppercase tracking-[0.2em]">Real-time principal reduction tracking</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalLoanBalance.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase pl-10 py-6">Bank Name</TableHead>
                      <TableHead className="text-[10px] font-black uppercase">Repayment Progress</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Principal Bal</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-right">Next EMI</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLoans.map((loan) => {
                      const progress = loan.totalLoan > 0 ? ((loan.totalLoan - loan.balanceLoan) / loan.totalLoan) * 100 : 0;
                      return (
                        <TableRow key={loan.id} className="group hover:bg-neutral-50 transition-all border-neutral-100">
                          <TableCell className="pl-10 py-8"><span className="text-[16px] font-black">{loan.bankName}</span></TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="space-y-2 py-2">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                <span>{progress.toFixed(0)}% Repaid</span>
                                <span className="text-orange-600">{Math.round(loan.pendingTenure)} Months Left</span>
                              </div>
                              <Progress value={progress} className="h-1.5 bg-neutral-100" indicatorClassName={getProgressClass(progress)} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right"><p className="text-[16px] font-black text-neutral-900">₹{loan.balanceLoan.toLocaleString()}</p><p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Of ₹{loan.totalLoan.toLocaleString()}</p></TableCell>
                          <TableCell className="text-right text-[16px] font-black">₹{loan.monthlyEmi.toLocaleString()}</TableCell>
                          <TableCell className="pr-10 text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(loan, 'loan')} className="h-9 w-9 rounded-xl bg-neutral-100"><Pencil className="h-4 w-4 text-primary" /></Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-indigo-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><CreditCard className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Credit Card Debt</CardTitle></div>
                    <CardDescription className="text-indigo-100/60 text-xs font-black uppercase tracking-[0.2em]">Active Revolving Debt Audit</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalCreditCardDebt.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50"><TableRow><TableHead className="text-[10px] font-black uppercase pl-10 py-6">Issuer</TableHead><TableHead className="text-[10px] font-black uppercase">Due Date</TableHead><TableHead className="text-[10px] font-black uppercase text-right">Limit</TableHead><TableHead className="text-[10px] font-black uppercase text-right">Outstanding</TableHead><TableHead className="w-[100px]"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {creditCards?.map((card) => (
                      <TableRow key={card.id} className="group hover:bg-neutral-50 border-neutral-100">
                        <TableCell className="pl-10 py-8 text-[16px] font-black">{card.bankName}</TableCell>
                        <TableCell className="text-[10px] font-black text-muted-foreground uppercase">{card.dueDate || 'N/A'}</TableCell>
                        <TableCell className="text-right text-[14px] font-bold text-muted-foreground">₹{card.totalLimit.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[16px] font-black text-rose-600">₹{card.outstandingAmount.toLocaleString()}</TableCell>
                        <TableCell className="pr-10 text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(card, 'card')} className="h-9 w-9 rounded-xl bg-neutral-100"><Pencil className="h-4 w-4 text-primary" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-rose-600 text-white p-10 py-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3"><Banknote className="h-6 w-6" /><CardTitle className="text-2xl font-black tracking-tight leading-none uppercase">Private Debt</CardTitle></div>
                    <CardDescription className="text-rose-100/60 text-xs font-black uppercase tracking-[0.2em]">Personal & Local Interest Tracking</CardDescription>
                  </div>
                  <p className="text-4xl font-black tracking-tighter">₹{totalPrivateDebt.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-50"><TableRow><TableHead className="text-[10px] font-black uppercase pl-10 py-6">Lender</TableHead><TableHead className="text-[10px] font-black uppercase text-center">Interest Rate</TableHead><TableHead className="text-[10px] font-black uppercase text-right">Monthly Int.</TableHead><TableHead className="text-[10px] font-black uppercase text-right">Total Amount</TableHead><TableHead className="w-[100px]"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {privateDebts?.map((debt) => (
                      <TableRow key={debt.id} className="group hover:bg-neutral-50 border-neutral-100">
                        <TableCell className="pl-10 py-8 text-[16px] font-black">{debt.personName}</TableCell>
                        <TableCell className="text-center"><span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase">{debt.interestRate}% P.M.</span></TableCell>
                        <TableCell className="text-right text-[14px] font-black text-rose-600">₹{(debt.monthlyInterest || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[16px] font-black">₹{debt.amount.toLocaleString()}</TableCell>
                        <TableCell className="pr-10 text-right"><Button variant="ghost" size="icon" onClick={() => handleEditClick(debt, 'private')} className="h-9 w-9 rounded-xl bg-neutral-100"><Pencil className="h-4 w-4 text-primary" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ENTRY DIALOG */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="bg-neutral-900 p-8 text-left text-white">
            <div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-primary/20 text-primary"><Plus className="h-5 w-5" /></div><DialogTitle className="text-xl font-black uppercase tracking-tight">Debt Entry</DialogTitle></div>
            <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Enroll new financial liability into portfolio</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            {activeTab === 'loans' && (
              <div className="space-y-6">
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="form-input-tactical" />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} placeholder="Total Loan" className="form-input-tactical" />
                  <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Int %" className="form-input-tactical" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input-tactical" />
                  <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} placeholder="Monthly EMI" className="form-input-tactical font-black" />
                </div>
              </div>
            )}
            <Button onClick={handleAdd} className="w-full h-16 rounded-2xl bg-primary hover:bg-secondary-foreground text-white font-black uppercase tracking-widest shadow-xl border-none">Record Account</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}