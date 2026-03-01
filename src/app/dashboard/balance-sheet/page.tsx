
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, CreditCard, Banknote, Landmark, Trash2, Pencil, Save, X, Info, Calendar as CalendarIcon } from 'lucide-react';
import { useFarm } from '@/context/FarmContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function BalanceSheetPage() {
  const { toast } = useToast();
  const { 
    bankLoans, addBankLoan, updateBankLoan, deleteBankLoan,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    privateDebts, addPrivateDebt, updatePrivateDebt, deletePrivateDebt,
    totalLoanBalance, totalCreditCardDebt, totalPrivateDebt
  } = useFarm();

  const [activeTab, setActiveTab] = useState('loans');

  // Form states
  const [bankName, setBankName] = useState('');
  const [totalLoan, setTotalLoan] = useState('');
  const [balanceLoan, setBalanceLoan] = useState('');
  const [totalTenure, setTotalTenure] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [pendingTenure, setPendingTenure] = useState('');
  const [interest, setInterest] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  
  // Credit Card Form States
  const [cardDueDate, setCardDueDate] = useState('');
  const [cardTotalLimit, setCardTotalLimit] = useState('');
  const [cardOutstanding, setCardOutstanding] = useState('');
  const [cardMinPayment, setCardMinPayment] = useState('');

  // Private Debt Form States
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [debtDate, setDebtDate] = useState('');
  const [monthlyInterest, setMonthlyInterest] = useState('');
  const [yearlyInterest, setYearlyInterest] = useState('');

  // Edit States
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // SORTING LOGIC
  const sortedLoans = useMemo(() => {
    if (!bankLoans) return [];
    return [...bankLoans].sort((a, b) => {
      const dayA = parseInt(a.paymentDate?.replace(/\D/g, '') || '0');
      const dayB = parseInt(b.paymentDate?.replace(/\D/g, '') || '0');
      return dayA - dayB;
    });
  }, [bankLoans]);

  const sortedCards = useMemo(() => {
    if (!creditCards) return [];
    return [...creditCards].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [creditCards]);

  const sortedPrivate = useMemo(() => {
    if (!privateDebts) return [];
    return [...privateDebts].sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
  }, [privateDebts]);

  // AUTOMATION: Private Debt Yearly Interest Calculation
  useEffect(() => {
    if (monthlyInterest && !isNaN(parseFloat(monthlyInterest))) {
      const calculatedYearly = parseFloat(monthlyInterest) * 12;
      setYearlyInterest(calculatedYearly.toString());
    }
  }, [monthlyInterest]);

  // AUTOMATION: Credit Card Minimum Payment Suggestion (5%)
  useEffect(() => {
    if (cardOutstanding && !isNaN(parseFloat(cardOutstanding))) {
      const suggestedMin = Math.ceil(parseFloat(cardOutstanding) * 0.05);
      setCardMinPayment(suggestedMin.toString());
    }
  }, [cardOutstanding]);

  const resetForms = () => {
    setBankName('');
    setTotalLoan('');
    setBalanceLoan('');
    setTotalTenure('');
    setMonthlyEmi('');
    setPendingTenure('');
    setInterest('');
    setPaymentDate('');
    setPersonName('');
    setAmount('');
    setDebtDate('');
    setMonthlyInterest('');
    setYearlyInterest('');
    setCardDueDate('');
    setCardTotalLimit('');
    setCardOutstanding('');
    setCardMinPayment('');
  };

  const handleAdd = () => {
    if (activeTab === 'loans') {
      if (!bankName || !totalLoan || !balanceLoan) return;
      addBankLoan({ 
        bankName, 
        totalLoan: parseFloat(totalLoan), 
        balanceLoan: parseFloat(balanceLoan),
        totalTenure: parseFloat(totalTenure || '0'),
        monthlyEmi: parseFloat(monthlyEmi || '0'),
        pendingTenure: parseFloat(pendingTenure || '0'),
        interest: parseFloat(interest || '0'),
        paymentDate
      });
      toast({ title: "Loan Recorded", description: "Bank loan entry added successfully." });
    } else if (activeTab === 'cards') {
      if (!bankName || !cardOutstanding) return;
      addCreditCard({ 
        bankName, 
        dueDate: cardDueDate,
        totalLimit: parseFloat(cardTotalLimit || '0'),
        outstandingAmount: parseFloat(cardOutstanding),
        minimumPayment: parseFloat(cardMinPayment || '0')
      });
      toast({ title: "Card Recorded", description: "Credit card entry added successfully." });
    } else if (activeTab === 'private') {
      if (!personName || !amount) return;
      addPrivateDebt({ 
        personName, 
        amount: parseFloat(amount),
        date: debtDate,
        monthlyInterest: parseFloat(monthlyInterest || '0'),
        yearlyInterest: parseFloat(yearlyInterest || '0')
      });
      toast({ title: "Debt Recorded", description: "Private debt entry added successfully." });
    }
    resetForms();
  };

  const handleEditClick = (item: any, type: string) => {
    setEditingItem({ ...item, _type: type });
    if (type === 'loan') {
      setBankName(item.bankName);
      setTotalLoan(item.totalLoan.toString());
      setBalanceLoan(item.balanceLoan.toString());
      setTotalTenure(item.totalTenure.toString());
      setMonthlyEmi(item.monthlyEmi.toString());
      setPendingTenure(item.pendingTenure.toString());
      setInterest(item.interest.toString());
      setPaymentDate(item.paymentDate || '');
    } else if (type === 'card') {
      setBankName(item.bankName);
      setCardDueDate(item.dueDate || '');
      setCardTotalLimit(item.totalLimit.toString());
      setCardOutstanding(item.outstandingAmount.toString());
      setCardMinPayment(item.minimumPayment.toString());
    } else if (type === 'private') {
      setPersonName(item.personName);
      setAmount(item.amount.toString());
      setDebtDate(item.date || '');
      setMonthlyInterest(item.monthlyInterest?.toString() || '');
      setYearlyInterest(item.yearlyInterest?.toString() || '');
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (editingItem._type === 'loan') {
      updateBankLoan(editingItem.id, {
        bankName,
        totalLoan: parseFloat(totalLoan),
        balanceLoan: parseFloat(balanceLoan),
        totalTenure: parseFloat(totalTenure),
        monthlyEmi: parseFloat(monthlyEmi),
        pendingTenure: parseFloat(pendingTenure),
        interest: parseFloat(interest),
        paymentDate
      }, editingItem._path);
    } else if (editingItem._type === 'card') {
      updateCreditCard(editingItem.id, {
        bankName,
        dueDate: cardDueDate,
        totalLimit: parseFloat(cardTotalLimit),
        outstandingAmount: parseFloat(cardOutstanding),
        minimumPayment: parseFloat(cardMinPayment)
      }, editingItem._path);
    } else if (editingItem._type === 'private') {
      updatePrivateDebt(editingItem.id, {
        personName,
        amount: parseFloat(amount),
        date: debtDate,
        monthlyInterest: parseFloat(monthlyInterest),
        yearlyInterest: parseFloat(yearlyInterest)
      }, editingItem._path);
    }

    toast({ title: "Update Success", description: "The record has been updated." });
    setIsEditDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const SummaryCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl text-white", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-black tracking-tighter">₹{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-10">
      <PageHeader
        title="Financial Balance Sheet"
        description="Comprehensive audit of loans, credit cards, and private debts."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Bank Loan Balance" value={totalLoanBalance} icon={Landmark} color="bg-blue-600" />
        <SummaryCard title="Credit Card Debt" value={totalCreditCardDebt} icon={CreditCard} color="bg-indigo-600" />
        <SummaryCard title="Private Debts" value={totalPrivateDebt} icon={Banknote} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-4">
          <Card className="border-primary/20 bg-accent/5 sticky top-24 rounded-[2rem] shadow-xl overflow-hidden">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="text-white text-xl font-black tracking-tight">Record Entry</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Add to your active ledger</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {activeTab === 'loans' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Name</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Axis Bank" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">EMI Day (1-31)</Label>
                      <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="e.g. 5" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Loan (₹)</Label>
                      <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance (₹)</Label>
                      <Input type="number" value={balanceLoan} onChange={(e) => setBalanceLoan(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-destructive" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Tenure (Months)</Label>
                      <Input type="number" value={totalTenure} onChange={(e) => setTotalTenure(e.target.value)} placeholder="60" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly EMI (₹)</Label>
                      <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Tenure (Months)</Label>
                      <Input type="number" value={pendingTenure} onChange={(e) => setPendingTenure(e.target.value)} placeholder="24" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold text-orange-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Interest (%)</Label>
                      <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="0.0" step="0.1" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'cards' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. AXIS Cash Back" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Due Date</Label>
                      <Input type="date" value={cardDueDate} onChange={(e) => setCardDueDate(e.target.value)} className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Limit (₹)</Label>
                      <Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Outstanding (₹)</Label>
                      <Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                        Min. Payment (₹)
                        <Info className="h-2 w-2 text-primary" />
                      </Label>
                      <Input type="number" value={cardMinPayment} onChange={(e) => setCardMinPayment(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'private' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date</Label>
                    <Input type="date" value={debtDate} onChange={(e) => setDebtDate(e.target.value)} className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Person Name</Label>
                    <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="e.g. Kalyan" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Amount (₹)</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Interest (₹)</Label>
                      <Input type="number" value={monthlyInterest} onChange={(e) => setMonthlyInterest(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                        Yearly Interest (₹)
                      </Label>
                      <Input type="number" value={yearlyInterest} onChange={(e) => setYearlyInterest(e.target.value)} placeholder="0" className="h-12 rounded-xl bg-white border-none shadow-sm font-bold bg-muted/20" />
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleAdd} className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Entry
              </Button>

              <div className="pt-6 border-t border-primary/10">
                <div className="p-4 rounded-2xl text-center bg-destructive/5 text-destructive">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Total Active Liability</p>
                  <p className="text-2xl font-black tracking-tighter">₹{(totalLoanBalance + totalCreditCardDebt + totalPrivateDebt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Views */}
        <div className="lg:col-span-8 overflow-hidden">
          <Tabs defaultValue="loans" onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 p-1 bg-muted/50 rounded-2xl grid grid-cols-3">
              <TabsTrigger value="loans" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Bank Loans</TabsTrigger>
              <TabsTrigger value="cards" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Credit Cards</TabsTrigger>
              <TabsTrigger value="private" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Private Debts</TabsTrigger>
            </TabsList>

            <TabsContent value="loans">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-blue-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Bank Loan Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalLoanBalance.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase">SNO</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Bank Name</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Progress</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Total Loan</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Balance</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">EMI</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Interest</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLoans.map((loan, idx) => {
                        const progress = loan.totalLoan > 0 ? ((loan.totalLoan - loan.balanceLoan) / loan.totalLoan) * 100 : 0;
                        return (
                          <TableRow key={loan.id} className="group">
                            <TableCell className="text-[10px] font-bold text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold whitespace-nowrap">{loan.bankName}</span>
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{loan.totalTenure || 'N/A'} Months Total</span>
                                {loan.paymentDate && (
                                  <span className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1 mt-0.5">
                                    <CalendarIcon className="h-2 w-2" />
                                    EMI: {loan.paymentDate}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[100px]">
                              <div className="space-y-1">
                                <Progress value={progress} className="h-1 bg-neutral-100" />
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                                  <span className="text-emerald-600">{progress.toFixed(0)}% Clear</span>
                                  <span className="text-orange-600">{loan.pendingTenure || 'N/A'} Left</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-right">₹{loan.totalLoan.toLocaleString()}</TableCell>
                            <TableCell className="text-xs font-black text-right text-destructive">₹{loan.balanceLoan.toLocaleString()}</TableCell>
                            <TableCell className="text-xs font-bold text-right text-primary">₹{(loan.monthlyEmi || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{loan.interest ? `${loan.interest}%` : 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(loan, 'loan')}>
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteBankLoan(loan.id, loan._path)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!sortedLoans.length && <TableRow><TableCell colSpan={8} className="text-center py-10 opacity-20 italic">No bank loans recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cards">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-indigo-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Credit Card Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalCreditCardDebt.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase">SNO</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Bank Name</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Usage</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Due Date</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Limit</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Outstanding</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Min. Pay</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCards.map((card, idx) => {
                        const usage = card.totalLimit > 0 ? (card.outstandingAmount / card.totalLimit) * 100 : 0;
                        return (
                          <TableRow key={card.id} className="group">
                            <TableCell className="text-[10px] font-bold text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell className="text-xs font-bold">{card.bankName}</TableCell>
                            <TableCell className="min-w-[80px]">
                               <div className="space-y-1">
                                  <Progress value={usage} className={cn("h-1", usage > 80 ? "bg-red-100" : "bg-neutral-100")} />
                                  <span className={cn("text-[8px] font-black", usage > 80 ? "text-destructive" : "text-muted-foreground")}>{usage.toFixed(0)}%</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{card.dueDate || 'N/A'}</TableCell>
                            <TableCell className="text-xs font-medium text-right">₹{(card.totalLimit || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-xs font-black text-right text-destructive">₹{card.outstandingAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-xs font-bold text-right text-orange-600">₹{(card.minimumPayment || 0).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(card, 'card')}>
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCreditCard(card.id, card._path)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!sortedCards.length && <TableRow><TableCell colSpan={8} className="text-center py-10 opacity-20 italic">No credit cards recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="private">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-rose-600 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-black tracking-tight">Private Debt Ledger</CardTitle>
                    <p className="text-lg font-black">₹{totalPrivateDebt.toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[9px] font-black uppercase">SNO</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Date</TableHead>
                        <TableHead className="text-[9px] font-black uppercase">Person</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Total Amount</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Monthly Int.</TableHead>
                        <TableHead className="text-[9px] font-black uppercase text-right">Yearly Int.</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPrivate.map((debt, idx) => (
                        <TableRow key={debt.id} className="group">
                          <TableCell className="text-[10px] font-bold text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{debt.date || 'N/A'}</TableCell>
                          <TableCell className="text-xs font-bold">{debt.personName}</TableCell>
                          <TableCell className="text-xs font-black text-right text-destructive">₹{debt.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-medium text-right text-muted-foreground">₹{(debt.monthlyInterest || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-black text-right text-rose-600">₹{(debt.yearlyInterest || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(debt, 'private')}>
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePrivateDebt(debt.id, debt._path)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!sortedPrivate.length && <TableRow><TableCell colSpan={7} className="text-center py-10 opacity-20 italic">No private debts recorded</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Edit Entry</DialogTitle>
            <DialogDescription>Update details for your financial liability records.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {editingItem?._type === 'loan' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">EMI Day (1-31)</Label>
                    <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Loan (₹)</Label>
                    <Input type="number" value={totalLoan} onChange={(e) => setTotalLoan(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Balance (₹)</Label>
                    <Input type="number" value={balanceLoan} onChange={(e) => setBalanceLoan(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black text-destructive" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Months</Label>
                    <Input type="number" value={totalTenure} onChange={(e) => setTotalTenure(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly EMI (₹)</Label>
                    <Input type="number" value={monthlyEmi} onChange={(e) => setMonthlyEmi(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Months</Label>
                    <Input type="number" value={pendingTenure} onChange={(e) => setPendingTenure(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Interest (%)</Label>
                    <Input type="number" value={interest} onChange={(e) => setInterest(e.target.value)} step="0.1" className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                  </div>
                </div>
              </>
            )}

            {editingItem?._type === 'card' && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Name</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Due Date</Label>
                    <Input type="date" value={cardDueDate} onChange={(e) => setCardDueDate(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Limit (₹)</Label>
                    <Input type="number" value={cardTotalLimit} onChange={(e) => setCardTotalLimit(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Outstanding (₹)</Label>
                    <Input type="number" value={cardOutstanding} onChange={(e) => setCardOutstanding(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Min. Payment (₹)</Label>
                    <Input type="number" value={cardMinPayment} onChange={(e) => setCardMinPayment(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                  </div>
                </div>
              </>
            )}

            {editingItem?._type === 'private' && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date</Label>
                  <Input type="date" value={debtDate} onChange={(e) => setDebtDate(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Person Name</Label>
                  <Input value={personName} onChange={(e) => setPersonName(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Amount (₹)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Interest (₹)</Label>
                    <Input type="number" value={monthlyInterest} onChange={(e) => setMonthlyInterest(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Yearly Interest (₹)</Label>
                    <Input type="number" value={yearlyInterest} onChange={(e) => setYearlyInterest(e.target.value)} className="h-12 rounded-xl bg-accent/5 border-none shadow-sm font-bold bg-muted/20" />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleSaveEdit} className="rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 px-8">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
